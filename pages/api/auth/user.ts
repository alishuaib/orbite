import { NextApiRequest, NextApiResponse } from "next/types"
import withApiKeyVerification, {
	Authorization,
} from "@/lib/middleware/checkAuth"
import prisma from "@/lib/prisma-client"
import { z } from "zod"

//
// Course API
//
export default async (req: NextApiRequest, res: NextApiResponse) => {
	const { query } = req
	console.log("api/v1/user", query.method, req.method)
	if (query.method == undefined || req.method != "POST") {
		console.log("No method provided in query")
		res.status(400).json({
			route: `${req.url}`,
			isSuccess: false,
			message: "No method provided in query",
			data: null,
		})
		return
	}

	switch ((query.method as string).toUpperCase()) {
		case "GET":
			await GET(req, res)
			break
		case "DELETE":
			await DELETE(req, res)
			break
	}
}

async function GET(req: NextApiRequest, res: NextApiResponse) {
	function validateGET(body: any) {
		let schema = z.object({
			user: z.object({
				id: z.string(),
			}),
		})
		try {
			return schema.parse(body)
		} catch (error) {
			console.log(error)
			throw new Error(`Invalid user object for GET: ${error}`)
		}
	}
	try {
		const body = validateGET(req.body)
		console.log(body)
		let find = await prisma.user.findFirst({
			where: {
				id: body.user.id,
			},
			include: {
				config: true,
				auth: true,
			},
		})
		if (!find) {
			throw new Error(`No user found with id: ${body.user.id}`)
		}
		res.status(200).json({
			route: `${req.query.method}::${req.url}`,
			isSuccess: true,
			message: "User found successfully",
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

async function DELETE(req: NextApiRequest, res: NextApiResponse) {
	function validateGET(body: any) {
		let schema = z.object({
			user: z.object({
				id: z.string(),
			}),
		})
		try {
			return schema.parse(body)
		} catch (error) {
			console.log(error)
			throw new Error(`Invalid user object for DELETE: ${error}`)
		}
	}
	try {
		const body = validateGET(req.body)
		console.log(body)
		let find = await prisma.user.delete({
			where: {
				id: body.user.id,
			},
			include: {
				config: true,
				auth: true,
			},
		})
		res.status(200).json({
			route: `${req.query.method}::${req.url}`,
			isSuccess: true,
			message: "User deleted successfully",
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
