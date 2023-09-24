import { NextApiRequest, NextApiResponse } from "next/types"

import { validate } from "jsonschema"
import { getViewer, getViewerSCORM } from "@/lib/viewer"
import path from "path"
import clientPromise from "@/lib/mongodb"
import { Collection } from "mongodb"
import { Content } from "@/lib/@schemas"

const embeddingSchema = {
	type: "object",
	properties: {
		handle: { type: "string" }, //File Reference
		_ref: { type: "string" }, //File Reference
	},
}

interface Body {
	_handle: string
	_course: string
	_module: string
	_ref: string
}

//
// Show HTML
//
export default async (req: NextApiRequest, res: NextApiResponse) => {
	const { method, body } = req
	console.info("orbot/preview", body)
	switch (method) {
		case "POST":
			const client = await clientPromise
			const file: Collection<Content> = client
				.db(body.handle)
				.collection("content")
			let result = await file.findOne({ _ref: body._ref })
			if (!result)
				return res
					.status(404)
					.json({ status: false, message: "File not found" })

			let page: string | undefined | null = undefined
			if (result._scorm) {
				console.log("orbot/preview", "SCORM Preview")
				let course_result = await file.findOne({ _ref: result._scorm })

				if (!course_result)
					return res.status(404).json({
						status: false,
						message: "SCORM File not found",
					})
				if (result._scorm_ref) {
					page = await getViewerSCORM(
						path
							.join(
								course_result.dir,
								course_result._id as string
							)
							.replace(/\\/g, "/"),
						result._scorm_ref
					)
				}
			} else {
				page = await getViewer(result)
			}

			if (!page)
				return res
					.status(200)
					.json({ html: `<p>Content could not be loaded</p>` })

			res.status(200).json({ html: page })
			break
		default:
			res.setHeader("Allow", ["POST"])
			res.status(405).end(`Not Allowed ${method}`)
	}
}
