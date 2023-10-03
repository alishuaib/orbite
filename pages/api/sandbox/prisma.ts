import { NextApiRequest, NextApiResponse } from "next/types"
import prisma from "@/lib/prisma-client"

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const data = prisma.user.findMany({})
	res.status(200).json({
		status: 200,
		message: "success",
		data: data,
	})
}
