import { NextApiRequest, NextApiResponse } from "next"

import { Prisma, PrismaClient } from "@prisma/client"
import chalk from "chalk"
const prisma = new PrismaClient()

async function verifyApiKeyPrisma(apiKey: string) {
	const auth = await prisma.auth.findUnique({
		include: {
			user: true,
		},
		where: {
			API_KEY: apiKey,
		},
	})

	return auth
}

const authTyping = Prisma.validator<Prisma.AuthDefaultArgs>()({
	include: { user: true },
})

type Authorization = Prisma.AuthGetPayload<typeof authTyping>
export type { Authorization }

export function logApiRequest(req: NextApiRequest) {
	const protocol = req.headers["x-forwarded-proto"] || "http"
	const origin = `${protocol}://${req.headers.host}`

	const apiKey = req.headers["x-orbite-api-key"] as string | undefined
	console.info(
		chalk.bgCyan.black(
			req.url,
			req.method,
			new Date().toLocaleTimeString()
		),
		"\n\t",
		chalk.green("origin"),
		origin,
		"\n\t",
		chalk.yellow("auth"),
		process.env.NODE_ENV == "development"
			? apiKey
			: `${apiKey?.split("-")[0]}-****-****-****-************`
	)
}

export default function withApiKeyVerification(
	handler: (
		req: NextApiRequest,
		res: NextApiResponse,
		auth: Authorization
	) => Promise<void>
) {
	return async (req: NextApiRequest, res: NextApiResponse) => {
		logApiRequest(req)

		const apiKey = req.headers["x-orbite-api-key"] as string
		if (!apiKey) {
			return res.status(401).json({
				route: `${req.url}`,
				isSuccess: false,
				message: "API_KEY is missing",
				data: null,
			})
		}
		const authorization = await verifyApiKeyPrisma(apiKey)

		if (!authorization) {
			return res.status(401).json({
				route: `${req.url}`,
				isSuccess: false,
				message: "Invalid API_KEY",
				data: null,
			})
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
					route: `${req.url}`,
					isSuccess: false,
					message: "API_KEY has expired on " + formattedExpireDate,
					data: null,
				})
			}
		}
		return handler(req, res, authorization)
	}
}
