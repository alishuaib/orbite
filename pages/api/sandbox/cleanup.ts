import { ERASE_ALL_CONTENT_DATA } from "@/utils/cleanup"
import { NextApiRequest, NextApiResponse } from "next/types"

export default async (request: NextApiRequest, response: NextApiResponse) => {
	const { method } = request

	switch (method) {
		case "DELETE":
			await ERASE_ALL_CONTENT_DATA()
			response
				.status(200)
				.json({ message: "All Content data has been erased" })
			break
		default:
			response.status(400).send("Only DELETE supported")
			break
	}
}
