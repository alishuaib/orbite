import { NextApiRequest, NextApiResponse } from "next/types"
import { Auth } from "@/lib/@schemas"
import { downloadForm, createContent } from "@/lib/contentManager"
import withApiKeyVerification from "@/lib/middleware/apikey"

export const config = {
	api: {
		bodyParser: false,
	},
}

export default withApiKeyVerification(
	async (req: NextApiRequest, res: NextApiResponse, auth: Auth) => {
		switch (req.method) {
			case "POST":
				const form = await downloadForm(req)
				await createContent(req, res, auth, form)
				break
			default:
				res.setHeader("Allow", ["POST"])
				res.status(405).end(`Not Allowed ${req.method}`)
		}
	}
)
