import { time } from "console"
import { NextApiRequest, NextApiResponse } from "next/types"
import withApiKeyVerification from "@/lib/middleware/apikey"
import { Auth } from "@/lib/@schemas"

export default withApiKeyVerification(
	async (req: NextApiRequest, res: NextApiResponse, auth: Auth) => {
		const { headers, query, body } = req
		//Print request recieved time
		console.info(
			"api/plugin/moodle/status/api",
			new Date().toLocaleTimeString(),
			body ? JSON.stringify(body, null, 4) : ""
		)

		return res.status(200).json({
			success: true,
			message: "Orbite API is live",
			data: {
				server: "live", //live , maintenance, down
				api: "live", //live , maintenance, down
				plugin: 2023042405,
				urls: {
					admin: "",
					docs: "",
					new: "",
					help: "",
				},
				expire: auth.expire == "" ? null : auth.expire,
			},
		})
	}
)
