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
		course: {
			id: [99999],
		},
	}
	const res = await fetch(
		`${base}/api/v1/course?` +
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
		course: {
			id: 99999,
			title: "Test Course",
			label: "test-course",
			summary: "This is a test course",
			visible: true,
			url: "https://www.orbite.xyz/test-course",
			namespace: "testing",
			category: "Testing",
			tags: "test,testing",
			version: Math.floor(Date.now() / 1000).toString(),
			meta: {
				fieldA: "valueA",
				fieldB: "valueB",
			},
		},
	}

	const res = await fetch(
		`${base}/api/v1/course?` +
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
		course: {
			id: 99999,
			title: "Test Course EDITED",
			label: "test-course-edited",
			summary: "This is a EDITED test course",
			visible: false,
			url: "https://www.orbite.xyz/test-course-edited",
			namespace: "testing",
			category: "Testing",
			tags: "test,testing",
			version: Math.floor(Date.now() / 1000).toString(),
			meta: {
				fieldA: "valueA EDITED",
				fieldB: "valueB EDITED",
			},
		},
	}

	const res = await fetch(
		`${base}/api/v1/course?` +
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
		course: {
			id: [99999],
		},
	}
	const res = await fetch(
		`${base}/api/v1/course?` +
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
