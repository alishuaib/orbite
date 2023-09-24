import { NextApiRequest, NextApiResponse } from "next/types"
import withApiKeyVerification from "@/lib/middleware/apikey"
import { Auth } from "@/lib/@schemas"

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
	async (req: NextApiRequest, res: NextApiResponse, auth: Auth) => {
		const { body, query } = req

		let response: any
		let form: FormidableResult
		let objids: any

		switch (query.method) {
			case "create":
				form = await downloadForm(req)
				objids = {
					c: new ObjectId(),
					s: new ObjectId(),
					a: new ObjectId(),
				}
				form.fields.body = JSON.stringify({
					course: {
						_id: objids.c,
					},
					section: {
						_id: objids.s,
						_course: objids.c,
					},
					activity: {
						_id: objids.a,
						_course: objids.c,
						_section: objids.s,
					},
					content: [
						{
							_id: new ObjectId(),
							_course: objids.c,
							_section: objids.s,
							_activity: objids.a,
						},
					],
				})
				await createContent(req, res, auth, form)
				break
			case "update":
				form = await downloadForm(req)
				objids = {
					c: new ObjectId(),
					s: new ObjectId(),
					a: new ObjectId(),
				}
				form.fields.body = JSON.stringify({
					course: {
						_id: objids.c,
					},
					section: {
						_id: objids.s,
						_course: objids.c,
					},
					activity: {
						_id: objids.a,
						_course: objids.c,
						_section: objids.s,
					},
					content: [
						{
							_id: new ObjectId(),
							_course: objids.c,
							_section: objids.s,
							_activity: objids.a,
						},
					],
				})
				await createContent(req, res, auth, form, true)
				break
			case "delete":
				await deleteContent(req, res, auth, req.body)
				break
			case "get":
				response = await weaviate.getAllItems("moonlite", "content")
				res.status(200).json(response)
				break
			case "erase":
				response = await weaviate.eraseCollection("content")
				res.status(200).json(response)
				break
			case "query":
				response = await weaviate.generativeResponse(
					auth._handle,
					"Content",
					req.body._course,
					req.body.query
				)
				res.status(200).json(response)
				break
			default:
				break
		}
	}
)
