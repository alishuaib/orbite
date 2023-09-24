/**
 * Get status updates for all content synched with orbite
 *
 * (Referred to as Module in Moodle)
 * @api {post} /api/plugin/moodle/create/file
 */
import { NextApiRequest, NextApiResponse } from "next/types"
import withApiKeyVerification from "@/lib/middleware/apikey"

import { Auth, File, Course, Module } from "@/lib/@schemas"
import { Collection } from "mongodb"
import clientPromise from "@/lib/mongodb"

export default withApiKeyVerification(
	async (req: NextApiRequest, res: NextApiResponse, auth: Auth) => {
		const { method, body } = req
		console.info(
			"/api/plugin/moodle/status/file",
			new Date().toLocaleTimeString()
		)
		switch (method) {
			case "POST":
				// Prepare documents for DB
				const client = await clientPromise
				const course: Collection<Course> = client
					.db(auth._handle)
					?.collection("course")
				const moduledb: Collection<Module> = client
					.db(auth._handle)
					?.collection("module")
				const file: Collection<File> = client
					.db(auth._handle)
					?.collection("file")

				const courseDocs = await course
					.find({}, { projection: { meta: 0 } })
					.toArray()
				const moduleDocs = await moduledb
					.find({}, { projection: { meta: 0 } })
					.toArray()
				const fileDocs = await file
					.find({}, { projection: { meta: 0 } })
					.toArray()

				let parsed: any = {}
				courseDocs.forEach((course) => {
					parsed[course._ref] = {
						info: course,
						modules: moduleDocs
							.filter((module) => module._course === course._ref)
							.reduce((acc: any, module) => {
								acc[module._ref] = {
									info: module,
									files: fileDocs
										.filter(
											(file) =>
												file._module === module._ref
										)
										.reduce((acc: any, file) => {
											acc[file._ref] = {
												info: file,
											}
											return acc
										}, {}),
								}
								return acc
							}, {}),
					}
				})
				res.status(200).json({
					success: true,
					message: "Status update found successfully",
					data: parsed,
				})
				console.log("Status update found successfully", {
					_handle: auth._handle,
					course: courseDocs.length,
					module: moduleDocs.length,
					file: fileDocs.length,
				})
				break
			default:
				res.setHeader("Allow", ["POST"])
				res.status(405).end(`Not Allowed ${method}`)
		}
	}
)
