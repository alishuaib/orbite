/**
 * Create new entry and namespace for module in relation to course
 * (Referred to as Section in Moodle)
 * @api {post} /api/plugin/moodle/create/module
 */
import { NextApiRequest, NextApiResponse } from "next/types"
import withApiKeyVerification from "@/lib/middleware/apikey"

import { Auth, Module } from "@/lib/@schemas"
import { Collection } from "mongodb"
import clientPromise from "@/lib/mongodb"

export default withApiKeyVerification(
	async (req: NextApiRequest, res: NextApiResponse, auth: Auth) => {
		const { method, body } = req
		console.info(
			"api/plugin/moodle/update/module",
			new Date().toLocaleTimeString(),
			JSON.stringify(body, null, 4)
		)
		switch (method) {
			case "POST":
				const client = await clientPromise
				const course: Collection<Module> = client
					.db(auth._handle)
					?.collection("module")
				// No update to slug, _course and _ref (Used as identifier)
				const results = await course.updateOne(
					{ _ref: `${body.event["objectid"]}` },
					{
						$set: {
							title:
								body.data["section"]["name"] ||
								`Topic ${body.data["section"]["section"]}`,
							summary: body.data["section"]["summary"],
							order: body.data["section"]["section"],
							version: body.data["section"]["timemodified"], //Use timestamp for versioning
							visible:
								body.data["section"]["visible"] == "1"
									? true
									: false,
							meta: body,
						},
					}
				)
				console.log("Updated module", results.modifiedCount, {
					_ref: `${body.event["contextid"]}`,
				})
				res.status(200).json(results)
				break
			default:
				res.setHeader("Allow", ["POST"])
				res.status(405).end(`Not Allowed ${method}`)
		}
	}
)
