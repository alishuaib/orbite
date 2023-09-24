import { NextApiRequest, NextApiResponse } from "next/types"

import { validate } from "jsonschema"
import clientPromise from "@/lib/mongodb"
import { Course } from "@/lib/@schemas"
import { Collection } from "mongodb"

const embeddingSchema = {
	type: "object",
	properties: {
		handle: { type: "string" }, //Organization / Account Unique Handle
	},
}

//
// Get all courses for a given organization based on their assigned handle
//
export default async (req: NextApiRequest, res: NextApiResponse) => {
	const { method, body } = req
	console.info("get/course", body)
	switch (method) {
		case "POST":
			const client = await clientPromise
			const course: Collection<Course> = client
				.db(body.handle)
				?.collection("course")
			const results = await course.find()
			const response = await results.toArray()
			console.table(response, ["title"])
			res.status(200).json(response)
			break
		default:
			res.setHeader("Allow", ["POST"])
			res.status(405).end(`Not Allowed ${method}`)
	}
}
