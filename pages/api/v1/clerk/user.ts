import type { IncomingHttpHeaders } from "http"
import type { NextApiRequest, NextApiResponse } from "next"
import type { WebhookRequiredHeaders } from "svix"
import type {
	DeletedObjectJSON,
	UserJSON,
	WebhookEvent,
} from "@clerk/nextjs/server"
import { Webhook } from "svix"
import prisma from "@/lib/prisma-client"
import { Prisma } from "@prisma/client"
import { randomInt } from "crypto"

const webhookSecret: string = process.env.CLERK_WEBHOOK_SECRET as string

type NextApiRequestWithSvixRequiredHeaders = NextApiRequest & {
	headers: IncomingHttpHeaders & WebhookRequiredHeaders
}

async function validateWebhook(
	req: NextApiRequestWithSvixRequiredHeaders,
	res: NextApiResponse
) {
	const { body, headers } = req
	// Create a new Webhook instance with your webhook secret
	const wh = new Webhook(webhookSecret)
	let evt: WebhookEvent
	try {
		// Verify the webhook payload and headers
		evt = wh.verify(JSON.stringify(body), headers) as WebhookEvent
		return evt
	} catch (_) {
		return null
	}
}

export default async function handler(
	req: NextApiRequestWithSvixRequiredHeaders,
	res: NextApiResponse
) {
	const body = await validateWebhook(req, res)
	if (!body) {
		console.log("Invalid webhook (Validation failed)")
		return res.status(400).json({})
	}

	const { data, type } = body
	console.log("/api/v1/clerk/user", type)
	switch (type) {
		case "user.created":
			await userCreated(req, res, data)
			break
		case "user.updated":
			await userUpdated(req, res, data)
			break
		case "user.deleted":
			await userDeleted(req, res, data)
			break
		default:
			break
	}
}

async function userCreated(
	req: NextApiRequest,
	res: NextApiResponse,
	data: UserJSON
) {
	try {
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
					create: {
						chat_config: {
							create: {},
						},
					},
				},
				auth: {
					create: {},
				},
			},
			include: {
				config: true,
				auth: true,
			},
		})
		console.log(`User ${data.id} created successfully`)
		res.status(201).json({})
	} catch (error: any) {
		console.log(error.message)
		return res.status(400).json({})
	}
}

async function userUpdated(
	req: NextApiRequest,
	res: NextApiResponse,
	data: UserJSON
) {
	try {
		let update = await prisma.user.update({
			where: {
				id: data.id,
			},
			data: {
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
				auth: {
					create: {
						handle:
							(data.username
								? data.username.toLowerCase()
								: data.first_name.toLowerCase()) +
							randomInt(1000, 9999).toString(),
					},
				},
			},
			include: {
				auth: true,
			},
		})
		console.log(`User ${data.id} updated successfully`)
		res.status(201).json({})
	} catch (error: any) {
		console.log(error.message)
		return res.status(400).json({})
	}
}

async function userDeleted(
	req: NextApiRequest,
	res: NextApiResponse,
	data: DeletedObjectJSON
) {
	try {
		console.log(data.id)
		let del = await prisma.user.delete({
			where: {
				id: data.id,
			},
			include: {
				config: true,
			},
		})
		console.log(`User ${data.id} deleted successfully`)
		res.status(201).json({})
	} catch (error: any) {
		if (error.code == "P2025") {
			console.log(`User ${data.id} does not exist (No Record)`)
			return res.status(201).json({})
		}
		console.log(error.message, error.code)
		return res.status(400).json({})
	}
}
