import { NextApiRequest, NextApiResponse } from "next/types"
import withApiKeyVerification, {
	Authorization,
} from "@/lib/middleware/checkAuth"
import { z } from "zod"
import {
	downloadForm,
	createContent,
	deleteContent,
	getContent,
} from "@/lib/contentManager"
import formidable from "formidable"

export const config = {
	api: {
		bodyParser: false,
	},
}
interface FormidableResult {
	err: any | null
	fields: formidable.Fields
	files: formidable.Files
}

//
// Create a new content item
//
export default withApiKeyVerification(
	async (req: NextApiRequest, res: NextApiResponse, auth: Authorization) => {
		let form = await downloadForm(req)
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
				req.body = form.fields
				await GET(req, res, auth)
				break
			case "POST":
				req.body = form
				await POST(req, res, auth)
				break
			case "PATCH":
				req.body = form
				await PATCH(req, res, auth)
				break
			case "DELETE":
				req.body = form.fields
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
			content: z.object({
				id: z.array(z.number()).optional(),
			}),
		})
		try {
			return schema.parse(body)
		} catch (error) {
			console.log(error)
			throw new Error(`Invalid content object for GET: ${error}`)
		}
	}
	try {
		const body = validateGET(req.body)
		await getContent(req, res, auth, body.content.id)
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
		//TODO: SETUP SCHEMA
		let schema = z.object({
			fields: z.object({
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
			}),
			files: z.array(z.any()),
			err: z.any().optional(),
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
		await createContent(req, res, auth, body)
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
		//TODO: SETUP SCHEMA
		let schema = z.object({
			fields: z.object({
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
			}),
			files: z.array(z.any()),
			err: z.any().optional(),
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
		await createContent(req, res, auth, body, true)
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
			content: z.object({
				id: z.array(z.number()),
			}),
		})
		try {
			return schema.parse(body)
		} catch (error) {
			console.log(error)
			throw new Error(`Invalid content object for DELETE: ${error}`)
		}
	}
	try {
		const body = validateDELETE(req.body)
		await deleteContent(req, res, auth, body.content.id)
	} catch (error: any) {
		return res.status(400).json({
			route: `${req.query.method}::${req.url}`,
			isSuccess: false,
			message: error.message,
			data: null,
		})
	}
}
