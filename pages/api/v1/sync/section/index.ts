import { NextApiRequest, NextApiResponse } from "next/types"
import withApiKeyVerification, {
	Authorization,
} from "@/lib/middleware/checkAuth"
import prisma from "@/lib/prisma-client"
import { z } from "zod"
import { deleteEmbedding } from "@/lib/embedding"
import { cascadeCleanup } from "@/lib/contentManager"

//
// Section API
//
export { GET, POST, PATCH, DELETE }

export default withApiKeyVerification(
	async (req: NextApiRequest, res: NextApiResponse, auth: Authorization) => {
		const { query } = req
		if (query.method == undefined || req.method != "POST") {
			res.status(400).json({
				route: `${req.url}`,
				isSuccess: false,
				message: "No method provided in query",
				data: null,
			})
		}
		switch ((query.method as string).toUpperCase()) {
			case "GET":
				await GET(req, res, auth)
				break
			case "POST":
				await POST(req, res, auth)
				break
			case "PATCH":
				await PATCH(req, res, auth)
				break
			case "DELETE":
				await DELETE(req, res, auth)
				break
		}
	}
)

async function GET(
	req: NextApiRequest,
	res: NextApiResponse,
	auth: Authorization
) {
	function validateGET(body: any) {
		let schema = z.object({
			section: z.object({
				id: z.array(z.number()).optional(),
			}),
		})
		try {
			return schema.parse(body)
		} catch (error) {
			console.log(error)
			throw new Error(`Invalid section object for GET: ${error}`)
		}
	}
	try {
		const body = validateGET(req.body)
		let find = await prisma.section.findMany({
			where: {
				auth_id: auth.id,
				id: {
					//If given a list of ids, return those sections
					//Otherwise, return all sections
					in:
						body.section.id == undefined ||
						!Array.isArray(body.section.id)
							? undefined
							: body.section.id,
				},
			},
			include: {
				parent: true,
				modules: {
					include: {
						contents: true,
					},
				},
			},
		})
		if (find.length == 0) {
			throw new Error(`No sections found with ids: ${body.section.id}`)
		}
		res.status(200).json({
			route: `${req.query.method}::${req.url}`,
			isSuccess: true,
			message: "Sections(s) found successfully",
			data: find,
		})
	} catch (error: any) {
		console.log(error)
		return res.status(400).json({
			route: `${req.query.method}::${req.url}`,
			isSuccess: false,
			message: error.message,
			data: null,
		})
	}
}

async function POST(
	req: NextApiRequest,
	res: NextApiResponse,
	auth: Authorization
) {
	function validatePOST(body: any) {
		console.log(body)
		let schema = z.object({
			course: z.object({
				id: z.number(),
			}),
			section: z.object({
				id: z.number(),
				title: z.string(),
				summary: z.string().optional(),
				order: z.string(),
				visible: z.boolean(),
				url: z.string().optional(),
				version: z.string(),
				meta: z.record(z.any()).optional(),
			}),
		})
		try {
			return schema.parse(body)
		} catch (error) {
			console.log(error)
			throw new Error(`Invalid section object for POST: ${error}`)
		}
	}
	try {
		const body = validatePOST(req.body)
		let create = await prisma.section.create({
			data: {
				...body.section,
				auth: {
					connect: {
						id: auth.id,
					},
				},
				parent: {
					connect: {
						id: body.course.id,
					},
				},
			},
		})
		res.status(200).json({
			route: `${req.query.method}::${req.url}`,
			isSuccess: true,
			message: "Sections created successfully",
			data: create,
		})
	} catch (error: any) {
		console.log(error)
		if (error.code == "P2025")
			error.message = `Parent course id:${req.body.course.id} not found in-sync with Orbite`
		return res.status(400).json({
			route: `${req.query.method}::${req.url}`,
			isSuccess: false,
			message: error.message,
			data: null,
		})
	}
}

async function PATCH(
	req: NextApiRequest,
	res: NextApiResponse,
	auth: Authorization
) {
	function validatePATCH(body: any) {
		let schema = z.object({
			section: z.object({
				id: z.number(),
				title: z.string(),
				summary: z.string().optional(),
				order: z.string(),
				visible: z.boolean(),
				url: z.string().optional(),
				version: z.string(),
				meta: z.record(z.any()).optional(),
			}),
		})
		try {
			return schema.parse(body)
		} catch (error) {
			console.log(error)
			throw new Error(`Invalid section object for PATCH: ${error}`)
		}
	}
	try {
		const body = validatePATCH(req.body)
		let update = await prisma.section.update({
			where: {
				auth_id: auth.id,
				id: body.section.id,
			},
			data: {
				...body.section,
			},
		})
		res.status(200).json({
			route: `${req.query.method}::${req.url}`,
			isSuccess: true,
			message: "Sections updated successfully",
			data: update,
		})
	} catch (error: any) {
		console.log(error)
		return res.status(400).json({
			route: `${req.query.method}::${req.url}`,
			isSuccess: false,
			message: error.message,
			data: null,
		})
	}
}

async function DELETE(
	req: NextApiRequest,
	res: NextApiResponse,
	auth: Authorization
) {
	function validateDELETE(body: any) {
		let schema = z.object({
			section: z.object({
				id: z.array(z.number()),
			}),
		})
		try {
			return schema.parse(body)
		} catch (error) {
			console.log(error)
			throw new Error(`Invalid section object for DELETE: ${error}`)
		}
	}
	try {
		const body = validateDELETE(req.body)
		//Delete Embeddings by section.id
		for (let i = 0; i < body.section.id.length; i++) {
			await deleteEmbedding(auth.handle, body.section.id[i], "section")
		}
		let del = await prisma.section.deleteMany({
			where: {
				auth_id: auth.id,
				id: {
					in: body.section.id,
				},
			},
		})
		if (del.count == 0) {
			throw new Error(`No sections found with ids: ${body.section.id}`)
		}
		//Cascade cleanup
		await cascadeCleanup(auth.id)
		res.status(200).json({
			route: `${req.query.method}::${req.url}`,
			isSuccess: true,
			message: "Sections deleted successfully",
			data: del,
		})
	} catch (error: any) {
		console.log(error)
		return res.status(400).json({
			route: `${req.query.method}::${req.url}`,
			isSuccess: false,
			message: error.message,
			data: null,
		})
	}
}
