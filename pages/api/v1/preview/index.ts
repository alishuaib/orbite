import { NextApiRequest, NextApiResponse } from "next/types"
import withApiKeyVerification, {
	Authorization,
} from "@/lib/middleware/checkAuth"
import * as weaviate from "@/lib/weaviate"
import { z } from "zod"

//
// Section API
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
				id: z.number(),
			}),
		})
		try {
			return schema.parse(body)
		} catch (error) {
			console.log(error)
			throw new Error(`Invalid preview object for GET: ${error}`)
		}
	}
	try {
		const body = validateGET(req.body)
		const content = (await weaviate.getItem(
			auth.handle,
			"content",
			body.content.id
		)) as {
			content_id: number
			course_id: number
			module_id: number
			section_id: number
			slice_index: number
			text: string
		}[]
		if (content.length == 0) {
			throw new Error(
				`No preview found with content ids: [${body.content.id}]`
			)
		}

		//Process content for full text and sorted order
		const document = content
			.sort((a: any, b: any) => a.slice_index - b.slice_index)
			.map((c: any) => c.text)
		let { slice_index: _, ...rest } = content[0]
		const response = { ...rest, text: document }

		return res.status(200).json({
			route: req.url,
			isSuccess: true,
			message: "Preview content found successfully",
			data: response,
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
