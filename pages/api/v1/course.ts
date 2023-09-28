import { NextApiRequest, NextApiResponse } from "next/types"
import withApiKeyVerification, {
	Authorization,
} from "@/lib/middleware/checkAuth"
import prisma from "@/lib/prisma-client"
import { z } from "zod"

//
// Course API
//
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
			course: z.object({
				id: z.array(z.number()).optional(),
			}),
		})
		try {
			return schema.parse(body)
		} catch (error) {
			console.log(error)
			throw new Error(`Invalid course object for GET: ${error}`)
		}
	}
	try {
		const body = validateGET(req.body)
		let find = await prisma.course.findMany({
			where: {
				auth_id: auth.id,
				id: {
					//If given a list of ids, return those courses
					//Otherwise, return all courses
					in:
						body.course.id == undefined ||
						!Array.isArray(body.course.id)
							? undefined
							: body.course.id,
				},
			},
			include: {
				sections: {
					include: {
						modules: {
							include: {
								contents: true,
							},
						},
					},
				},
			},
		})
		if (find.length == 0) {
			throw new Error(`No courses found with ids: ${body.course.id}`)
		}
		res.status(200).json({
			route: `${req.query.method}::${req.url}`,
			isSuccess: true,
			message: "Course(s) found successfully",
			data: find,
		})
	} catch (error: any) {
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
				title: z.string(),
				label: z.string().optional(),
				summary: z.string().optional(),
				icon: z.string().optional(),
				visible: z.boolean(),
				url: z.string().optional(),
				namespace: z.string().optional(),
				category: z.string().optional(),
				tags: z.string().optional(),
				version: z.string(),
				meta: z.record(z.any()).optional(),
			}),
		})
		try {
			return schema.parse(body)
		} catch (error) {
			console.log(error)
			throw new Error(`Invalid course object for POST: ${error}`)
		}
	}
	try {
		const body = validatePOST(req.body)
		let create = await prisma.course.create({
			data: {
				...body.course,
				auth: {
					connect: {
						id: auth.id,
					},
				},
			},
		})
		res.status(200).json({
			route: `${req.query.method}::${req.url}`,
			isSuccess: true,
			message: "Courses created successfully",
			data: create,
		})
	} catch (error: any) {
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
			course: z.object({
				id: z.number(),
				title: z.string().optional(),
				label: z.string().optional(),
				summary: z.string().optional(),
				icon: z.string().optional(),
				visible: z.boolean().optional(),
				url: z.string().optional(),
				namespace: z.string().optional(),
				category: z.string().optional(),
				tags: z.string().optional(),
				version: z.string(), // Require version to be updated
				meta: z.record(z.any()).optional(),
			}),
		})
		try {
			return schema.parse(body)
		} catch (error) {
			console.log(error)
			throw new Error(`Invalid course object for PATCH: ${error}`)
		}
	}
	try {
		const body = validatePATCH(req.body)
		let update = await prisma.course.update({
			where: {
				auth_id: auth.id,
				id: body.course.id,
			},
			data: {
				...body.course,
			},
		})
		res.status(200).json({
			route: `${req.query.method}::${req.url}`,
			isSuccess: true,
			message: "Courses updated successfully",
			data: update,
		})
	} catch (error: any) {
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
			course: z.object({
				id: z.array(z.number()),
			}),
		})
		try {
			return schema.parse(body)
		} catch (error) {
			console.log(error)
			throw new Error(`Invalid course object for DELETE: ${error}`)
		}
	}
	try {
		const body = validateDELETE(req.body)
		let del = await prisma.course.deleteMany({
			where: {
				auth_id: auth.id,
				id: {
					in: body.course.id,
				},
			},
		})
		if (del.count == 0) {
			throw new Error(`No courses found with ids: ${body.course.id}`)
		}
		res.status(200).json({
			route: `${req.query.method}::${req.url}`,
			isSuccess: true,
			message: "Courses deleted successfully",
			data: del,
		})
	} catch (error: any) {
		return res.status(400).json({
			route: `${req.query.method}::${req.url}`,
			isSuccess: false,
			message: error.message,
			data: null,
		})
	}
}
