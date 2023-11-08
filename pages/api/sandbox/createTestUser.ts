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
	const data = {
		birthday: "",
		created_at: 1654012591514,
		email_addresses: [
			{
				email_address: "example@example.org",
				id: "idn_29w83yL7CwVlJXylYLxcslromF1",
				linked_to: [],
				object: "email_address",
				verification: {
					status: "verified",
					strategy: "ticket",
				},
			},
		],
		external_accounts: [],
		external_id: "567772",
		first_name: "Example",
		gender: "",
		id: "user_29w83sxmDNGwOuEthce5gg56FcC",
		image_url: "https://img.clerk.com/xxxxxx",
		last_name: "Example",
		last_sign_in_at: 1654012591514,
		object: "user",
		password_enabled: true,
		phone_numbers: [],
		primary_email_address_id: "idn_29w83yL7CwVlJXylYLxcslromF1",
		primary_phone_number_id: null,
		primary_web3_wallet_id: null,
		private_metadata: {},
		profile_image_url: "https://www.gravatar.com/avatar?d=mp",
		public_metadata: {},
		two_factor_enabled: false,
		unsafe_metadata: {},
		updated_at: 1654012591835,
		username: "testuser",
		web3_wallets: [],
	}
	let create = await prisma.user.create({
		data: {
			id: data.id,
			first_name: data.first_name,
			last_name: data.last_name,
			created_at: data.created_at.toString(),
			image_url: data.image_url,
			isPassword: data.password_enabled,
			is2FA: data.two_factor_enabled,
			username: data.username,
			birthday: data.birthday,
			gender: data.gender,
			emails: data.email_addresses as [],
			primary_email_id: data.primary_email_address_id,
			phone_numbers: data.phone_numbers as [],
			primary_phone_number_id: data.primary_phone_number_id,
			web3_wallets: data.web3_wallets as [],
			primary_web3_wallet_id: data.primary_web3_wallet_id,
			is_onboarded: false,
			config: {
				create: {},
			},
			auth: {
				create: {
					API_KEY: process.env.TEST_API_KEY as string,
				},
			},
		},
		include: {
			config: true,
			auth: true,
		},
	})
	res.status(200).json({
		status: 200,
		message:
			"test user created successfull (ONLY FOR API AUTH NOT LOGGING IN)",
		data: create,
	})
}
