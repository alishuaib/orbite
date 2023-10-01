import { NextApiRequest, NextApiResponse } from "next/types"

export default async (request: NextApiRequest, response: NextApiResponse) => {
	const { method } = request

	switch (method) {
		case "GET":
			await GET(request, response)
			break
		case "POST":
			await POST(request, response)
			break
		case "PATCH":
			await PATCH(request, response)
			break
		case "DELETE":
			await DELETE(request, response)
			break
		default:
			await POST(request, response)
			await GET(request, response)
			await DELETE(request, response)
			break
	}
}

async function GET(request: NextApiRequest, response: NextApiResponse) {
	const base = `${request.headers["x-forwarded-proto"] || "http"}://${
		request.headers["host"]
	}`

	let mockBody = {
		module: {
			id: [99999],
		},
	}
	const res = await fetch(
		`${base}/api/v1/module?` +
			new URLSearchParams({
				method: "GET",
			}),
		{
			method: "POST",
			//@ts-ignore
			headers: {
				"x-orbite-api-key": process.env.TEST_API_KEY,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(mockBody),
		}
	)

	return response.status(res.status).json(await res.json())
}

async function POST(request: NextApiRequest, response: NextApiResponse) {
	const base = `${request.headers["x-forwarded-proto"] || "http"}://${
		request.headers["host"]
	}`
	//Create Mock Formdata
	let mockBody = {
		section: {
			id: 99999,
		},
		module: {
			id: 99999,
			title: "Test Module",
			summary: "This is a test module",
			order: "1",
			visible: true,
			url: "https://www.orbite.xyz/test-module",
			version: Math.floor(Date.now() / 1000).toString(),
			meta: {
				fieldA: "valueA",
				fieldB: "valueB",
			},
		},
	}

	const res = await fetch(
		`${base}/api/v1/module?` +
			new URLSearchParams({
				method: "POST",
			}),
		{
			method: "POST",
			//@ts-ignore
			headers: {
				"x-orbite-api-key": process.env.TEST_API_KEY,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(mockBody),
		}
	)

	return response.status(res.status).json(await res.json())
}

async function PATCH(request: NextApiRequest, response: NextApiResponse) {
	const base = `${request.headers["x-forwarded-proto"] || "http"}://${
		request.headers["host"]
	}`
	//Create Mock Formdata
	let mockBody = {
		module: {
			id: 99999,
			title: "Test Module EDITED",
			summary: "This is a test module EDITED",
			order: "1",
			visible: true,
			url: "https://www.orbite.xyz/test-module",
			version: Math.floor(Date.now() / 1000).toString(),
			meta: {
				fieldA: "valueA",
				fieldB: "valueB",
			},
		},
	}

	const res = await fetch(
		`${base}/api/v1/module?` +
			new URLSearchParams({
				method: "PATCH",
			}),
		{
			method: "POST",
			//@ts-ignore
			headers: {
				"x-orbite-api-key": process.env.TEST_API_KEY,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(mockBody),
		}
	)

	return response.status(res.status).json(await res.json())
}

async function DELETE(request: NextApiRequest, response: NextApiResponse) {
	const base = `${request.headers["x-forwarded-proto"] || "http"}://${
		request.headers["host"]
	}`

	let mockBody = {
		module: {
			id: [99999],
		},
	}
	const res = await fetch(
		`${base}/api/v1/module?` +
			new URLSearchParams({
				method: "DELETE",
			}),
		{
			method: "POST",
			//@ts-ignore
			headers: {
				"x-orbite-api-key": process.env.TEST_API_KEY,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(mockBody),
		}
	)

	return response.status(res.status).json(await res.json())
}
