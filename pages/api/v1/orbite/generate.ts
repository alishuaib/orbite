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
			course: z.object({
				id: z.number(),
			}),
			query: z.string(),
		})
		try {
			return schema.parse(body)
		} catch (error) {
			console.log(error)
			throw new Error(`Invalid generate object for GET: ${error}`)
		}
	}
	try {
		const body = validateGET(req.body)
		const content = await weaviate.generativeResponse(
			auth.handle,
			"content",
			body.course.id,
			body.query
		)

		return res.status(200).json({
			route: req.url,
			isSuccess: true,
			message: "Generative response recieved successfully",
			data: content,
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
