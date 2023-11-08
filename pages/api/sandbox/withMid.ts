import { NextApiRequest, NextApiResponse } from "next/types"
import withApiKeyVerification, {
	Authorization,
} from "@/lib/middleware/checkAuth"

import {
	downloadForm,
	createContent,
	deleteContent,
} from "@/lib/contentManager"
import { ObjectId } from "mongodb"
import * as weaviate from "@/lib/weaviate"
import query from "../orbot/query"
import formidable from "formidable"

export const config = {
	api: {
		// bodyParser: false,
	},
}
interface FormidableResult {
	err: any | null
	fields: formidable.Fields
	files: formidable.Files
}

//
// Get all courses for a given organization based on their assigned handle
//
export default withApiKeyVerification(
	async (req: NextApiRequest, res: NextApiResponse, auth: Authorization) => {
		const response = await weaviate.getItem(auth.handle, "content", 99999)
		res.json({
			status: 200,
			message: "success",
			data: response,
		})
	}
)
