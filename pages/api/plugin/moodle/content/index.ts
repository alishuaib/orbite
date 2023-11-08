/**
 * Handle data for content
 *
 * (Referred to as File in Moodle)
 * @api {post} /api/plugin/moodle/content
 */
import { NextApiRequest, NextApiResponse } from "next/types"
import withApiKeyVerification, {
	Authorization,
} from "@/lib/middleware/checkAuth"
import { DELETE, GET, PATCH, POST } from "@/pages/api/v1/sync/content"
import { ContentBodySchema, downloadForm } from "@/lib/contentManager"
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
			case "GET":
				req.body = form.fields
				await middleware_GET(req, res, auth)
				break
			case "POST":
				req.body = form
				await middleware_POST(req, res, auth)
				break
			case "PATCH":
				req.body = form
				await middleware_PATCH(req, res, auth)
				break
			case "DELETE":
				req.body = form.fields
				await middleware_DELETE(req, res, auth)
				break
		}
	}
)

async function middleware_GET(
	req: NextApiRequest,
	res: NextApiResponse,
	auth: Authorization
) {
	console.log(req.body)
	await GET(req, res, auth)
}

async function middleware_POST(
	req: NextApiRequest,
	res: NextApiResponse,
	auth: Authorization
) {
	req.body.files = {
		file: Object.keys(req.body.files as {})
			.map((key) => {
				return req.body.files[key]
			})
			.flat(),
	}
	console.log(req.body)
	//Forward request
	await POST(req, res, auth)
}

async function middleware_PATCH(
	req: NextApiRequest,
	res: NextApiResponse,
	auth: Authorization
) {
	//Rewrite transformed files
	req.body.files = {
		file: Object.keys(req.body.files as {})
			.map((key) => {
				return req.body.files[key]
			})
			.flat(),
	}
	console.log(req.body)
	//Forward request
	await PATCH(req, res, auth)
}

async function middleware_DELETE(
	req: NextApiRequest,
	res: NextApiResponse,
	auth: Authorization
) {
	req.body = JSON.parse(req.body.body)
	console.log(req.body)
	await DELETE(req, res, auth)
}
