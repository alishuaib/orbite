import { NextApiRequest, NextApiResponse } from "next/types"
import withApiKeyVerification, {
	Authorization,
} from "@/lib/middleware/checkAuth"

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
		console.log("running content", req.method)
		const { method } = req
		let form: FormidableResult
		let content_ids: number[] = []
		if (
			req.query.content_ids &&
			typeof req.query.content_ids === "string"
		) {
			content_ids = req.query.content_ids
				.split(",")
				.map((i) => parseInt(i))
		}
		switch (method) {
			case "GET":
				await getContent(req, res, auth, content_ids)
				break
			case "POST":
				form = await downloadForm(req)
				await createContent(req, res, auth, form)
				break
			case "DELETE":
				// form = await downloadForm(req)
				await deleteContent(req, res, auth, content_ids)
				break
		}
	}
)
