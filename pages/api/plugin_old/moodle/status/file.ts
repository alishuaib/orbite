/**
 * Get status updates on a file contents
 *
 * (Referred to as Module in Moodle)
 * @api {post} /api/plugin/moodle/create/file
 */
import { NextApiRequest, NextApiResponse } from "next/types"
import withApiKeyVerification from "@/lib/middleware/apikey"

import { Auth, File } from "@/lib/@schemas"
import { Collection } from "mongodb"
import clientPromise from "@/lib/mongodb"

export default withApiKeyVerification(
	async (req: NextApiRequest, res: NextApiResponse, auth: Auth) => {
		const { method, body } = req
		console.info(
			"/api/plugin/moodle/status/file",
			new Date().toLocaleTimeString()
		)
		switch (method) {
			case "POST":
				// Prepare documents for DB
				const client = await clientPromise
				const file: Collection<File> = client
					.db(auth._handle)
					?.collection("file")
				const docs = await file
					.find(
						{ _resource: `${body.event["objectid"]}` },
						{
							projection: {
								name: 1,
								_resource: 1,
								_ref: 1,
								version: 1,
								hash: 1,
							},
						}
					)
					.toArray()
				res.status(200).json({
					success: true,
					message: "Files found successfully",
					data: docs,
				})
				console.log("Files found successfully", {
					_ref: `${body.event["objectid"]}`,
				})
				break
			default:
				res.setHeader("Allow", ["POST"])
				res.status(405).end(`Not Allowed ${method}`)
		}
	}
)
