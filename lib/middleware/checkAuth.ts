import { NextApiRequest, NextApiResponse } from "next"

import { Prisma, PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function verifyApiKeyPrisma(apiKey: string) {
	const auth = await prisma.auth.findUnique({
		include: {
			org: true,
		},
		where: {
			API_KEY: apiKey,
		},
	})

	return auth
}

const authTyping = Prisma.validator<Prisma.AuthDefaultArgs>()({
	include: { org: true },
})

type Authorization = Prisma.AuthGetPayload<typeof authTyping>
export type { Authorization }

export default function withApiKeyVerification(
	handler: (
		req: NextApiRequest,
		res: NextApiResponse,
		auth: Authorization
	) => Promise<void>
) {
	return async (req: NextApiRequest, res: NextApiResponse) => {
		const apiKey = req.headers["x-orbite-api-key"] as string
		if (!apiKey) {
			return res
				.status(401)
				.json({ success: false, message: "API_KEY is missing" })
		}
		const authorization = await verifyApiKeyPrisma(apiKey)

		if (!authorization) {
			return res
				.status(401)
				.json({ success: false, message: "Invalid API_KEY" })
		}

		if (authorization.key_expiry) {
			if (parseInt(authorization.key_expiry) < Date.now() / 1000) {
				const expireDate = new Date(
					parseInt(authorization.key_expiry) * 1000
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
