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
		let find = await prisma.user.findFirst({
			where: {
				id: body.user.id,
			},
			include: {
				org: true,
				config: true,
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

async function DELETE(
	req: NextApiRequest,
	res: NextApiResponse,
	auth: Authorization
) {
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
		let find = await prisma.user.delete({
			where: {
				id: body.user.id,
			},
			include: {
				org: true,
				config: true,
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
