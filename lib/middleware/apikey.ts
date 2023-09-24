import clientPromise from "@/lib/mongodb"
import { Auth } from "@/lib/@schemas"
import { Collection } from "mongodb"
import { NextApiRequest, NextApiResponse } from "next"

import { Prisma, PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function verifyApiKey(apiKey: string): Promise<Auth | null> {
	const client = await clientPromise
	const auth: Collection<Auth> = client.db("_auth").collection("handles")
	const result = await auth.findOne(
		{ api_key: apiKey },
		{ projection: { api_key: 0 } }
	)
	return result
}

export default function withApiKeyVerification(
	handler: (
		req: NextApiRequest,
		res: NextApiResponse,
		auth: Auth
	) => Promise<void>
) {
	return async (req: NextApiRequest, res: NextApiResponse) => {
		const apiKey = req.headers["x-orbite-api-key"] as string
		if (!apiKey) {
			return res
				.status(401)
				.json({ success: false, message: "API_KEY is missing" })
		}
		const authorization = await verifyApiKey(apiKey)
		if (!authorization) {
			return res
				.status(401)
				.json({ success: false, message: "Invalid API_KEY" })
		}

		if (authorization.expire != "") {
			if (parseInt(authorization.expire) < Date.now() / 1000) {
				const expireDate = new Date(
					parseInt(authorization.expire) * 1000
				)
				const formattedExpireDate = expireDate.toLocaleString("en-US", {
					month: "long",
					day: "numeric",
					year: "numeric",
					hour: "numeric",
					minute: "numeric",
					second: "numeric",
					hour12: true,
					timeZoneName: "short",
				})
				return res.status(401).json({
					success: false,
					message: "API_KEY has expired on " + formattedExpireDate,
				})
			}
		}
		return handler(req, res, authorization)
	}
}
