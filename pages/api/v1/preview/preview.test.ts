import { NextApiRequest, NextApiResponse } from "next/types"

export default async (request: NextApiRequest, response: NextApiResponse) => {
	const { method } = request

	switch (method) {
		case "GET":
			await GET(request, response)
			break
	}
}

async function GET(request: NextApiRequest, response: NextApiResponse) {
	const base = `${request.headers["x-forwarded-proto"] || "http"}://${
		request.headers["host"]
	}`

	let mockBody = {
		content: {
			id: 99999,
		},
	}
	const res = await fetch(
		`${base}/api/v1/preview?` +
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
