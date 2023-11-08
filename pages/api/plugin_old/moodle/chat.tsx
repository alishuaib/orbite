/**
 * Chat integration for Moodle. Uses Iframe to embed chatbot.
 *
 * TODO: Consider changing from POST to GET request since no body is required.
 * @api {post} /api/plugin/moodle/chat
 */
import { NextApiRequest, NextApiResponse } from "next/types"
import ReactDOMServer from "react-dom/server"
import withApiKeyVerification from "@/lib/middleware/apikey"
import { Auth } from "@/lib/@schemas"
import jwt from "jsonwebtoken"
import PluginBtn from "@/app/plugin/(comp)/btn"
export default withApiKeyVerification(
	async (req: NextApiRequest, res: NextApiResponse, auth: Auth) => {
		const { method, body, headers } = req
		console.info("api/plugin/moodle/chat", body, auth._handle)
		const proto =
			req.headers["x-forwarded-proto"] === "https" ? "https" : "http"
		const host = headers.host
		const baseUrl = `${proto}://${host}`
		switch (method) {
			case "POST":
				const token = jwt.sign(
					{
						// apikey: headers["x-orbite-api-key"],
						course_id: body.course_id,
						course_name: body.course_name,
						handle: auth._handle,
					},
					process.env.NEXTAUTH_SECRET as string,
					{ expiresIn: "15s" }
				)
				const iframe = ReactDOMServer.renderToString(
					<div
						style={{
							position: "absolute",
							right: "0",
							height: "100vh",
							width: "calc(430px + 3rem)",
							overflow: "hidden",
							pointerEvents: "none",
						}}
					>
						<div
							id="orbite-plugin"
							style={{
								pointerEvents: "all",
								position: "absolute",
								top: "0",
								height: "100vh",
								width: "430px",
								backgroundColor: "#27272a",
								display: "flex",
								flexDirection: "column",
								gap: "0.5rem",
								transition: "all 0.5s ease-in-out",
								zIndex: "9999",
								color: "#f4f4f5",
								borderColor: "#71717a",
								borderLeftWidth: "2px",
								right: "-430px",
								filter: "grayScale(0)",
							}}
						>
							<PluginBtn
								isActive
								setOpen={() => null}
							/>
							<iframe
								style={{
									width: "100%",
									height: "100%",
									border: "none",
								}}
								src={`${baseUrl}/plugin?course_id=${body.course_id}&session=${token}`}
							/>
						</div>
					</div>
				)

				res.status(200).json({ success: true, html: iframe })
				// res.setHeader("Content-Type", "text/html")
				// res.status(200).send(iframe)
				break
			default:
				res.setHeader("Allow", ["POST"])
				res.status(405).end(`Not Allowed ${method}`)
		}
	}
)
