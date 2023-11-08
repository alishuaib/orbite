/**
 * Create new data for module in relation to course
 *
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
			"api/plugin/moodle/create/module",
			new Date().toLocaleTimeString(),
			JSON.stringify(body, null, 4)
		)
		switch (method) {
			case "POST":
				const client = await clientPromise
				const course: Collection<Module> = client
					.db(auth._handle)
					?.collection("module")

				const results = await course.insertOne({
					title:
						body.data["section"]["name"] ||
						`Topic ${body.data["section"]["section"]}`,
					summary: body.data["section"]["summary"],
					order: body.data["section"]["section"],
					slug: `${body.event["objectid"]}`,
					version: body.data["section"]["timemodified"], //Use timestamp for versioning
					visible:
						body.data["section"]["visible"] == "1" ? true : false,
					_course: `${body.data["section"]["course"]}`,
					_ref: `${body.event["objectid"]}`,
					meta: body,
				})

				res.status(200).json(results)
				break
			default:
				res.setHeader("Allow", ["POST"])
				res.status(405).end(`Not Allowed ${method}`)
		}
	}
)
