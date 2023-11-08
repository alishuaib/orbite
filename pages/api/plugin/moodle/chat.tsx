/**
 * Chat integration for Moodle. Uses Iframe to embed chatbot.
 *
 * @api {post} /api/plugin/moodle/chat
 */
import { NextApiRequest, NextApiResponse } from "next/types"
import ReactDOMServer from "react-dom/server"
import withApiKeyVerification, {
	Authorization,
	logApiRequest,
} from "@/lib/middleware/checkAuth"
import { createCipheriv, randomBytes, createDecipheriv } from "crypto"
import jwt from "jsonwebtoken"
import { z } from "zod"
// import PluginBtn from "@/app/plugin/(comp)/btn"
export default async (
	req: NextApiRequest,
	res: NextApiResponse,
	auth: Authorization
) => {
	logApiRequest(req)
	if (!req.headers["x-orbite-api-key"])
		return res.status(403).send("Unauthorized")

	const { method } = req

	switch (method) {
		case "POST":
			await POST(req, res, auth)
			break
		default:
			res.setHeader("Allow", ["POST"])
			res.status(405).end(`Not Allowed ${method}`)
	}
}

async function POST(
	req: NextApiRequest,
	res: NextApiResponse,
	auth: Authorization
) {
	function validatePOST(body: any) {
		let schema = z.object({
			course: z.object({
				id: z.number(),
				title: z.string(),
			}),
		})
		try {
			return schema.parse(body)
		} catch (error) {
			console.log(error)
			throw new Error(`Invalid course object for POST: ${error}`)
		}
	}
	try {
		const body = validatePOST(req.body)

		//Encrypt a session to be validated on later date (async)
		const key = Buffer.from(process.env.AES_KEY as string, "hex")
		const iv = randomBytes(16)
		const cipher = createCipheriv("aes-256-cbc", key, iv)
		let encrypt = cipher.update(
			JSON.stringify({
				course_id: body.course.id,
				course_title: body.course.title,
				API_KEY: req.headers["x-orbite-api-key"],
				//Set expiry for 30 seconds
				expiry: (Math.floor(Date.now() / 1000) + 30) * 1000,
			}),
			"utf8",
			"hex"
		)
		encrypt += cipher.final("hex")
		const session = iv.toString("hex") + ":" + encrypt

		const proto =
			req.headers["x-forwarded-proto"] === "https" ? "https" : "http"
		const host = req.headers.host
		const baseUrl = `${proto}://${host}`

		//Build IFrame Embed
		const iframe = ReactDOMServer.renderToString(
			<iframe
				style={{
					zIndex: "9999",
					position: "absolute",
					right: "0",
					bottom: "0",
					width: "520px",
					height: "100vh",
					border: "none",
					// pointerEvents: "none",
				}}
				// src={`${baseUrl}/plugin/embed?session=${session}`}
				src={`http://localhost:3000/plugin/embed?session=${session}`}
			/>
		)

		//Send HTML response
		return res.status(200).json({
			route: `${req.url}`,
			isSuccess: true,
			message: "",
			data: iframe,
		})
	} catch (error: any) {
		console.log(error)
		return res.status(401).json({
			route: `${req.url}`,
			isSuccess: false,
			message: error.message,
			data: null,
		})
	}
}
