/**
 * Delete existing data for module along with all child files
 *
 * (Referred to as Section in Moodle)
 * @api {post} /api/plugin/moodle/create/module
 */
import { NextApiRequest, NextApiResponse } from "next/types"
import withApiKeyVerification from "@/lib/middleware/apikey"

import { Auth, Module, File } from "@/lib/@schemas"
import { Collection } from "mongodb"
import clientPromise from "@/lib/mongodb"

import fs from "fs/promises"
import * as path from "path"
import { deleteEmbedding } from "@/lib/embedding"

export default withApiKeyVerification(
	async (req: NextApiRequest, res: NextApiResponse, auth: Auth) => {
		const { method, body } = req
		console.info(
			"api/plugin/moodle/delete/module",
			new Date().toLocaleTimeString(),
			JSON.stringify(body, null, 4)
		)
		switch (method) {
			case "POST":
				//Find module
				const client = await clientPromise
				const moduledb: Collection<Module> = client
					.db(auth._handle)
					?.collection("module")
				const moduleDoc = await moduledb.findOne({
					_ref: `${body.event["objectid"]}`,
				})

				if (!moduleDoc) {
					console.info(
						"api/plugin/moodle/delete/module",
						"Database Error: Module not found",
						auth._handle,
						body.event["objectid"]
					)
					return res
						.status(404)
						.json({ success: false, message: "Module not found" })
				}

				//Delete module in filesystem (if exists)
				try {
					await fs.rm(
						path.join(
							process.env.FILE_UPLOAD_DIR as string,
							auth._handle,
							moduleDoc._course,
							moduleDoc._ref
						),
						{ recursive: true }
					)
				} catch (error) {
					console.info(
						"api/plugin/moodle/delete/module",
						new Date().toLocaleTimeString(),
						"No module directory found"
					)
				}

				//Delete module file vectors and documents
				const file: Collection<File> = client
					.db(auth._handle)
					?.collection("file")
				const fileFind = await file.find({
					_module: moduleDoc._ref,
				})
				const fileDocuments = await fileFind.toArray()

				//Delete each file embedding (if exists)
				for (let i = 0; i < fileDocuments.length; i++) {
					const fileDoc = fileDocuments[i]
					try {
						await deleteEmbedding(auth._handle, fileDoc._slices)
					} catch (error) {
						console.info(
							"api/plugin/moodle/delete/module",
							"Vector Database Error: Vector not found",
							auth._handle,
							body.event["objectid"],
							fileDoc._slices
						)
					}
				}
				//Delete each file document
				await file.deleteMany({
					_module: moduleDoc._ref,
				})

				//Finally delete module document (this is last to ensure there's no orphaned documents)
				const results = await moduledb.deleteOne({
					_ref: moduleDoc._ref,
				})

				res.status(200).json({
					success: true,
					message: `Module [${moduleDoc._ref}] deleted successfully`,
				})
				console.log("Deleted module", results, {
					_ref: `${body.event["objectid"]}`,
				})
				break
			default:
				res.setHeader("Allow", ["POST"])
				res.status(405).end(`Not Allowed ${method}`)
		}
	}
)
