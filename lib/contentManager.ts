import formidable from "formidable"
import chalk from "chalk"
import clientPromise from "@/lib/mongodb"
import { createEmbedding, deleteEmbedding } from "@/lib/embedding"
import prisma from "@/lib/prisma-client"
import { Authorization } from "@/lib/middleware/checkAuth"
//Types
import { NextApiRequest, NextApiResponse } from "next/types"
import { Auth, Course, Section, Activity, Content } from "@/lib/@schemas"
import { Collection, ObjectId } from "mongodb"
import content from "@/pages/api/v1/content"

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
	require: Array<"course" | "section" | "module" | "content"> = ["content"]
) {
	const { fields, files } = data
	console.log(fields, files)
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
	console.log(parse)
	if (!require.every((value) => Object.keys(parse).includes(value))) {
		throw new ContentManagerError(
			`Form-data is missing ${require.filter(
				(i) => !Object.keys(fields).includes(i)
			)} fields`
		)
	}

	const body = {
		course: parse.course,
		section: parse.section,
		module: parse.module,
		content: parse.content as any[],
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
	auth: Authorization,
	form: FormidableResult,
	update?: boolean
) {
	try {
		//Validate form-data
		const { body, files } = validateForm(form, [
			"course",
			"section",
			"module",
			"content",
		])
		console.log(
			`${chalk.magenta("[Debugging]")} :: Finished Validating form-data`
		)

		//Parse text and generate embeddings

		const embedding = await createEmbedding(
			auth.handle,
			{
				course_id: body.course.id,
				section_id: body.section.id,
				module_id: body.module.id,
			},
			body.content,
			files
		)
		if (!embedding)
			throw new ContentManagerError(`Unable to generate embeddings`)
		embedding.forEach((ids, idx) => {
			if (ids) body.content[idx].slice_ids = ids.join(",")
			console.log(body.content[idx].slice_ids)
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
			const hack = body.content.map((c) => c.id)

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

		//Prisma record writing

		//Find or create course if it doesn't exist
		const course = await prisma.course.upsert({
			where: {
				id: body.course.id,
			},
			update: {},
			create: {
				...body.course,
				auth: {
					connect: {
						id: auth.id,
					},
				},
			},
		})

		//Add a new related section if it doesn't exist
		const section = await prisma.section.upsert({
			where: {
				id: body.section.id,
			},
			update: {},
			create: {
				...body.section,
				auth: {
					connect: {
						id: auth.id,
					},
				},
				parent: {
					connect: {
						id: course.id,
					},
				},
			},
		})

		//Add a new related module if it doesn't exist
		await prisma.module.upsert({
			where: {
				id: body.module.id,
			},
			update: {},
			create: {
				...body.module,
				auth: {
					connect: {
						id: auth.id,
					},
				},
				parent: {
					connect: {
						id: section.id,
					},
				},
			},
		})

		//Add newly created content to corresponding module
		await prisma.module.update({
			where: {
				id: body.module.id,
			},
			data: {
				contents: {
					createMany: {
						data: body.content.map((content) => {
							return {
								...content,
								auth_id: auth.id, //Cant use connect syntax with createMany
							}
						}),
					},
				},
			},
			include: {
				contents: true,
			},
		})

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
				handle: auth.handle,
				files: files.length,
				vectors: body.content.map((c: any) => c.id), //TODO: Array of vector/slices counts per file
				tokens: [], //TODO: Array of total token usage per file
			},
		})
	} catch (error) {
		console.error(error)
		response.status(500).json({
			route: request.url,
			isSuccess: false,
			message: error instanceof Error ? error.message : "",
			data: error instanceof ContentManagerError ? error.data : {},
		})
	}
}

export async function deleteContent(
	request: NextApiRequest,
	response: NextApiResponse,
	auth: Authorization,
	content_ids: number[],
	update?: boolean
) {
	console.log(content_ids)
	try {
		if (!content_ids) {
			throw new ContentManagerError(`Missing content data in body`)
		}

		if (!Array.isArray(content_ids)) {
			throw new ContentManagerError(`body.content is not an array`)
		}

		//Find the documents
		const ids = content_ids
		const contents = await prisma.content.findMany({
			where: {
				id: {
					in: ids,
				},
			},
		})

		if (contents.length == 0) {
			throw new ContentManagerError(`Unable to find content`, null, ids)
		}

		const slices = contents.map((i) => i.slice_ids.split(","))

		for (let idx = 0; idx < slices.length; idx++) {
			const _slices = slices[idx]

			//Delete embedding
			console.log(
				`${chalk.magenta(
					"[Debugging]"
				)} :: Deleting embedding for file ${idx}`
			)
			const success = await deleteEmbedding(auth.handle, _slices)
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
		}
		//Delete documents from db
		console.log(
			`${chalk.magenta(
				"[Debugging]"
			)} :: Deleting documents for files ${ids}`
		)
		const result = await prisma.content.deleteMany({
			where: {
				id: {
					in: ids,
				},
			},
		})
		if (!result) {
			throw new ContentManagerError(`Unable to delete content`, null, ids)
		}

		//Check if course,section,activity is empty and delete if so
		console.log(
			`${chalk.magenta(
				"[Debugging]"
			)} :: Cleaning up empty courses, sections and modules`
		)
		await prisma.module.deleteMany({
			where: {
				contents: {
					none: {},
				},
			},
		})
		await prisma.section.deleteMany({
			where: {
				modules: {
					none: {},
				},
			},
		})
		await prisma.course.deleteMany({
			where: {
				sections: {
					none: {},
				},
			},
		})

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
				handle: auth.handle,
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
