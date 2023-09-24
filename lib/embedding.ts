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

export async function middleware(d: Content, f: formidable.File) {
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

export async function createEmbedding(
	_handle: string,
	docs: Content[],
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
						_course: f._course,
						_section: f._section,
						_activity: f._activity,
						_content: f._id.toString(),
						_sliceIdx: i,
					},
				})
			}
			file_entries.push(props)
		}
	}

	const response = []

	for (let idx = 0; idx < file_entries.length; idx++) {
		const props = file_entries[idx]
		const results = await insertItem(_handle, "Content", {
			_ids: props.map((i) => i.id),
			documents: props.map((i) => i.documents),
			metas: props.map((i) => i.metas),
		})
		response.push(results)
	}

	return response
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
	return await generativeResponse(_handle, "Content", _course, query)
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

export async function deleteEmbedding(_handle: string, _ids: string[]) {
	const results: string[] = []

	for (let i = 0; i < _ids.length; i++) {
		const id = _ids[i]
		const res = await deleteItem(_handle, "Content", id)
		if (res) results.push(res)
	}

	return results
}

// export async function getEmbedding(_handle: string, _ref: string) {
// 	const results = await getItem(_handle, "file", { _ids: [_ref] })

// 	return results
// }
