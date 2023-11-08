import weaviate, {
	WeaviateClient,
	ObjectsBatcher,
	ApiKey,
} from "weaviate-ts-client"

const client: WeaviateClient = weaviate.client({
	scheme: "https",
	host: process.env.WEAVIATE_HOST as string,
	apiKey: new ApiKey(process.env.WEAVIATE_API_KEY as string),
	headers: { "X-OpenAI-Api-Key": process.env.OPENAI_API_KEY as string }, // Replace with your inference API key
})

async function _createCollection(_collection: string) {
	try {
		let collection = await _checkCollection(_collection)
		if (collection) {
			return collection
		} else {
			let classObj = {
				class: _collection,
				vectorizer: "text2vec-openai",
				moduleConfig: {
					"generative-openai": {},
					"text2vec-openai": {
						model: "ada",
						modelVersion: "002",
						type: "text",
					},
				},
				properties: [
					{
						name: "text",
						description: "Content for this slice of document",
						dataType: ["text"],
					},
					{
						name: "course_id",
						description: "Metadata for course id",
						dataType: ["number"],
					},
					{
						name: "section_id",
						description: "Metadata for section id",
						dataType: ["number"],
					},
					{
						name: "module_id",
						description: "Metadata for module id",
						dataType: ["number"],
					},
					{
						name: "content_id",
						description: "Metadata for parent content id",
						dataType: ["number"],
					},
					{
						name: "slice_index",
						description: "Metadata for slice index",
						dataType: ["number"],
					},
				],
				multiTenancyConfig: { enabled: true },
			}

			console.log("Creating new collection " + _collection)
			collection = await client.schema
				.classCreator()
				.withClass(classObj)
				.do()

			return collection
		}
	} catch (error) {
		console.log(error)
		return null
	}
}

async function _checkCollection(_collection: string) {
	let collection = (await client.schema.getter().do()).classes?.filter(
		(i) => i.class === _collection
	)
	return collection?.length !== 0 ? collection?.pop() : null
}

async function _createTentant(_handle: string, _collection: string) {
	try {
		let tenant = await _checkTentant(_handle, _collection)
		if (tenant) {
			return tenant
		} else {
			console.log("Creating new Tenants")
			let tenant = await client.schema
				.tenantsCreator(_collection, [{ name: _handle }])
				.do()

			return tenant
		}
	} catch (error) {
		console.log(error)
		return null
	}
}

async function _checkTentant(_handle: string, _collection: string) {
	let tenants = (await client.schema.tenantsGetter(_collection).do()).filter(
		(i) => i.name === _handle
	)
	return tenants?.length !== 0 ? tenants?.pop() : null
}

type schema = {
	class?: string | undefined
	vectorWeights?:
		| {
				[key: string]: unknown
		  }
		| undefined
	properties?:
		| {
				[key: string]: unknown
		  }
		| undefined
	id?: string | undefined
	creationTimeUnix?: number | undefined
	lastUpdateTimeUnix?: number | undefined
	vector?: number[] | undefined
	additional?: {} | undefined
}

/**
 * Inserts an item into a Weaviate collection. Called per file
 * @async
 * @param _handle - The handle for organization, used to set tenants
 * @param namespace - The name of the collection to insert the item into.
 * @param data - Object containing the data to insert.
 * @throws If there is an error inserting the item.
 * @returns A promise that resolves when the item is inserted.
 */
export async function insertItem(
	_handle: string,
	namespace: string = "Content",
	data: {
		_ids: string[]
		documents: string[]
		metas: {
			course_id: number
			section_id: number
			module_id: number
			content_id: number // Content this slice of text belongs to
			slice_index: number // Index of slice in content
		}[]
	}
) {
	namespace = namespace.charAt(0).toUpperCase() + namespace.slice(1)
	const collection = await _createCollection(namespace) //Create collection if it dosen't exist

	if (!collection) return null

	const tenant = await _createTentant(_handle, namespace)

	if (!tenant) return null

	//Insert vectors as Batch
	let batcher5 = client.batch.objectsBatcher()
	console.log(
		`[WEAVIATE] Batch Inserting ${data.documents.length} vectors for ${namespace} ${_handle}`
	)
	for (let i = 0; i < data.documents.length; i++) {
		batcher5 = batcher5.withObject({
			class: namespace,
			properties: { text: data.documents[i], ...data.metas[i] },
			tenant: _handle,
			id: data._ids[i],
		})
	}

	await batcher5.do()

	//Insert vectors in sequence
	/*
	for (let i = 0; i < data.documents.length; i++) {
		console.log(`[WEAVIATE] Inserting vector ${i} of ${data.documents.length}`)
		await client.data
			.creator()
			.withClassName(namespace)
			.withId(data._ids[i])
			.withProperties({ text: data.documents[i], ...data.metas[i] })
			.withTenant(_handle)
			.do()
	}
	**/

	return data._ids
}

