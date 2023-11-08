import { Content } from "@/lib/@schemas"
import { StatusResponse } from "@/lib/@types"
import {
	insertItem,
	deleteItem,
	generativeResponse,
	// queryIndex,
	// getItem,
	// Metadata,
} from "@/lib/weaviate"
import { Filter } from "@/lib/pinecone"
import { parseFile, slicer } from "@/lib/parser"
import { encode, decode } from "gpt-3-encoder"
import {
	QueryResponse,
	instanceOfQueryResponse,
} from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch"

import formidable from "formidable"
import { v4 } from "uuid"
import { ContentBodyType } from "./contentManager"

type ContentDocsArray = ContentBodyType["fields"]["body"]["content"]
export async function middleware(d: ContentDocsArray[0], f: formidable.File) {
	//TODO: Improve tokenizer slicing to better to handle large files
	const parsed = await parseFile(f)
	if (parsed) {
		const sliced = await slicer(parsed, 300)
		// const encoded = encode(parsed)
		// if (encoded.length > 8000) {
		// 	return decode(encoded.slice(0, 8000))
		// }
		return sliced
	}
	return null
}

export async function insertEmbedding(
	handle: string,
	file_entries: {
		id: string
		documents: string
		metas: {
			course_id: number
			section_id: number
			module_id: number
			content_id: number
			slice_index: number
		}
	}[][]
) {
	const response = []

	for (let idx = 0; idx < file_entries.length; idx++) {
		const props = file_entries[idx]
		const results = await insertItem(handle, "Content", {
			_ids: props.map((i) => i.id),
			documents: props.map((i) => i.documents),
			metas: props.map((i) => i.metas),
		})
		response.push(results)
	}

	return response
}

export async function createEmbedding(
	handle: string,
	ids: {
		course_id: number
		section_id: number
		module_id: number
	},
	docs: ContentDocsArray,
	files: formidable.File[]
) {
	const file_entries = []
	console.log(docs)
	//Filter out unsupported file types for embedding
	for (let idx = 0; idx < docs.length; idx++) {
		const f = docs[idx]
		const d = await middleware(f, files[idx])
		if (d) {
			const props = []
			for (let i = 0; i < d.length; i++) {
				props.push({
					id: v4(),
					documents: d[i],
					metas: {
						course_id: ids.course_id,
						section_id: ids.section_id,
						module_id: ids.module_id,
						content_id: f.id,
						slice_index: i,
					},
				})
			}
			file_entries.push(props)
		}
	}

	return file_entries
}

// export type SearchResponse = {
// 	status: boolean
// 	files: string[]
// 	ids: string[]
// 	distances: number[]
// 	values: number[][]
// }

export async function searchEmbedding(
	_handle: string,
	query: string,
	_course: string,
	_module?: string
) {
	//CONTINUE :: Parse the returned response into a standard return format
	// return await generativeResponse(_handle, "Content", _course, query)
	// const filter: Filter = {}
	// if (_course) filter["_course"] = { $in: [_course] }
	// if (_module) filter["_module"] = { $in: [_module] }
	// const results = await queryIndex(_handle, "file", query, filter)
	// if (results && instanceOfQueryResponse(results)) {
	// 	let res = results as QueryResponse
	// 	return {
	// 		status: true,
	// 		files: res.matches?.map((i) => (i?.metadata as Metadata)._file),
	// 		ids: res.matches?.map((i) => i.id),
	// 		distances: res.matches?.map((i) => i.score),
	// 		values: res.matches?.map((i) => i.values),
	// 	} as SearchResponse
	// } else {
	// 	return results as StatusResponse
	// }
}

export async function deleteEmbedding(
	_handle: string,
	id: number,
	type: "course" | "section" | "module" | "content"
) {
	const results = await deleteItem(_handle, "Content", id, type)
	return results
}

// export async function getEmbedding(_handle: string, _ref: string) {
// 	const results = await getItem(_handle, "file", { _ids: [_ref] })

// 	return results
// }
