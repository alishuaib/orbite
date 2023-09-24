import { NextApiRequest, NextApiResponse } from "next/types"

import { validate } from "jsonschema"
import clientPromise from "@/lib/mongodb"
import { Activity } from "@/lib/@schemas"
import { Collection } from "mongodb"

const embeddingSchema = {
	type: "object",
	properties: {
		handle: { type: "string" }, //Organization / Account Unique Handle
		_course: { type: "string" }, //Course to get modules for
	},
}

//
// Get all modules
//
export default async (req: NextApiRequest, res: NextApiResponse) => {
	const { method, body } = req
	console.info("get/module", body)
	switch (method) {
		case "POST":
			const client = await clientPromise
			const moduledb: Collection<Activity> = client
				.db(body.handle)
				.collection("activity")
			const results = await moduledb.find({ _course: body._course })
			const response = await results.toArray()
			console.table(response, ["title"])
			res.status(200).json(response)
			break
		default:
			res.setHeader("Allow", ["POST"])
			res.status(405).end(`Not Allowed ${method}`)
	}
}
