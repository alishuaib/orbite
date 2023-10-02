import { NextApiRequest, NextApiResponse } from "next/types"
import prisma from "@/lib/prisma-client"
//
// Get all courses for a given organization based on their assigned handle
//
export default async (req: NextApiRequest, res: NextApiResponse) => {
	const createNewOrg = await prisma.organization.create({
		data: {
			name: "Moonlite Digital",

			auth: {
				create: {
					handle: "moonlite",
					platform: "moodle",
					API_KEY: "d5f4903f-c810-441b-8716-78dad3bd55e4",
					key_expiry: null,
				},
			},

			config: {
				create: {},
			},
		},
	})

	res.status(200).json({
		status: 200,
		message: "success",
		data: createNewOrg,
	})
}