export async function deleteItem(
	_handle: string,
	namespace: string = "content",
	_id: number, //ID of content to delete,
	path: "course" | "section" | "module" | "content" = "content"
) {
	try {
		namespace = namespace.charAt(0).toUpperCase() + namespace.slice(1)
		const collection = await _checkCollection(namespace) //Check if collection exists

		if (!collection) return null

		const res = await client.batch
			.objectsBatchDeleter()
			.withClassName(namespace)
			.withWhere({
				path: [path + "_id"],
				operator: "Equal",
				valueNumber: _id,
			})
			.withTenant(_handle)
			.withOutput("verbose")
			.do()
		console.log(res)
		if (!res.results?.objects || res.results?.matches == 0) {
			throw Error(`Usage Error: No vector in db for ${path} id: ${_id}`)
		}
		const results = res.results?.objects?.flatMap((i) => i.id)
		return results
	} catch (error) {
		throw error
	}
}

export async function getItem(
	_handle: string,
	namespace: string = "content",
	_id: number //ID of content to delete
) {
	try {
		namespace = namespace.charAt(0).toUpperCase() + namespace.slice(1)
		const collection = await _checkCollection(namespace) //Check if collection exists

		if (!collection) return null

		const res = await client.graphql
			.get()
			.withClassName(namespace)
			.withTenant(_handle)
			.withWhere({
				path: ["content_id"],
				operator: "Equal",
				valueNumber: _id,
			})
			.withFields(
				"text course_id section_id module_id content_id slice_index"
			)
			.do()

		console.log(res)
		if (
			!res.data ||
			!res.data.Get ||
			!res.data.Get[namespace] ||
			res.data.Get[namespace].length == 0
		) {
			throw Error(`Usage Error: No vector in db for content id: ${_id}`)
		}
		return res.data.Get[namespace]
	} catch (error) {
		throw error
	}
}

export async function generativeResponse(
	_handle: string,
	namespace: string = "content",
	_course: number,
	query: string
) {
	try {
		namespace = namespace.charAt(0).toUpperCase() + namespace.slice(1)
		const collection = await _checkCollection(namespace) //Check if collection exists

		if (!collection) return null

		const res = await client.graphql
			.get()
			.withClassName(namespace)
			.withGenerate({
				singlePrompt: `
				Given the following extracted parts of a long document (SOURCES) about the product (PRODUCT_NAME) and a question (QUESTION), you must create a brief final answer.

				Don't try to make up an answer and use the text in the SOURCES only for the answer. If you don't know the answer, apologize and state you don't know politely.
				
				Provide an answer without the ANSWER: prefix.

				=========
				SOURCES:
				{text}
				=========
				QUESTION:
				${query}
				=========
				ANSWER:
				`,
			})
			.withNearText({ concepts: [query] })
			.withWhere({
				path: ["course_id"],
				operator: "Equal",
				valueNumber: _course,
			})
			.withFields(
				"text course_id section_id module_id content_id slice_index"
			)
			.withLimit(3)
			.withTenant(_handle)
			.do()

		return res
	} catch (error) {
		//No Vector in db
		if ((error as Error).message == "usage error (404): ") {
			console.log(`Usage Error: No vector in db ${_course}`)
			return _course
		}
		console.log(error)
		return null
	}
}

// export async function queryIndex(
// 	_handle: string,
// 	namespace: string = "content",
// 	_id: string
// ) {
// 	try {
// 		namespace = namespace.charAt(0).toUpperCase() + namespace.slice(1)
// 		const collection = await _checkCollection(namespace) //Check if collection exists

// 		if (!collection) return null

// 		const res = await client.data
// 			.deleter()
// 			.withClassName(namespace)
// 			.withId(_id)
// 			.withTenant(_handle)
// 			.do()

// 		return _id
// 	} catch (error) {
// 		//No Vector in db
// 		if ((error as Error).message == "usage error (404): ") {
// 			console.log(`Usage Error: No vector in db ${_id}`)
// 			return _id
// 		}
// 		console.log(error)
// 		return null
// 	}
// }

export async function getAllItems(
	_handle: string,
	namespace: string = "content"
) {
	try {
		namespace = namespace.charAt(0).toUpperCase() + namespace.slice(1)
		const collection = await _checkCollection(namespace) //Check if collection exists

		if (!collection) return null

		const res = await client.data
			.getter()
			.withClassName(namespace)
			.withTenant(_handle)
			.do()

		return res
	} catch (error) {
		console.log(error)
		return null
	}
}

export async function eraseCollection(namespace: string) {
	try {
		namespace = namespace.charAt(0).toUpperCase() + namespace.slice(1)
		const collection = await _checkCollection(namespace) //Check if collection exists
		if (!collection) return null

		await client.schema.classDeleter().withClassName(namespace).do()

		return { status: true }
	} catch (error) {
		console.log(error)
		return null
	}
}
async function _getMeta() {
	const res = await client.misc.metaGetter().do()
	return res
}
