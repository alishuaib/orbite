/**
 * Delete existing data for file
 * Remove any store data from vectordb and filesystem
 *
 * (Referred to as Module in Moodle)
 * @api {post} /api/plugin/moodle/create/file
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
			"api/plugin/moodle/delete/file",
			new Date().toLocaleTimeString(),
			JSON.stringify(body, null, 4)
		)
		switch (method) {
			case "POST":
				const fileIds = body.files
					? body.files.map((f: any) => f._ref)
					: []
				const fromQueue = body.fromQueue || false
				//Find module
				const client = await clientPromise

				//Delete module file vectors and documents
				const file: Collection<File> = client
					.db(auth._handle)
					?.collection("file")

				let fileFind
				if (fromQueue) {
					fileFind = await file.find({
						//Find only a single file from queue request
						_ref: `${body.file_id}`,
					})
				} else if (fileIds.length === 0) {
					fileFind = await file.find({
						_resource: `${body.event["objectid"]}`,
					})
				} else {
					fileFind = await file.find({
						_resource: `${body.event["objectid"]}`,
						_ref: { $in: fileIds },
					})
				}
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

				//Delete file from filesystem
				for (let i = 0; i < fileDocuments.length; i++) {
					const fileDoc = fileDocuments[i]
					try {
						await fs.unlink(
							path.join(
								process.env.FILE_UPLOAD_DIR as string,
								auth._handle,
								fileDoc._course,
								fileDoc._module,
								fileDoc._ref
							)
						)
					} catch (error) {
						console.info(
							"api/plugin/moodle/delete/module",
							"Filesystem Error: File not found",
							fileDoc.dir
						)
					}
				}
				//Delete each file document
				if (fromQueue) {
					//Delete only a single file from queue request
					await file.deleteMany({
						_ref: `${body.file_id}`,
					})
				} else if (fileIds.length === 0) {
					await file.deleteMany({
						_resource: `${body.event["objectid"]}`,
					})
				} else {
					await file.deleteMany({
						_resource: `${body.event["objectid"]}`,
						_ref: { $in: fileIds },
					})
				}

				//Check if module and course is empty
				if (fromQueue && fileDocuments.length === 1) {
					//Is Module empty?
					const moduleFind = await file
						.find({
							_module: fileDocuments[0]._module,
						})
						.toArray()
					if (moduleFind.length === 0) {
						console.log("delete module")
						const moduledb: Collection<Module> = client
							.db(auth._handle)
							?.collection("module")
						await moduledb.deleteOne({
							_ref: fileDocuments[0]._module,
						})
					}

					//Is Course empty?
					const courseFind = await file
						.find({
							_course: fileDocuments[0]._course,
						})
						.toArray()
					if (courseFind.length === 0) {
						console.log("delete course")
						const course: Collection<Course> = client
							.db(auth._handle)
							?.collection("course")
						await course.deleteOne({
							_ref: fileDocuments[0]._course,
						})
					}
				}

				if (fromQueue) {
					res.status(200).json({
						success: true,
						message: `File Resource [${body.file_id}] deleted successfully`,
					})
					console.log("Deleted file in queue", {
						_ref: `${body.file_id}`,
						fromQueue: true,
					})
				} else {
					res.status(200).json({
						success: true,
						message: `File Resource [${body.event["objectid"]}] deleted successfully`,
					})
					console.log("Deleted module", {
						_resource: `${body.event["objectid"]}`,
						_ref: fileIds,
					})
				}
				break
			default:
				res.setHeader("Allow", ["POST"])
				res.status(405).end(`Not Allowed ${method}`)
		}
	}
)
