import { NextApiRequest, NextApiResponse } from "next/types"

import { validate } from "jsonschema"

import { Course, File } from "@/lib/@schemas"
import { searchEmbedding, SearchResponse, middleware } from "@/lib/embedding"
import { QueryResponse } from "chromadb/dist/main/types"
import clientPromise from "@/lib/mongodb"
import { Collection } from "mongodb"
import { parseFile, slicer } from "@/lib/parser"
import { crossCompare, generateResponse } from "@/lib/openai"

const embeddingSchema = {
	type: "object",
	properties: {
		_handle: { type: "string" }, //File Reference
		_course: { type: "string" }, //File Reference
		_module: { type: "string" }, //File Reference
		query: { type: "string" }, //File Reference
	},
}

interface Body {
	_handle: string
	_course?: string
	_module?: string
	query: string
}

//
// Delete a file
//
export default async (req: NextApiRequest, res: NextApiResponse) => {
	const { method, body } = req
	console.info("orbot/query", body)
	switch (method) {
		case "POST":
			//Search documents based on user query
			const results = await searchEmbedding(
				body.handle,
				body.query,
				body._course,
				body._module
			)

			if (results.status === false) {
				res.status(404).json(results)
			}

			const data = results as SearchResponse

			// Get full documents for each file
			const client = await clientPromise
			const file: Collection<File> = client
				.db(body.handle)
				.collection("file")
			const file_db = await file
				.find({
					_ref: { $in: [...data.files] },
				})
				.toArray()

			const file_info = data.files.map((f) => {
				return file_db.find((d) => d._ref === f)
			})
			// Parse and Slice each retrieved file content
			const parsed = await Promise.all(
				file_info.map((f) => (f ? middleware(f) : null))
			)
			console.log(data.files, data.distances, file_info)

			//Format response output
			const output = parsed.map((f, idx) => {
				let item_idx = parseInt(
					data.ids[idx].split("-").pop() as string
				)
				if (f) {
					return {
						file_id: data.files[idx],
						slice_index: item_idx,
						slice: f[item_idx],
						score: data.distances[idx],
						vector: data.values[idx],
						doc: f,
					}
				}
			})

			//Get course name
			const courses: Collection<Course> = client
				.db(body.handle)
				.collection("course")
			const course_db = await courses.findOne({ _ref: body._course })
			//Formulate Chat GPT Response
			const chat = await generateResponse(
				body.query,
				output.map((o) => (o ? o.slice : "")),
				course_db?.title || ""
			)
			//Verify response
			if (!chat)
				return res.status(400).json({
					validate: [],
					chat: "Failed to generate chat response",
					content: output,
				})
			const validate = await crossCompare(
				chat.choices[0].message?.content as string,
				output.map((o) => (o ? o.vector : []))
			)
			res.status(200).json({
				chat: {
					validation: validate,
					message: chat.choices[0].message?.content,
				},
				content: output,
				conversation: chat,
			})
			break
		default:
			res.setHeader("Allow", ["POST"])
			res.status(405).end(`Not Allowed ${method}`)
	}
}
