import { NextApiRequest, NextApiResponse } from "next/types"
import withApiKeyVerification, {
	Authorization,
} from "@/lib/middleware/checkAuth"
import * as weaviate from "@/lib/weaviate"
import { z } from "zod"

import Stripe from "stripe"
import prisma from "@/lib/prisma-client"

const stripe = new Stripe(process.env.DEV_STRIPE_SECRET_KEY as string)

//
// Section API
//
export default withApiKeyVerification(
	async (req: NextApiRequest, res: NextApiResponse, auth: Authorization) => {
		const { query } = req
		if (query.method == undefined || req.method != "POST") {
			res.status(400).json({
				route: `${req.url}`,
				isSuccess: false,
				message: "No method provided in query",
				data: null,
			})
		}
		switch ((query.method as string).toUpperCase()) {
			case "GET":
				await GET(req, res, auth)
				break
			case "POST":
				await POST(req, res, auth)
				break
		}
	}
)

async function GET(
	req: NextApiRequest,
	res: NextApiResponse,
	auth: Authorization
) {
	function validateGET(body: any) {
		let schema = z.object({
			session_id: z.string(),
		})
		try {
			return schema.parse(body)
		} catch (error) {
			console.log(error)
			throw new Error(`Invalid stripe checkout object for GET: ${error}`)
		}
	}
	try {
		const body = validateGET(req.body)

		const session = await stripe.checkout.sessions.retrieve(body.session_id)
		if (!session.customer)
			throw new Error("No customer found :" + session.customer)
		const customer = await stripe.customers.retrieve(
			session.customer as string
		)

		return res.status(200).json({
			route: req.url,
			isSuccess: true,
			message: "Subscription created successfully",
			data: {
				status: session.status,
				payment_status: session.payment_status,
				customer: customer,
			},
		})
	} catch (error: any) {
		return res.status(400).json({
			route: `${req.query.method}::${req.url}`,
			isSuccess: false,
			message: error.message,
			data: null,
		})
	}
}

async function POST(
	req: NextApiRequest,
	res: NextApiResponse,
	auth: Authorization
) {
	function validatePOST(body: any) {
		let schema = z.object({
			plan: z.object({
				id: z.string(),
			}),
		})
		try {
			return schema.parse(body)
		} catch (error) {
			console.log(error)
			throw new Error(`Invalid stripe checkout object for POST: ${error}`)
		}
	}
	try {
		const body = validatePOST(req.body)

		//Create a stripe checkout
		const checkout = await stripe.checkout.sessions.create({
			mode: "subscription",
			line_items: [
				{
					price: body.plan.id,
					quantity: 1,
				},
			],
			ui_mode: "embedded",
			return_url:
				process.env.DOMAIN +
				"/dashboard?session_id={CHECKOUT_SESSION_ID}#/billing",
		})

		if (!checkout.client_secret)
			throw new Error("No client secret returned from stripe")

		return res.status(200).json({
			route: req.url,
			isSuccess: true,
			message: "Subscription created successfully",
			data: checkout.client_secret,
		})
	} catch (error: any) {
		return res.status(400).json({
			route: `${req.query.method}::${req.url}`,
			isSuccess: false,
			message: error.message,
			data: null,
		})
	}
}
