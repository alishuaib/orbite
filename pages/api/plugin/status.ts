/**
 * Get plugin status, validate key and check for updates (based on version)
 *
 * @api {post} /api/plugin/status
 */
import { NextApiRequest, NextApiResponse } from "next/types"

import clientPromise from "@/lib/mongodb"
import { Auth } from "@/lib/@schemas"
import { Collection } from "mongodb"

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const { headers, query } = req

	console.info("api/status", headers["x-orbite-api-key"])

	const key = headers["x-orbite-api-key"]
	if (!key)
		return res
			.status(401)
			.json({ success: false, message: "UNAUTHORIZED NO KEY" })

	const client = await clientPromise
	const auth: Collection<Auth> = client.db("_auth").collection("handles")

	const result = await auth.findOne(
		{ api_key: key },
		{ projection: { api_key: 0 } }
	)
	if (!result)
		return res
			.status(401)
			.json({ success: false, message: "UNAUTHORIZED KEY" })

	return res.status(200).json({ success: true, message: "Valid Key" })
}
