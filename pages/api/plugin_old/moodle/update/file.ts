/**
 * Update entry and namespace for file in relation to module
 * Process and store file contents in filesystem
 * (Referred to as Module in Moodle)
 * @api {post} /api/plugin/moodle/update/file
 */
import { NextApiRequest, NextApiResponse } from "next/types"
import withApiKeyVerification from "@/lib/middleware/apikey"

import { Auth, File } from "@/lib/@schemas"
import { Collection } from "mongodb"
import clientPromise from "@/lib/mongodb"
import { createEmbedding } from "@/lib/embedding"
import fs from "fs/promises"
const path = require("path")

import formidable from "formidable"
interface FormidableResult {
	err: any | null
	fields: formidable.Fields
	files: formidable.Files
}
export const config = {
	api: {
		bodyParser: false,
	},
}

export default withApiKeyVerification(
	async (req: NextApiRequest, res: NextApiResponse, auth: Auth) => {
		const { method } = req
		console.info(
			"api/plugin/moodle/update/file",
			new Date().toLocaleTimeString()
		)
		switch (method) {
			case "POST":
				let data: FormidableResult | null = null
				try {
					data = await new Promise((resolve, reject) => {
						const form = formidable()
						console.log("Downloading files")
						form.parse(req, (err, fields, files) => {
							if (err) reject({ err })
							resolve({ err, fields, files })
						})
					})
				} catch (error) {
					console.error(error)
					res.status(400).json({
						success: false,
						message: "Unable to parse form data",
					})
					return
				}

				if (!data || data.err) {
					res.status(400).json({
						success: false,
						message: "Unable to parse form data",
					})
					return
				}
				console.log(
					"api/plugin/moodle/create/file",
					auth._handle,
					"Download successful"
				)

				const body = JSON.parse(data.fields.body as string)
				const files = Object.values(
					data.files
				).flat() as formidable.File[]

				//Move File to target directory
				for (let idx = 0; idx < files.length; idx++) {
					const file = files[idx]
					const oldPath = path.join(file.filepath)
					const newPath = path.join(
						process.env.FILE_UPLOAD_DIR as string,
						auth._handle,
						body.data.module["course"],
						body.data.module["section"],
						body.data.files[idx]["id"]
					)

					const newDir = path.dirname(newPath)
					try {
						await fs.mkdir(newDir, { recursive: true })
						await fs.copyFile(oldPath, newPath)
						await fs.unlink(oldPath)
					} catch (error) {
						console.error(error)
						res.status(400).json({
							success: false,
							message: "Unable to move file",
						})
					}
				}

				// Prepare documents for DB
				const client = await clientPromise
				const file: Collection<File> = client
					.db(auth._handle)
					?.collection("file")

				let documents: File[] = []
				for (let idx = 0; idx < files.length; idx++) {
					const file = files[idx]
					documents.push({
						name: file.originalFilename?.split(".")[0] as string,
						ext: file.originalFilename?.split(".").pop() as string,
						dir: `/${auth._handle}/${body.data.module["course"]}/${body.data.module["section"]}`,
						metadata: {
							size: file.size,
							mimetype: file.mimetype,
							mtime: file.mtime,
						},
						url: body.url,
						visible:
							body.data.module["visible"] == "1" ? true : false,
						version: body.data.files[idx]["timemodified"],
						hash: body.data.files[idx]["contenthash"],
						_course: body.data.module["course"],
						_module: body.data.module["section"],
						_resource: `${body.event["objectid"]}`,
						_ref: body.data.files[idx]["id"],
						_slices: [],
						meta: body,
					})
				}

				//Create embeddings
				let embed = []
				try {
					let res = await createEmbedding(auth._handle, documents)
					if (Array.isArray(res)) {
						documents = documents.map((doc, index) => {
							return {
								...doc,
								...{ _slices: (res as string[][])[index] },
							}
						})
					}
					embed.push({
						status: "success",
						upsertSlices: res,
					})
				} catch (error) {
					console.log(error)
					embed.push({
						status: "failed",
						message: "Unable to create embedding",
					})
				}

				//Insert into documents into DB
				const insert = await file.insertMany(documents)
				const result = await insert
				res.status(200).json({
					success: true,
					message: "Files uploaded successfully",
				})
				console.log("File upload successful", result, {
					_ref: `${body.event["objectid"]}`,
				})
				break
			default:
				res.setHeader("Allow", ["POST"])
				res.status(405).end(`Not Allowed ${method}`)
		}
	}
)
