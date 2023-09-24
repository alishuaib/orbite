import { OpenAIApi, Configuration } from "openai"
// @ts-ignore
import similarity from "compute-cosine-similarity"

if (!process.env.OPENAI_API_KEY) {
	throw new Error('Invalid/Missing environment variable: "OPENAI_API_KEY"')
}

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

export async function embedder(documents: string[]) {
	try {
		const request = await openai.createEmbedding({
			input: documents,
			model: "text-embedding-ada-002",
		})
		let response = request.data.data.map((embed, i) => ({
			input: documents[i],
			...embed,
		}))
		return response.map((i) => i.embedding)
	} catch (error: any) {
		console.log(documents)
		if (error?.response) {
			console.log(error.response.status)
			console.log(error.response.data)
		} else {
			console.log(error.message)
		}
		return null
	}
}

export async function generateResponse(
	question: string,
	content: string[],
	course_name: string
) {
	try {
		const request = await openai.createChatCompletion({
			model: "gpt-3.5-turbo",
			messages: [
				{
					role: "system",
					content: `
					Given the following extracted parts of a long document ("SOURCES") about the product ("PRODUCT_NAME") and a question ("QUESTION"), you must create a brief final answer.

					Don't try to make up an answer and use the text in the SOURCES only for the answer. If you don't know the answer, just say that you don't know politely.
					
					Provide an answer without the ANSWER: prefix.

					=========
					SOURCES:
					${content}
					=========
					PRODUCT_NAME:
					${course_name}
					=========
					ANSWER:
					`,
				},
				{
					role: "user",
					content: `QUESTION: ${question}`,
				},
			],
		})
		let response = request.data
		return response
	} catch (error: any) {
		console.log(question, content)
		if (error?.response) {
			console.log(error.response.status)
			console.log(error.response.data)
		} else {
			console.log(error.message)
		}
		return null
	}
}

export async function crossCompare(response: string, vectors: number[][]) {
	let res_vector = await embedder([response])
	if (res_vector && res_vector[0]) {
		let res = res_vector[0]
		return vectors.map((vector) => similarity(res, vector))
	}
}
