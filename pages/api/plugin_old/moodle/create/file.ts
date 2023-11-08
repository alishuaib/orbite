/**
 * Create new data for file in relation to module
 * Process and store file contents in filesystem
 *
 * (Referred to as Module in Moodle)
 * @api {post} /api/plugin/moodle/create/file
 */
import { NextApiRequest, NextApiResponse } from "next/types"
import withApiKeyVerification from "@/lib/middleware/apikey"

import { Auth, Course, Module, File } from "@/lib/@schemas"
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
			"api/plugin/moodle/create/file",
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
				console.log(body.data.files, files.length)
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
						return
					}
				}

				const client = await clientPromise
				//Check if course and module exists
				const course: Collection<Course> = client
					.db(auth._handle)
					?.collection("course")
				const courseFind = await course.findOne({
					_ref: body.data.module["course"],
				})

				const moduledb: Collection<Module> = client
					.db(auth._handle)
					?.collection("module")
				const moduleFind = await moduledb.findOne({
					_ref: body.data.module["section"],
				})

				console.log("course module check", courseFind, moduleFind)

				if (!courseFind) {
					await course.insertOne({
						title: body.data["course"]["fullname"],
						summary: body.data["course"]["summary"],
						icon: auth.icon,
						label: body.data["course"]["shortname"],
						category: body.data["course"]["category_name"],
						slug: `/course/view.php?id=${body.data.module["course"]}`,
						version: body.data["course"]["timemodified"], //Use timestamp for versioning
						visible: body.data["course"]["visible"],
						_ref: `${body.data.module["course"]}`,
						meta: body.data["course"],
					})
				}

				if (!moduleFind) {
					await moduledb.insertOne({
						title:
							body.data["section"]["name"] ||
							`Topic ${body.data["section"]["section"]}`,
						summary: body.data["section"]["summary"],
						order: body.data["section"]["section"],
						slug: `/course/view.php?id=${body.data.module["course"]}#section-${body.data.section["section"]}`,
						version: body.data["section"]["timemodified"], //Use timestamp for versioning
						visible:
							body.data["section"]["visible"] == "1"
								? true
								: false,
						_course: `${body.data["section"]["course"]}`,
						_ref: `${body.data.module["section"]}`,
						meta: body.data["section"],
					})
				}
				// Prepare documents for DB

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
						_resource: `${body.data.module["id"]}`,
						_ref: body.data.files[idx]["id"],
						_slices: [],
						meta: body,
					})
				}

				//Create embeddings
				let embed = []
				try {
					let resEmbed = await createEmbedding(
						auth._handle,
						documents
					)
					if (Array.isArray(resEmbed)) {
						documents = documents.map((doc, index) => {
							return {
								...doc,
								...{ _slices: (resEmbed as string[][])[index] },
							}
						})
					}
					embed.push({
						status: "success",
						upsertSlices: resEmbed,
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
					_ref: `${body.data.module["id"]}`,
				})
				break
			default:
				res.setHeader("Allow", ["POST"])
				res.status(405).end(`Not Allowed ${method}`)
		}
	}
)
