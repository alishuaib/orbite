import { NextApiRequest, NextApiResponse } from "next/types"

import { validate } from "jsonschema"
import clientPromise from "@/lib/mongodb"
import { Content } from "@/lib/@schemas"
import { Collection } from "mongodb"

const embeddingSchema = {
	type: "object",
	properties: {
		handle: { type: "string" }, //Organization / Account Unique Handle
		_module: { type: "string" }, //Module to get files for
	},
}

//
// Get all modules
//
export default async (req: NextApiRequest, res: NextApiResponse) => {
	const { method, body } = req
	// console.info("get/file", body)
	switch (method) {
		case "POST":
			const client = await clientPromise
			const file: Collection<Content> = client
				.db(body.handle)
				.collection("content")
			const results = await file.find({ _module: body._module })
			const response = await results.toArray()
			// console.table(response, ["title"])
			res.status(200).json(response)
			break
		default:
			res.setHeader("Allow", ["POST"])
			res.status(405).end(`Not Allowed ${method}`)
	}
}
