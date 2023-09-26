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
import { randomInt } from "crypto"

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
// Get all courses for a given organization based on their assigned handle
//
export default withApiKeyVerification(
	async (req: NextApiRequest, res: NextApiResponse, auth: Authorization) => {
		const { body, query } = req

		let response: any
		let form: FormidableResult
		let objids: any

		form = await downloadForm(req)
		objids = {
			c: randomInt(1000),
			s: randomInt(1000),
			m: randomInt(1000),
		}
		form.fields.body = JSON.stringify({
			course: {
				id: objids.c,
				title: "Test Course",
				label: "test-course",
				summary: "This is a test course",
				visible: true,
				url: "https://www.orbite.xyz/test-course",
				namespace: "testing",
				category: "Testing",
				tags: "test,testing",
				version: Math.floor(Date.now() / 1000).toString(),
				meta: {
					fieldA: "valueA",
					fieldB: "valueB",
				},
			},
			section: {
				id: objids.s,
				title: "Test Section",
				summary: "This is a test section",
				order: "1",
				visible: true,
				url: "https://www.orbite.xyz/test-section",
				version: Math.floor(Date.now() / 1000).toString(),
				meta: {
					fieldA: "valueA",
					fieldB: "valueB",
				},
			},
			module: {
				id: objids.m,
				title: "Test Module",
				summary: "This is a test module",
				order: "1",
				visible: true,
				url: "https://www.orbite.xyz/test-module",
				version: Math.floor(Date.now() / 1000).toString(),
				meta: {
					fieldA: "valueA",
					fieldB: "valueB",
				},
			},
			content: [
				{
					id: randomInt(1000),
					name: "Test Content",
					ext: "docx",
					visible: true,

					size: 1000,
					mimetype:
						"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
					modified_at: new Date(),
					url: "https://www.orbite.xyz/test-content",
					version: Math.floor(Date.now() / 1000).toString(),
					meta: {
						fieldA: "valueA",
						fieldB: "valueB",
					},
				},
			],
		})
		console.log(form.fields.body)
		await createContent(req, res, auth, form)
	}
)
