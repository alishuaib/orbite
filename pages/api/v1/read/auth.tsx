import { NextApiRequest, NextApiResponse } from "next/types"

import { validate } from "jsonschema"
import clientPromise from "@/lib/mongodb"

const embeddingSchema = {
	type: "object",
	properties: {
		email: { type: "string" }, //Login Email
	},
}

//
// Get all courses for a given organization based on their assigned handle
//
export default async (req: NextApiRequest, res: NextApiResponse) => {
	const { method, body } = req
	console.info("get/auth", body)
	switch (method) {
		case "POST":
			const client = await clientPromise
			const handles = client.db("_auth").collection("handles")

			let domain = body.email?.split("@")[1]

			const results = await handles.findOne({ domain: domain })

			res.status(200).json(results)

			break
		default:
			res.setHeader("Allow", ["POST"])
			res.status(405).end(`Not Allowed ${method}`)
	}
}
