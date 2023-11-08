import { NextApiRequest, NextApiResponse } from "next/types"
import { Authorization, logApiRequest } from "@/lib/middleware/checkAuth"
import { createDecipheriv } from "crypto"
import { Session } from "@/lib/@schemas"
import prisma from "@/lib/prisma-client"

export default async (
	req: NextApiRequest,
	res: NextApiResponse,
	auth: Authorization
) => {
	logApiRequest(req)
	const { method } = req

	switch (method) {
		case "POST":
			await POST(req, res)
			break
		default:
			res.setHeader("Allow", ["POST"])
			res.status(405).end(`Not Allowed ${method}`)
	}
}

async function POST(req: NextApiRequest, res: NextApiResponse) {
	try {
		if (!req.headers["authorization"])
			return res.status(403).json({
				route: `${req.url}`,
				isSuccess: false,
				message: "Unauthorized",
				data: null,
			})
		// Decryption
		const key = Buffer.from(process.env.AES_KEY as string, "hex")
		const [iv, encryptedMessage] = req.headers["authorization"].split(":")

		const decipher = createDecipheriv(
			"aes-256-cbc",
			key,
			Buffer.from(iv, "hex")
		)

		let decrypted = decipher.update(encryptedMessage, "hex", "utf8")
		decrypted += decipher.final("utf8")

		//Validate expiry
		const { API_KEY, ...session } = JSON.parse(decrypted) as Session & {
			API_KEY: string
		}

		if (session.expiry < Date.now()) {
			throw new Error("Session Expired")
		}
		//Log time remaining on session
		console.log(
			`Session expires in ${Math.floor(
				(session.expiry - Date.now()) / 1000
			)} seconds`,
			session.expiry,
			Date.now()
		)

		//Authorize Session
		try {
			//Validate API_KEY
			const auth = await prisma.auth.findUnique({
				include: {
					user: true,
				},
				where: {
					API_KEY: API_KEY,
				},
			})
			if (!auth) {
				throw new Error("Invalid API_KEY")
			}
			//Find Use
			let find = await prisma.user.findFirst({
				where: {
					id: auth.user?.id,
				},
				include: {
					config: {
						include: {
							chat_config: true,
						},
					},
					auth: true,
				},
			})
			if (!find) {
				throw new Error(`No user found with id: ${auth.user?.id}`)
			}
			return res.status(200).json({
				route: `${req.url}`,
				isSuccess: true,
				message: "Session Authorized successfully",
				data: { ...find, ...{ session: session } },
			})
		} catch (error) {
			console.log(error)
			return res.status(401).json({
				route: `${req.url}`,
				isSuccess: false,
				message: "Invalid API_KEY",
				data: null,
			})
		}
	} catch (error: any) {
		console.log(error)
		return res.status(403).json({
			route: `${req.url}`,
			isSuccess: false,
			message: error.message,
			data: null,
		})
	}
}
