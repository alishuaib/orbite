import formidable from "formidable"
import chalk from "chalk"
import clientPromise from "@/lib/mongodb"
import { createEmbedding, deleteEmbedding } from "@/lib/embedding"

//Types
import { NextApiRequest, NextApiResponse } from "next/types"
import { Auth, Course, Section, Activity, Content } from "@/lib/@schemas"
import { Collection, ObjectId } from "mongodb"

interface FormidableResult {
	err: any | null
	fields: formidable.Fields
	files: formidable.Files
}

class ContentManagerError extends Error {
	statuscode: number
	data: any

	constructor(
		message: string,
		error: any = null,
		data: object | [] = {},
		statuscode: number = 400
	) {
		if (error)
			super(`${chalk.cyan("[ERROR]")} :: ${message} \n\t ${error.stack}`)
		else super(`${chalk.cyan("[ERROR]")} :: ${message}`)
		this.statuscode = statuscode
		this.data = data
	}
}

/**
 * Downloads form-data and perform basic validation.
 * @async
 * @param request - The request object to parse.
 * @throws If there is an error downloading or parsing the form-data.
 * @returns A promise that resolves with the parsed form-data.
 */
export async function downloadForm(request: NextApiRequest) {
	let data: FormidableResult | null = null
	try {
		data = await new Promise((resolve, reject) => {
			const form = formidable()
			form.parse(request, (err, fields, files) => {
				if (err) reject({ err })
				resolve({ err, fields, files })
			})
		})
	} catch (error) {
		throw new ContentManagerError(`Unable to download form-data`, error)
	}

	if (!data || data.err) {
		throw new ContentManagerError(`Form-data is empty`)
	}

	return data
}

function validateForm(
	data: FormidableResult,
	require: Array<"course" | "section" | "activity" | "content"> = ["content"]
) {
	const { fields, files } = data

	if (!files.file) {
		throw new ContentManagerError(`Form-data is missing file data`)
	}

	//TODO :: Check file type is valid and supported
	//TODO :: Security check for zip file contents
	//TODO :: Security check for malicious files

	if (!fields.body) {
		throw new ContentManagerError(`Form-data is missing body data`)
	}

	const parse = JSON.parse(fields.body as string)

	if (!require.every((value) => Object.keys(parse).includes(value))) {
		throw new ContentManagerError(
			`Form-data is missing ${require.filter(
				(i) => !Object.keys(fields).includes(i)
			)} fields`
		)
	}

	const body = {
		course: parse.course as Course,
		section: parse.section as Section,
		activity: parse.activity as Activity,
		content: parse.content as Content[],
	}

	return {
		body: body,
		files: Object.values(files).flat() as formidable.File[],
	}
}

/*
	Expected structure of form-data sent with the request

	fields ::
		body {
			course?
			section?
			activity?
			file
		}
	files ::
		[]?

	- body is expected to be a json string
	- each key in body is expected to follow the db schema (aka pre cleaned)
	- files is expected to be an array of files

	create 
		file should be included
		course, section, activity should be included

	update
		file should be included
		course, section, activity should be included

	delete
		json request not a form-data request
		only contains file
**/

/**
 * Creates content using the provided form data and authenticated credentials.
 * @async
 * @param request - The request object to parse.
 * @param response - The response object to send.
 * @param auth - The authentication credentials to use.
 * @param form - The parsed form data to use.
 * @returns A promise that resolves when the content is created.
 */
export async function createContent(
	request: NextApiRequest,
	response: NextApiResponse,
	auth: Auth,
	form: FormidableResult,
	update?: boolean
) {
	try {
		//Validate form-data
		const { body, files } = validateForm(form, [
			"course",
			"section",
			"activity",
			"content",
		])
		console.log(
			`${chalk.magenta("[Debugging]")} :: Finished Validating form-data`
		)
		//Load course, section and activity database
		const client = await clientPromise
		const db = {
			course: client
				.db(auth._handle)
				?.collection("course") as Collection<Course>,
			section: client
				.db(auth._handle)
				?.collection("section") as Collection<Section>,
			activity: client
				.db(auth._handle)
				?.collection("activity") as Collection<Activity>,
			content: client
				.db(auth._handle)
				?.collection("content") as Collection<Content>,
		}

		//Parse text and generate embeddings
		const embedding = await createEmbedding(
			auth._handle,
			body.content,
			files
		)
		if (!embedding)
			throw new ContentManagerError(`Unable to generate embeddings`)
		embedding.forEach((ids, idx) => {
			if (ids) body.content[idx]._slices = ids
			console.log(body.content[idx]._slices)
		})
		console.log(
			`${chalk.magenta(
				"[Debugging]"
			)} :: Finished generating embeddings \n\t${embedding}`
		)

		// If update remove old documents and vectors
		if (update) {
			console.log(
				`${chalk.magenta(
					"[Debugging]"
				)} :: Deleting old documents and vectors`
			)
			const hack = {
				content: body.content,
			}

			try {
				await deleteContent(request, response, auth, hack, true)
			} catch (err) {
				throw err
			}
			console.log(
				`${chalk.magenta(
					"[Debugging]"
				)} :: Finished Deleting old documents and vectors`
			)
		}

		//Store new file into database
		await db.content.insertMany(body.content)
		console.log(
			`${chalk.magenta("[Debugging]")} :: Finished adding file document`
		)

		//Check if course, section and activity exists, if not create them
		if (
			!(await db.course.findOne({
				_id: body.course._id,
			}))
		)
			await db.course.insertOne(body.course)

		if (
			!(await db.section.findOne({
				_id: body.section._id,
			}))
		)
			await db.section.insertOne(body.section)

		if (
			!(await db.activity.findOne({
				_id: body.activity._id,
			}))
		)
			await db.activity.insertOne(body.activity)

		console.log(
			`${chalk.magenta(
				"[Debugging]"
			)} :: Finished checking course,section,activity`
		)

		//Return response
		return response.status(200).json({
			route: request.url,
			isSuccess: false,
			message: "Files uploaded successfully",
			data: {
				handle: auth._handle,
				files: files.length,
				vectors: [], //TODO: Array of vector/slices counts per file
				tokens: [], //TODO: Array of total token usage per file
			},
		})
	} catch (error) {
		console.error(error)
		response.status(500).json({
			route: request.url,
			isSuccess: true,
			message: error instanceof Error ? error.message : "",
			data: error instanceof ContentManagerError ? error.data : {},
		})
	}
}

