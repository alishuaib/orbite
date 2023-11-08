/**
 * Handle data for courses
 *
 * (Referred to as File in Moodle)
 * @api {post} /api/plugin/moodle/content
 */
import { NextApiRequest, NextApiResponse } from "next/types"
import withApiKeyVerification, {
	Authorization,
} from "@/lib/middleware/checkAuth"
import { PATCH, DELETE } from "@/pages/api/v1/sync/section"

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
				await middleware_GET(req, res, auth)
				break
			case "POST":
				await middleware_POST(req, res, auth)
				break
			case "PATCH":
				await middleware_PATCH(req, res, auth)
				break
			case "DELETE":
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
	return res.status(200).json({ isSuccess: true })
}

async function middleware_POST(
	req: NextApiRequest,
	res: NextApiResponse,
	auth: Authorization
) {
	console.log(req.body)
	return res.status(200).json({ isSuccess: true })
}

async function middleware_PATCH(
	req: NextApiRequest,
	res: NextApiResponse,
	auth: Authorization
) {
	await PATCH(req, res, auth)
}

async function middleware_DELETE(
	req: NextApiRequest,
	res: NextApiResponse,
	auth: Authorization
) {
	await DELETE(req, res, auth)
}
