import { ChromaClient, Collection, OpenAIEmbeddingFunction } from "chromadb"
import { Metadatas } from "chromadb/dist/main/types"

if (!process.env.OPENAI_API_KEY) {
	throw new Error('Invalid/Missing environment variable: "OPENAI_API_KEY"')
}

const client = new ChromaClient()
const embedder = new OpenAIEmbeddingFunction({
	openai_api_key: process.env.OPENAI_API_KEY,
})

async function createCollection(_collection: string) {
	try {
		let collection = (await client.listCollections()).filter(
			(i) => i.name === _collection
		)
		if (collection.length !== 0) {
			return true
		} else {
			await client.createCollection({
				name: _collection,
				embeddingFunction: embedder,
			})
			return true
		}
	} catch (error) {
		console.log(error)
		return false
	}
}

export async function insertItem(
	_collection: string,
	_ids: string[],
	_documents: string[],
	_metadatas?: Metadatas
) {
	const list = await client.listCollections()
	let collection: Collection

	if (!list.find((i) => i.name === _collection)) {
		collection = await client.createCollection({
			name: _collection,
			embeddingFunction: embedder,
		})
	} else {
		collection = await client.getCollection({
			name: _collection,
			embeddingFunction: embedder,
		})
	}

	const documents = await collection.upsert({
		ids: _ids,
		metadatas: _metadatas,
		documents: _documents,
	})
	return documents
}

export async function searchItem(
	_collection: string,
	query: string,
	_module?: string,
	nResults = 3
) {
	try {
		const collection = await client.getCollection({
			name: _collection,
			embeddingFunction: embedder,
		})

		const results = await collection.query({
			nResults: nResults,
			queryTexts: [query],
			where: _module ? { _module: _module } : undefined,
		})

		return results
	} catch (error) {
		console.log(error)
		return null
	}
}

export async function deleteItem(_collection: string, _id: string) {
	try {
		const collection = await client.getCollection({
			name: _collection,
			embeddingFunction: embedder,
		})

		const results = await collection.delete({
			ids: [_id],
		})

		return results
	} catch (error) {
		console.log(error)
		return null
	}
}

export async function getItem(_collection: string, _id: string) {
	try {
		const collection = await client.getCollection({
			name: _collection,
			embeddingFunction: embedder,
		})

		const results = await collection.get({
			ids: [_id],
		})

		return results
	} catch (error) {
		console.log(error)
		return null
	}
}

export async function _reset() {
	const result = await client.reset()
	return result
}

export async function _get() {
	const collectionList = await client.listCollections()
	const documents: any = {}
	for (let i = 0; i < collectionList.length; i++) {
		const c = collectionList[i]
		const collection = await client.getCollection({
			name: c.name,
			embeddingFunction: embedder,
		})
		let results = await collection.get()
		documents[c.name] = results
	}

	return documents
}
