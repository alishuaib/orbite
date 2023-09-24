//
// Pinecone requires a customer vectorizer which allows more control over the vectorization process but requires more work to set up.
//
import clientPromise from "@/lib/pinecone-client"
import {
	VectorOperationsApi,
	UpsertRequest,
	QueryRequest,
	IndexMeta,
	UpsertResponse,
	QueryResponse,
} from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch"

import { embedder } from "@/lib/openai"
import { StatusResponse } from "@/lib/@types"

// Set up the client

async function _createIndex(
	_handle: string,
	create: boolean = true
): Promise<VectorOperationsApi | null> {
	try {
		const client = await clientPromise
		console.log("_createIndex", client.projectName)
		const indexes = await client.listIndexes()
		if (!indexes.includes(_handle)) {
			if (!create) return null

			const res = await client.createIndex({
				createRequest: {
					name: _handle,
					dimension: 1536, //OpenAI Embedding Dimensions 1536
				},
			})

			console.log("_createIndex :: index created", res)

			// Wait until index is ready to be used before returning
			const readyWait = new Promise(async (resolve) => {
				let timer = 0
				const checkReady = async () => {
					timer += 5
					const stats = await client.describeIndex({
						indexName: _handle,
					})
					if (process.env.NODE_ENV === "development") {
						console.log(
							"_createIndex :: checking index status",
							`Time Elapsed: ${timer} seconds`,
							stats.status
						)
					}
					if (stats.status?.ready) {
						console.log(
							"_createIndex :: index is ready",
							stats.status
						)
						resolve(stats.status)
					} else {
						setTimeout(checkReady, 5000)
					}
				}
				checkReady()
			})

			await readyWait
			return client.Index(_handle)
		} else {
			return client.Index(_handle)
		}
	} catch (error) {
		console.log(error)
		return null
	}
}

//
// Insert a document into the Pinecone index
// 1. Create the index if it doesn't exist
// 2. Loop through each document provided
// 3. Generate a openai embedding for each document
// 4. Upsert the document into the index
// Note: Namespace defines the type of item i.e course, module, file, etc.
// Note: Metadata is used to define the items filter content
//

export async function insertItem(
	_handle: string,
	namespace: string,
	data: { _ids: string[]; documents: string[][]; metas: object[] }
) {
	const index = await _createIndex(_handle)
	if (!index)
		return {
			status: false,
			result: ["insertItem :: Failed to find index"],
		}

	const responseCollective: string[][] = []

	for (let idx = 0; idx < data.documents.length; idx++) {
		const doc = data.documents[idx]
		const _vectors = await embedder(doc)
		if (!_vectors)
			return {
				status: false,
				result: ["insertItem :: Failed to generate embeddings"],
			}

		const upsertRequest: UpsertRequest = {
			vectors: [],
			namespace: namespace,
		}
		for (let i = 0; i < _vectors.length; i++) {
			upsertRequest.vectors.push({
				id: data._ids[idx] + `-${i}`,
				values: _vectors[i],
				metadata: data.metas[idx],
			})
		}
		// console.log(upsertRequest)
		await index.upsert({ upsertRequest })
		responseCollective.push(upsertRequest.vectors.map((v) => v.id))
	}

	console.log(responseCollective)
	return responseCollective
}

export async function deleteItem(
	_handle: string,
	namespace: string,
	data: { _ids: string[] }
) {
	try {
		const index = await _createIndex(_handle, false)

		if (!index)
			return {
				status: false,
				result: ["deleteItem :: Failed to find index"],
			}

		const response = await index.delete1({
			ids: data._ids,
			namespace: namespace,
		})

		return response
	} catch (error) {
		console.log(error)
		return null
	}
}

export async function getItem(
	_handle: string,
	namespace: string,
	data: { _ids: string[] }
) {
	try {
		const index = await _createIndex(_handle, false)

		if (!index)
			return {
				status: false,
				result: ["getItem :: Failed to find index"],
			}

		const response = await index.fetch({
			ids: data._ids,
			namespace: namespace,
		})

		return response
	} catch (error) {
		console.log(error)
		return null
	}
}

export type Metadata = {
	_course?: string
	_module?: string
	_file?: string
}

export async function getItemByMeta(
	_handle: string,
	namespace: string,
	filter: Metadata
) {
	try {
		const index = await _createIndex(_handle, false)

		if (!index)
			return {
				status: false,
				result: ["query :: Failed to find index"],
			}

		const queryRequest: QueryRequest = {
			namespace: namespace,
			topK: 1000,
			filter: filter,
			includeMetadata: true,
			includeValues: true,
			vector: Array(1536).fill(0),
		}

		const response = await index.query({ queryRequest })

		return response
	} catch (error) {
		console.log(error)
		return null
	}
}

//
// Used to query the Pinecone index
// filter allows you to filter the results based on the metadata provided when inserting the document
//
export interface Filter {
	[key: string]: {
		$in: string[]
	}
}

export async function queryIndex(
	_handle: string,
	namespace: string,
	query: string,
	filter: Filter,
	nResults = 3
): Promise<QueryResponse | StatusResponse> {
	try {
		const index = await _createIndex(_handle, false)

		if (!index)
			return {
				status: false,
				result: ["query :: Failed to find index"],
			} as StatusResponse

		const queryVector = await embedder([query])
		if (!queryVector)
			return {
				status: false,
				result: ["query :: Failed to generate embeddings"],
			} as StatusResponse

		const queryRequest: QueryRequest = {
			namespace: namespace,
			topK: nResults,
			filter: filter,
			includeMetadata: true,
			includeValues: true,
			vector: queryVector[0],
		}

		const response = await index.query({ queryRequest })

		return response
	} catch (error) {
		console.log(error)
		return {
			status: false,
			result: [error],
		} as StatusResponse
	}
}

export async function _reset(_handle: string) {
	const client = await clientPromise
	const index = await _createIndex(_handle, false)

	if (!index)
		return {
			status: false,
			result: ["_reset :: Failed to find index"],
		}

	await index.delete1({ deleteAll: true })
	await client.deleteIndex({
		indexName: _handle,
	})
	return {
		status: true,
		result: [`_reset :: Reset for index ${_handle} successful`],
	}
}

export async function _get(_handle: string) {
	const client = await clientPromise
	const stats = await client.describeIndex({ indexName: _handle })
	return stats
}
