import { NextApiRequest, NextApiResponse } from "next/types"
import { readFileSync } from "fs"

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
		content: {
			id: [99999],
		},
	}
	const res = await fetch(
		`${base}/api/v1/content?` +
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
	let mockForm = new FormData()
	mockForm.append(
		"body",
		JSON.stringify({
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
			section: {
				id: 99999,
				title: "Test Section",
				summary: "This is a test section",
				order: "1",
				visible: true,
				url: "https://www.orbite.xyz/test-section",
				version: Math.floor(Date.now() / 1000).toString(),
				meta: {
					fieldA: "valueA",
					fieldB: "valueB",
				},
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
			content: [
				{
					id: 99999,
					name: "Test Content",
					ext: "docx",
					visible: true,

					size: 1000,
					mimetype:
						"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
					modified_at: new Date().toUTCString(),
					url: "https://www.orbite.xyz/test-content",
					version: Math.floor(Date.now() / 1000).toString(),
					meta: {
						fieldA: "valueA",
						fieldB: "valueB",
					},
				},
			],
		})
	)

	const filePath =
		"/home/ubuntu/orbite/public/Sample Data/sample-old/Database Management Report.docx"
	const fileContent = readFileSync(filePath)
	const fileBlob = new Blob([fileContent], {
		type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	})
	mockForm.append("file", fileBlob, "Database Management Report.docx")

	const res = await fetch(
		`${base}/api/v1/content?` +
			new URLSearchParams({
				method: "POST",
			}),
		{
			method: "POST",
			//@ts-ignore
			headers: {
				"x-orbite-api-key": process.env.TEST_API_KEY,
			},
			body: mockForm,
		}
	)

	return response.status(res.status).json(await res.json())
}

async function PATCH(request: NextApiRequest, response: NextApiResponse) {
	const base = `${request.headers["x-forwarded-proto"] || "http"}://${
		request.headers["host"]
	}`
	//Create Mock Formdata
	let mockForm = new FormData()
	mockForm.append(
		"body",
		JSON.stringify({
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
			section: {
				id: 99999,
				title: "Test Section EDITED",
				summary: "This is a test section EDITED",
				order: "1",
				visible: true,
				url: "https://www.orbite.xyz/test-section",
				version: Math.floor(Date.now() / 1000).toString(),
				meta: {
					fieldA: "valueA EDITED",
					fieldB: "valueB EDITED",
				},
			},
			module: {
				id: 99999,
				title: "Test Module EDITED",
				summary: "This is a test module EDITED",
				order: "1",
				visible: true,
				url: "https://www.orbite.xyz/test-module",
				version: Math.floor(Date.now() / 1000).toString(),
				meta: {
					fieldA: "valueA EDITED",
					fieldB: "valueB EDITED",
				},
			},
			content: [
				{
					id: 99999,
					name: "Test Content EDITED",
					ext: "docx",
					visible: true,

					size: 1000,
					mimetype:
						"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
					modified_at: new Date().toUTCString(),
					url: "https://www.orbite.xyz/test-content",
					version: Math.floor(Date.now() / 1000).toString(),
					meta: {
						fieldA: "valueA EDITED",
						fieldB: "valueB EDITED",
					},
				},
			],
		})
	)

	const filePath =
		"/home/ubuntu/orbite/public/Sample Data/sample-old/Database Management Report.docx"
	const fileContent = readFileSync(filePath)
	const fileBlob = new Blob([fileContent], {
		type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	})
	mockForm.append("file", fileBlob, "Database Management Report.docx")

	const res = await fetch(
		`${base}/api/v1/content?` +
			new URLSearchParams({
				method: "PATCH",
			}),
		{
			method: "POST",
			//@ts-ignore
			headers: {
				"x-orbite-api-key": process.env.TEST_API_KEY,
			},
			body: mockForm,
		}
	)

	return response.status(res.status).json(await res.json())
}

async function DELETE(request: NextApiRequest, response: NextApiResponse) {
	const base = `${request.headers["x-forwarded-proto"] || "http"}://${
		request.headers["host"]
	}`

	let mockBody = {
		content: {
			id: [99999],
		},
	}
	const res = await fetch(
		`${base}/api/v1/content?` +
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
