/**
 * Delete existing data for course along with all child modules and files
 *
 * (Referred to as Course in Moodle)
 * @api {post} /api/plugin/moodle/create/course
 */
import { NextApiRequest, NextApiResponse } from "next/types"
import withApiKeyVerification from "@/lib/middleware/apikey"

import { Auth, Course, Module, File } from "@/lib/@schemas"
import { Collection } from "mongodb"
import clientPromise from "@/lib/mongodb"

import fs from "fs/promises"
import * as path from "path"
import { deleteEmbedding } from "@/lib/embedding"

export default withApiKeyVerification(
	async (req: NextApiRequest, res: NextApiResponse, auth: Auth) => {
		const { method, body } = req
		console.info(
			"api/plugin/moodle/delete/course",
			new Date().toLocaleTimeString(),
			JSON.stringify(body, null, 4)
		)
		switch (method) {
			case "POST":
				//Find course
				const client = await clientPromise
				const course: Collection<Course> = client
					.db(auth._handle)
					?.collection("course")
				const courseDoc = await course.findOne({
					_ref: `${body.event["objectid"]}`,
				})

				if (!courseDoc) {
					console.info(
						"api/plugin/moodle/delete/course",
						"Database Error: Course not found",
						auth._handle,
						body.event["objectid"]
					)
					return res
						.status(404)
						.json({ success: false, message: "Course not found" })
				}

				//Delete course in filesystem (if exists)
				try {
					await fs.rm(
						path.join(
							process.env.FILE_UPLOAD_DIR as string,
							auth._handle,
							courseDoc._ref
						),
						{ recursive: true }
					)
				} catch (error) {
					console.info(
						"api/plugin/moodle/delete/course",
						new Date().toLocaleTimeString(),
						"No course directory found"
					)
				}

				//Delete related module documents
				const moduledb: Collection<Module> = client
					.db(auth._handle)
					?.collection("module")
				await moduledb.deleteMany({
					_course: courseDoc._ref,
				})

				//Delete course file vectors and documents
				const file: Collection<File> = client
					.db(auth._handle)
					?.collection("file")
				const fileFind = await file.find({
					_course: courseDoc._ref,
				})
				const fileDocuments = await fileFind.toArray()

				//Delete each file embedding (if exists)
				for (let i = 0; i < fileDocuments.length; i++) {
					const fileDoc = fileDocuments[i]
					try {
						await deleteEmbedding(auth._handle, fileDoc._slices)
					} catch (error) {
						console.info(
							"api/plugin/moodle/delete/course",
							"Vector Database Error: Vector not found",
							auth._handle,
							body.event["objectid"],
							fileDoc._slices
						)
					}
				}
				//Delete each file document
				await file.deleteMany({
					_course: courseDoc._ref,
				})

				//Finally delete course document (this is last to ensure there's no orphaned documents)
				const results = await course.deleteOne({
					_ref: courseDoc._ref,
				})

				res.status(200).json({
					success: true,
					message: `Course [${courseDoc._ref}] deleted successfully`,
				})
				console.log("Deleted course", results, {
					_ref: `${body.event["objectid"]}`,
				})
				break
			default:
				res.setHeader("Allow", ["POST"])
				res.status(405).end(`Not Allowed ${method}`)
		}
	}
)
