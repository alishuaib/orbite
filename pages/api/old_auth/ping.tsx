import { time } from "console"
import { NextApiRequest, NextApiResponse } from "next/types"

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const { headers, query, body } = req
	//Print request recieved time
	console.info(
		"api/ping",
		new Date().toLocaleTimeString(),
		JSON.stringify(body, null, 4)
	)

	return res.status(200).send("success")
}
