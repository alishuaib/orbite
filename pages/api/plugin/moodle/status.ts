/**
 * Status check for API and key verification
 * @api {post} /api/plugin/moodle/status
 */
import { NextApiRequest, NextApiResponse } from "next/types"
import withApiKeyVerification, {
	Authorization,
} from "@/lib/middleware/checkAuth"

export default withApiKeyVerification(
	async (req: NextApiRequest, res: NextApiResponse, auth: Authorization) => {
		switch (req.method) {
			case "POST":
				return res.status(200).json({
					route: `${req.url}`,
					isSuccess: true,
					message: "Orbite API is live",
					data: {
						server: "live", //live , maintenance, down
						api: "live", //live , maintenance, down
						plugin: 2023042405,
						urls: {
							admin: "",
							docs: "",
							new: "",
							help: "",
						},
						expire: auth.key_expiry,
					},
				})
			default:
				res.setHeader("Allow", ["POST"])
				res.status(405).end(`Not Allowed ${req.method}`)
		}
	}
)
