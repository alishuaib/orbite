import { NextApiRequest, NextApiResponse } from "next/types"
import withApiKeyVerification, {
	Authorization,
} from "@/lib/middleware/checkAuth"
import * as weaviate from "@/lib/weaviate"
import { z } from "zod"

import Stripe from "stripe"

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
			case "POST":
				await POST(req, res, auth)
				break
		}
	}
)

async function POST(
	req: NextApiRequest,
	res: NextApiResponse,
	auth: Authorization
) {
	function validateGET(body: any) {
		let schema = z.object({
			user: z.object({
				id: z.string(),
			}),
			plan: z.object({
				id: z.string(),
			}),
			stripe: z.object({
				customer: z.object({
					name: z.string(),
					email: z.string().email(),
					address: z.object({
						line1: z.string(),
						line2: z.string().optional(),
						city: z.string(),
						state: z.string(),
						postal_code: z.string(),
						country: z.string(),
					}),
				}),
			}),
		})
		try {
			return schema.parse(body)
		} catch (error) {
			console.log(error)
			throw new Error(
				`Invalid stripe create subscription object for POST: ${error}`
			)
		}
	}
	try {
		const body = validateGET(req.body)
		// create a stripe customer
		const customer = await stripe.customers.create({
			name: body.stripe.customer.name,
			email: body.stripe.customer.email,
			address: body.stripe.customer.address,
			metadata: {
				userId: body.user.id,
			},
		})
		if (!customer) throw new Error("Customer creation failed")

		// create a stripe subscription
		const priceId = body.plan.id //Product ID
		const subscription = await stripe.subscriptions.create({
			customer: customer.id,
			items: [{ price: priceId }],

			payment_behavior: "default_incomplete",
			payment_settings: {
				save_default_payment_method: "on_subscription",
			},
			expand: ["latest_invoice.payment_intent"],
		})
		if (!subscription) throw new Error("Subscription creation failed")
		if (
			!subscription.latest_invoice ||
			typeof subscription.latest_invoice == "string"
		) {
			console.log(subscription.latest_invoice)
			throw new Error(
				"Subscription failed: unable to secure .latest_invoice"
			)
		}

		if (
			subscription.latest_invoice.payment_intent == null ||
			typeof subscription.latest_invoice.payment_intent == "string"
		) {
			console.log(subscription.latest_invoice.payment_intent)
			throw new Error(
				"Subscription failed: unable to secure .payment_intent"
			)
		}

		return res.status(200).json({
			route: req.url,
			isSuccess: true,
			message: "Subscription created successfully",
			data: {
				clientSecret:
					subscription.latest_invoice.payment_intent.client_secret,
				subscriptionId: subscription.id,
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
