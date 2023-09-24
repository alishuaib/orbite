import { NextApiRequest, NextApiResponse } from "next/types"
import withApiKeyVerification from "@/lib/middleware/apikey"
import { deleteContent } from "@/lib/contentManager"
import { Auth } from "@/lib/@schemas"

export default withApiKeyVerification(
	async (req: NextApiRequest, res: NextApiResponse, auth: Auth) => {
		switch (req.method) {
			case "POST":
				await deleteContent(req, res, auth, req.body)
				break
			default:
				res.setHeader("Allow", ["POST"])
				res.status(405).end(`Not Allowed ${req.method}`)
		}
	}
)
