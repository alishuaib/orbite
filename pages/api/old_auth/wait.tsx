import { time } from "console"
import { NextApiRequest, NextApiResponse } from "next/types"

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const { headers, query, body } = req
	//Print request recieved time
	console.info(
		"api/delayed",
		new Date().toLocaleTimeString(),
		`Delaying response for ${body.wait} seconds (${
			body.wait * 1000
		}ms) for task ${body.task_id}`
	)

	await new Promise((resolve) => setTimeout(resolve, body.wait * 1000))

	return res.status(200).send("success")
}
