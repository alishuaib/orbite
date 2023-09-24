/**
 * Create new entry and namespace for course
 * (Referred to as Course in Moodle)
 * @api {post} /api/plugin/moodle/create/course
 */
import { NextApiRequest, NextApiResponse } from "next/types"
import withApiKeyVerification from "@/lib/middleware/apikey"

import { Auth, Course } from "@/lib/@schemas"
import { Collection } from "mongodb"
import clientPromise from "@/lib/mongodb"

import { v4 as uuidv4 } from "uuid"

export default withApiKeyVerification(
	async (req: NextApiRequest, res: NextApiResponse, auth: Auth) => {
		const { method, body } = req
		console.info(
			"api/plugin/moodle/update/course",
			new Date().toLocaleTimeString(),
			JSON.stringify(body, null, 4)
		)
		switch (method) {
			case "POST":
				const client = await clientPromise
				const course: Collection<Course> = client
					.db(auth._handle)
					?.collection("course")
				// No update to url and _ref (Used as identifier)
				const results = await course.updateOne(
					{ _ref: `${body.event["objectid"]}` },
					{
						$set: {
							title: body.data["course"]["fullname"],
							summary: body.data["course"]["summary"],
							icon: auth.icon,
							label: body.data["course"]["shortname"],
							category: body.data["course"]["category_name"],
							version: body.data["course"]["timemodified"], //Use timestamp for versioning
							visible:
								body.data["course"]["visible"] == "1"
									? true
									: false,

							meta: body,
						},
					}
				)
				console.log("Updated course", results.modifiedCount, {
					_ref: `${body.event["objectid"]}`,
				})
				res.status(200).json(results)
				break
			default:
				res.setHeader("Allow", ["POST"])
				res.status(405).end(`Not Allowed ${method}`)
		}
	}
)
