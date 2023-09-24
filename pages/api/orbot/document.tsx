import { NextApiRequest, NextApiResponse } from "next/types"

import { validate } from "jsonschema"

import clientPromise from "@/lib/mongodb"
import { File } from "@/lib/@schemas"
import { Collection } from "mongodb"

import { parseFile } from "@/lib/parser"
import { middleware } from "@/lib/embedding"

const embeddingSchema = {
	type: "object",
	properties: {
		_ref: { type: "string" }, //File Reference
	},
}

interface Body {
	handle: string
	_ref: string
}

//
// Delete a file
//
export default async (req: NextApiRequest, res: NextApiResponse) => {
	const { method, body } = req
	console.info("orbot/document", body)
	switch (method) {
		case "POST":
			const client = await clientPromise
			const file: Collection<File> = client
				.db(body.handle)
				.collection("file")
			const result = await file.findOne({ _ref: body._ref })

			if (!result)
				return res
					.status(404)
					.json({ status: false, message: "File not found" })

			let parsed = await parseFile(result)

			let slices: string[] | null = null
			try {
				slices = await middleware(result)
			} catch (e) {
				slices = null
				parsed = JSON.stringify(parsed, null, 4)
				console.log(e)
			}

			res.status(200).json({ preview: parsed, slices: slices })
			break
		default:
			res.setHeader("Allow", ["POST"])
			res.status(405).end(`Not Allowed ${method}`)
	}
}
