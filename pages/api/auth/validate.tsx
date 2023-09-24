import { NextApiRequest, NextApiResponse } from "next/types"
import jwt from "jsonwebtoken"

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const { headers, body } = req
	console.info("auth/validate")
	if (!headers["authorization"]) return res.status(403)
	const token = headers["authorization"]
	console.log(token)
	try {
		const session = jwt.verify(token, process.env.NEXTAUTH_SECRET as string)
		res.status(200).json(session)
	} catch (err) {
		console.log("TokenExpired")
		res.status(403).json(null)
	}
}
