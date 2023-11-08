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
	ContentBodySchema,
} from "@/lib/contentManager"
import formidable from "formidable"
import fs from "fs"
import prisma from "@/lib/prisma-client"

export const config = {
	api: {
		bodyParser: false,
	},
}

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
			case "PATCH":
				req.body = form
				await PATCH(req, res, auth)
				break
			default:
				res.status(400).json({
					route: `${req.url}`,
					isSuccess: false,
					message: "Invalid method",
					data: null,
				})
		}
	}
)

async function PATCH(
	req: NextApiRequest,
	res: NextApiResponse,
	auth: Authorization
) {
	function validatePATCH(body: any) {
		body.fields.body = JSON.parse(body.fields.body) //Parse JSON body
		let schema = z.object({
			fields: z.object({
				body: z.object({
					chatCustomization: z.object({
						id: z.number(),
						primary_color: z.string(),
						secondary_color: z.string(),
						logo: z.string().optional().nullable(),
					}),
				}),
			}),
			files: z.object({ file: z.array(z.any()).optional() }).optional(),
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
		if (body.files && body.files.file) {
			// Store image
			const imageFile = body.files.file[0] as formidable.File
			if (imageFile.size > 30 * 1024) throw new Error("Image too large")
			const imageBuffer = fs.readFileSync(imageFile.filepath)
			const base64Image = imageBuffer.toString("base64")

			body.fields.body.chatCustomization.logo = `data:image/jpeg;base64,${base64Image}`
		}

		let update = await prisma.chatCustomization.update({
			where: {
				id: body.fields.body.chatCustomization.id,
			},
			data: {
				...body.fields.body.chatCustomization,
			},
		})

		return res.status(200).json({
			route: `${req.url}`,
			isSuccess: true,
			message: "Successfully uploaded image",
			data: update,
		})
	} catch (error: any) {
		console.log(error)
		return res.status(400).json({
			route: `${req.url}`,
			isSuccess: false,
			message: error.message,
			data: null,
		})
	}
}
