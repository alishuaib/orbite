import { NextApiRequest, NextApiResponse } from "next/types"
import withApiKeyVerification, {
	Authorization,
} from "@/lib/middleware/checkAuth"
import prisma from "@/lib/prisma-client"
import { z } from "zod"
import { deleteEmbedding } from "@/lib/embedding"
import { cascadeCleanup } from "@/lib/contentManager"

//
// Module API
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
			module: z.object({
				id: z.array(z.number()).optional(),
			}),
		})
		try {
			return schema.parse(body)
		} catch (error) {
			console.log(error)
			throw new Error(`Invalid module object for GET: ${error}`)
		}
	}
	try {
		const body = validateGET(req.body)
		let find = await prisma.module.findMany({
			where: {
				auth_id: auth.id,
				id: {
					//If given a list of ids, return those modules
					//Otherwise, return all modules
					in:
						body.module.id == undefined ||
						!Array.isArray(body.module.id)
							? undefined
							: body.module.id,
				},
			},
			include: {
				parent: true,
				contents: true,
			},
		})
		if (find.length == 0) {
			throw new Error(`No modules found with ids: ${body.module.id}`)
		}
		res.status(200).json({
			route: `${req.query.method}::${req.url}`,
			isSuccess: true,
			message: "Module(s) found successfully",
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
			section: z.object({
				id: z.number(),
			}),
			module: z.object({
				id: z.number(),
				title: z.string(),
				summary: z.string().optional(),
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
			throw new Error(`Invalid module object for POST: ${error}`)
		}
	}
	try {
		const body = validatePOST(req.body)
		let create = await prisma.module.create({
			data: {
				...body.module,
				auth: {
					connect: {
						id: auth.id,
					},
				},
				parent: {
					connect: {
						id: body.section.id,
					},
				},
			},
		})
		res.status(200).json({
			route: `${req.query.method}::${req.url}`,
			isSuccess: true,
			message: "Module created successfully",
			data: create,
		})
	} catch (error: any) {
		console.log(error)
		if (error.code == "P2025")
			error.message = `Parent section id:${req.body.section.id} not found in-sync with Orbite`
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
			module: z.object({
				id: z.number(),
				title: z.string(),
				summary: z.string().optional(),
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
			throw new Error(`Invalid module object for PATCH: ${error}`)
		}
	}
	try {
		const body = validatePATCH(req.body)
		let update = await prisma.module.update({
			where: {
				auth_id: auth.id,
				id: body.module.id,
			},
			data: {
				...body.module,
			},
		})
		res.status(200).json({
			route: `${req.query.method}::${req.url}`,
			isSuccess: true,
			message: "Modules updated successfully",
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
			module: z.object({
				id: z.array(z.number()),
			}),
		})
		try {
			return schema.parse(body)
		} catch (error) {
			console.log(error)
			throw new Error(`Invalid module object for DELETE: ${error}`)
		}
	}
	try {
		const body = validateDELETE(req.body)

		//Delete Embeddings by module.id
		for (let i = 0; i < body.module.id.length; i++) {
			await deleteEmbedding(auth.handle, body.module.id[i], "module")
		}
		//Delete Module
		let del = await prisma.module.deleteMany({
			where: {
				auth_id: auth.id,
				id: {
					in: body.module.id,
				},
			},
		})
		if (del.count == 0) {
			throw new Error(`No modules found with ids: ${body.module.id}`)
		}
		//Cascade cleanup
		await cascadeCleanup(auth.id)

		res.status(200).json({
			route: `${req.query.method}::${req.url}`,
			isSuccess: true,
			message: "Modules deleted successfully",
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
