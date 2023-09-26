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
						name: "_course",
						description: "Metadata for course id",
						dataType: ["text"],
						moduleConfig: {
							"text2vec-openai": {
								skip: true,
							},
						},
					},
					{
						name: "_section",
						description: "Metadata for section id",
						dataType: ["text"],
						moduleConfig: {
							"text2vec-openai": {
								skip: true,
							},
						},
					},
					{
						name: "_activity",
						description: "Metadata for activity id",
						dataType: ["text"],
						moduleConfig: {
							"text2vec-openai": {
								skip: true,
							},
						},
					},
					{
						name: "_content",
						description: "Metadata for parent content id",
						dataType: ["text"],
						moduleConfig: {
							"text2vec-openai": {
								skip: true,
							},
						},
					},
					{
						name: "_sliceIdx",
						description: "Metadata for slice index",
						dataType: ["int"],
						moduleConfig: {
							"text2vec-openai": {
								skip: true,
							},
						},
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
			course_id: string
			section_id: string
			module_id: string
			content_id: string // Content this slice of text belongs to
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
	_id: string
) {
	try {
		namespace = namespace.charAt(0).toUpperCase() + namespace.slice(1)
		const collection = await _checkCollection(namespace) //Check if collection exists

		if (!collection) return null

		const res = await client.data
			.deleter()
			.withClassName(namespace)
			.withId(_id)
			.withTenant(_handle)
			.do()

		return _id
	} catch (error) {
		//No Vector in db
		if ((error as Error).message == "usage error (404): ") {
			console.log(`Usage Error: No vector in db ${_id}`)
			return _id
		}
		console.log(error)
		return null
	}
}

export async function generativeResponse(
	_handle: string,
	namespace: string = "content",
	_course: string,
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

				Don't try to make up an answer and use the text in the SOURCES only for the answer. If you don't know the answer, just say that you don't know politely.
				
				Provide an answer without the ANSWER: prefix.

				=========
				SOURCES:
				{text}
				=========
				QUESTION:
				${query}
				=========
				PRODUCT_NAME OR COURSE_NAME:
				${namespace}
				=========
				ANSWER:
				`,
			})
			.withNearText({ concepts: [query] })
			.withWhere({
				path: ["_course"],
				operator: "Equal",
				valueText: _course,
			})
			.withFields("text _course")
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

export async function queryIndex(
	_handle: string,
	namespace: string = "content",
	_id: string
) {
	try {
		namespace = namespace.charAt(0).toUpperCase() + namespace.slice(1)
		const collection = await _checkCollection(namespace) //Check if collection exists

		if (!collection) return null

		const res = await client.data
			.deleter()
			.withClassName(namespace)
			.withId(_id)
			.withTenant(_handle)
			.do()

		return _id
	} catch (error) {
		//No Vector in db
		if ((error as Error).message == "usage error (404): ") {
			console.log(`Usage Error: No vector in db ${_id}`)
			return _id
		}
		console.log(error)
		return null
	}
}

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
