import { NextApiRequest, NextApiResponse } from "next/types"
import prisma from "@/lib/prisma-client"
import {
	downloadForm,
	createContent,
	deleteContent,
} from "@/lib/contentManager"
//
//
// Get all courses for a given organization based on their assigned handle
//

export const config = {
	api: {
		bodyParser: false,
	},
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
	console.log(req.query)
	const form = await downloadForm(req)
	console.log(form.fields)
	res.status(200).json({
		status: 200,
		message: "success",
		data: form.fields,
	})
}