export async function deleteContent(
	request: NextApiRequest,
	response: NextApiResponse,
	auth: Auth,
	body: { content: Content[] },
	update?: boolean
) {
	console.log(body)
	try {
		if (!body.content) {
			throw new ContentManagerError(`Missing content data in body`)
		}

		if (!Array.isArray(body.content)) {
			throw new ContentManagerError(`body.content is not an array`)
		}

		//Connect the dbs
		const client = await clientPromise
		const db = {
			course: client
				.db(auth._handle)
				?.collection("course") as Collection<Course>,
			section: client
				.db(auth._handle)
				?.collection("section") as Collection<Section>,
			activity: client
				.db(auth._handle)
				?.collection("activity") as Collection<Activity>,
			content: client
				.db(auth._handle)
				.collection("content") as Collection<Content>,
		}

		//Find the documents
		const ids = body.content.map((i: Content) => i._id)
		const contents = await db.content.find({ _id: { $in: ids } }).toArray()
		if (contents.length == 0) {
			throw new ContentManagerError(`Unable to find content`, null, ids)
		}

		const slices = contents.map((i: Content) => i._slices)

		for (let idx = 0; idx < slices.length; idx++) {
			const _slices = slices[idx]

			//Delete embedding
			console.log(
				`${chalk.magenta(
					"[Debugging]"
				)} :: Deleting embedding for file ${idx}`
			)
			const success = await deleteEmbedding(auth._handle, _slices)
			console.log(success)
			if (!success) {
				throw new ContentManagerError(
					`Unable to delete embedding`,
					null,
					{ _id: ids[idx], _slices: _slices }
				)
			}

			if (success.length !== _slices.length) {
				throw new ContentManagerError(
					`Unable to delete some embedding`,
					null,
					{
						_id: ids[idx],
						_slices: _slices.filter((i: string) =>
							success.includes(i)
						),
					}
				)
			}

			//Delete documents from db
			console.log(
				`${chalk.magenta(
					"[Debugging]"
				)} :: Deleting documents for file ${idx}`
			)
			const result = await db.content.deleteMany({
				_id: { $in: ids },
			})
			if (!result) {
				throw new ContentManagerError(
					`Unable to delete content`,
					null,
					ids
				)
			}
		}

		//Check if course,section,activity is empty and delete if so
		console.log(
			`${chalk.magenta(
				"[Debugging]"
			)} :: Checking if remaining course, section, activity is empty`
		)
		for (let i = 0; i < body.content.length; i++) {
			const content = body.content[i] as Content
			if (
				!(await db.content.findOne({
					_id: content._course,
				}))
			)
				await db.course.deleteOne({
					_id: content._course,
				})

			if (
				!(await db.content.findOne({
					_id: content._section,
				}))
			)
				await db.section.deleteOne({
					_id: content._section,
				})

			if (
				!(await db.content.findOne({
					_id: content._activity,
				}))
			)
				await db.activity.deleteOne({
					_id: content._activity,
				})
		}

		console.log(
			`${chalk.magenta(
				"[Debugging]"
			)} :: Finished deleting content successfully`
		)

		if (update) return true
		return response.status(200).json({
			route: request.url,
			isSuccess: true,
			message: "Content deleted successfully",
			data: {
				handle: auth._handle,
				_id: ids,
			},
		})
	} catch (error) {
		console.error(error)
		response.status(500).json({
			route: request.url,
			isSuccess: true,
			message: error instanceof Error ? error.message : "",
			data: error instanceof ContentManagerError ? error.data : {},
		})
	}
}
