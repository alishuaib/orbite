import formidable from "formidable"
import chalk from "chalk"
//DB
import {
	createEmbedding,
	deleteEmbedding,
	insertEmbedding,
} from "@/lib/embedding"
import prisma from "@/lib/prisma-client"
//Types
import { z } from "zod"
import { Authorization } from "@/lib/middleware/checkAuth"
import { NextApiRequest, NextApiResponse } from "next/types"

const schema = z.object({
	fields: z.object({
		body: z.object({
			course: z.object({
				id: z.number(),
				title: z.string(),
				label: z.string().optional(),
				summary: z.string().optional(),
				icon: z.string().optional(),
				visible: z.boolean(),
				url: z.string().optional(),
				namespace: z.string().optional(),
				category: z.string().optional(),
				tags: z.string().optional(),
				version: z.string(),
				meta: z.record(z.any()).optional(),
			}),
			section: z.object({
				id: z.number(),
				title: z.string(),
				summary: z.string().optional(),
				order: z.string(),
				visible: z.boolean(),
				url: z.string().optional(),
				version: z.string(),
				meta: z.record(z.any()).optional(),
			}),
			module: z.object({
				id: z.number(),
				title: z.string(),
				summary: z.string().optional(),
				order: z.string(),
				visible: z.boolean(),
				url: z.string().optional(),
				version: z.string(),
				meta: z.record(z.any()).optional(),
			}),
			content: z.array(
				z.object({
					id: z.number(),
					name: z.string(),
					ext: z.string(),
					visible: z.boolean(),
					size: z.number().optional(),
					mimetype: z.string().optional(),
					modified_at: z.string().optional(),
					url: z.string().optional(),
					version: z.string(),
					meta: z.record(z.any()).optional(),

					//Undefined by default
					slice_ids: z.string().optional(),
				})
			),
		}),
	}),
	files: z.object({ file: z.array(z.any()).min(1) }),
	err: z.any().optional(),
})

export { schema as ContentBodySchema }
export type ContentBodyType = z.TypeOf<typeof schema>

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
	form: ContentBodyType,
	update?: boolean
) {
	try {
		//Validate form-data
		// const { body, files } = validateForm(form, [
		// 	"course",
		// 	"section",
		// 	"module",
		// 	"content",
		// ])
		const body = form.fields.body
		const files = form.files.file
		console.log(
			`${chalk.magenta("[Debugging]")} :: Finished Validating form-data`
		)

		//Parse text and generate embeddings
		console.log(`${chalk.magenta("[Debugging]")} :: Parsing uploaded files`)
		const parsed_files = await createEmbedding(
			auth.handle,
			{
				course_id: body.course.id,
				section_id: body.section.id,
				module_id: body.module.id,
			},
			body.content,
			files
		)
		if (!parsed_files)
			throw new ContentManagerError(`Unable to parse file for embeddings`)
		console.log(
			`${chalk.magenta(
				"[Debugging]"
			)} :: Finished parsing file for embeddings \n\t${parsed_files}`
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

		//Generate and insert embeddings
		console.log(
			`${chalk.magenta(
				"[Debugging]"
			)} :: Creating and inserting embeddings`
		)
		const embedding = await insertEmbedding(auth.handle, parsed_files)
		embedding.forEach((ids, idx) => {
			if (ids) body.content[idx].slice_ids = ids.join(",")
			console.log(body.content[idx].slice_ids)
		})
		if (!parsed_files)
			throw new ContentManagerError(
				`Unable to create and insert embeddings`
			)
		console.log(
			`${chalk.magenta(
				"[Debugging]"
			)} :: Finished creating and inserting embeddings \n\t${embedding}`
		)
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
		body.content.forEach((content) => {
			if (content.slice_ids == undefined) {
				throw Error(
					`Attempted to insert content without processed slice_ids (id: ${content.id})`
				)
			}
		})
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
								slice_ids: content.slice_ids!, //Safe since we check for undefined above
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
			isSuccess: true,
			message: "Files uploaded successfully",
			data: {
				handle: auth.handle,
				files: files.length,
				vectors: body.content.map((c: any) => c.slice_ids), //TODO: Array of vector/slices counts per file
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

		//Delete embeddings from vector db
		for (let idx = 0; idx < content_ids.length; idx++) {
			const id = content_ids[idx]
			console.log(
				`${chalk.magenta(
					"[Debugging]"
				)} :: Deleting embedding for content id:${id}`
			)
			const success = await deleteEmbedding(auth.handle, id)

			console.log(success)
			if (!success) {
				throw new ContentManagerError(
					`Unable to delete embedding`,
					null,
					{ content_id: id }
				)
			}
		}

		// //Find the documents
		// const ids = content_ids
		// const contents = await prisma.content.findMany({
		// 	where: {
		// 		auth_id: auth.id,
		// 		id: {
		// 			in: ids,
		// 		},
		// 	},
		// })

		// if (contents.length == 0) {
		// 	throw new ContentManagerError(`Unable to find content`, null, ids)
		// }

		// const slices = contents.map((i) => i.slice_ids.split(","))

		// for (let idx = 0; idx < slices.length; idx++) {
		// 	const _slices = slices[idx]

		// 	//Delete embedding
		// 	console.log(
		// 		`${chalk.magenta(
		// 			"[Debugging]"
		// 		)} :: Deleting embedding for file ${idx}`
		// 	)
		// 	const success = await deleteEmbedding(auth.handle, _slices)
		// 	console.log(success)
		// 	if (!success) {
		// 		throw new ContentManagerError(
		// 			`Unable to delete embedding`,
		// 			null,
		// 			{ _id: ids[idx], _slices: _slices }
		// 		)
		// 	}

		// 	if (success.length !== _slices.length) {
		// 		throw new ContentManagerError(
		// 			`Unable to delete some embedding`,
		// 			null,
		// 			{
		// 				_id: ids[idx],
		// 				_slices: _slices.filter((i: string) =>
		// 					success.includes(i)
		// 				),
		// 			}
		// 		)
		// 	}
		// }
		//Delete documents from db
		console.log(
			`${chalk.magenta(
				"[Debugging]"
			)} :: Deleting documents for files ${content_ids}`
		)
		const result = await prisma.content.deleteMany({
			where: {
				auth_id: auth.id,
				id: {
					in: content_ids,
				},
			},
		})
		if (!result) {
			throw new ContentManagerError(
				`Unable to delete content`,
				null,
				content_ids
			)
		}

		//Check if course,section,activity is empty and delete if so
		console.log(
			`${chalk.magenta(
				"[Debugging]"
			)} :: Cleaning up empty courses, sections and modules`
		)
		await prisma.module.deleteMany({
			where: {
				auth_id: auth.id,
				contents: {
					none: {},
				},
			},
		})
		await prisma.section.deleteMany({
			where: {
				auth_id: auth.id,
				modules: {
					none: {},
				},
			},
		})
		await prisma.course.deleteMany({
			where: {
				auth_id: auth.id,
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
				_id: content_ids,
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

export async function getContent(
	request: NextApiRequest,
	response: NextApiResponse,
	auth: Authorization,
	content_ids?: number[]
) {
	try {
		console.log(content_ids)
		const content = await prisma.content.findMany({
			where: {
				auth_id: auth.id,
				id: {
					in:
						content_ids && content_ids.length > 0
							? content_ids
							: undefined,
				},
			},
		})
		if (content.length == 0) {
			throw new Error(`No content found with ids: [${content_ids}]`)
		}
		return response.status(200).json({
			route: request.url,
			isSuccess: true,
			message: "Content found successfully",
			data: content,
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
