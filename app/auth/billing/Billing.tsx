"use client"
import React, {
	MouseEventHandler,
	ReactElement,
	cloneElement,
	useEffect,
	useState,
} from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { readApi, writeApi } from "@/app/_context/api"
import * as Icon from "@phosphor-icons/react"
import {
	PaymentElement,
	useStripe,
	useElements,
	AddressElement,
	EmbeddedCheckoutProvider,
	EmbeddedCheckout,
} from "@stripe/react-stripe-js"
import { StripeAddressElementChangeEvent, loadStripe } from "@stripe/stripe-js"
import type Stripe from "stripe"
import { toast } from "sonner"
type Plan = {
	id: string
	name: string
	description: string
	price: number
	onClick: () => void
}

type StripeIntent = {
	clientSecret: Stripe.PaymentIntent["client_secret"]
	subscriptionId: Stripe.Subscription["id"]
}
export default function BillingPage() {
	const params = useSearchParams()!
	//Ex: /dashboard?session_id=1#/billing
	const session_id = params.get("session_id")
	const [page, setPage] = useState(0)
	const [selectedPlan, setSelected] = useState<number | null>(0)
	const [intent, setIntent] = useState<StripeIntent | null>(null)
	const plans: Plan[] = [
		{
			id: "price_1OAU6fDOczCSUWjpXxseNdmi",
			name: "Free Tier",
			description: "Limited functionality to test out Orbite",
			price: 0,
			onClick: () => handleClick(0),
		},
		{
			id: "price_1OA92PDOczCSUWjpQphqKHcr",
			name: "Enterprise",
			description: "Full functionality of Orbite",
			price: 250,
			onClick: () => handleClick(1),
		},
	]

	function handleClick(index: number) {
		if (page == 1) {
			setSelected(null)
			setPage(0)
			return
		}
		setSelected(index)
		setPage(1)
	}
	useEffect(() => {
		if (session_id) setPage(4)
	}, [session_id])
	return (
		<div className="flex flex-col gap-8">
			<div className="flex flex-col gap-2">
				<h1 className="text-3xl font-bold">Plan & Billing</h1>
				<p className="text-gray-500">
					Manage Payment plan and Billing details
				</p>
			</div>
			<section className="flex-1 h-full">
				{page == 0 && <ListPlans plans={plans} />}
				{page == 1 && selectedPlan != null && (
					<SeeDetails
						plan={plans[selectedPlan]}
						setPage={setPage}
					/>
				)}
				{page == 2 && selectedPlan != null && (
					<CustomerInfo
						plan={plans[selectedPlan]}
						setPage={setPage}
						setIntent={setIntent}
					/>
				)}
				{page == 3 && selectedPlan != null && intent != null && (
					<PaymentPage
						plan={plans[selectedPlan]}
						setPage={setPage}
						intent={intent}
						setIntent={setIntent}
					/>
				)}
				{page == 4 && session_id != null && (
					<SuccessPage
						sessionID={session_id}
						setPage={setPage}
					/>
				)}
			</section>
		</div>
	)
}

function ListPlans({ plans }: { plans: Plan[] }) {
	return (
		<div className="flex gap-4">
			{plans.map((p) => (
				<div
					className="flex flex-col border-2 border-gray-300 w-56 h-56 p-5 rounded-xl hover:scale-105 transition-all cursor-pointer"
					onClick={p.onClick}
				>
					<div className="flex-1">
						<div className="flex flex-col">
							<h2 className="text-xl font-bold">{p.name}</h2>
							<p className="text-gray-500">{p.description}</p>
						</div>
					</div>
					<div className="flex justify-between items-end">
						<div className="flex-1 flex justify-end">
							<Icon.ArrowRight className="h-10 w-10" />
						</div>
					</div>
				</div>
			))}
		</div>
	)
}

function SeeDetails({
	plan,
	setPage,
}: {
	plan: Plan
	setPage: React.Dispatch<React.SetStateAction<number>>
}) {
	return (
		<div className="flex flex-col gap-8 h-full">
			<div className="flex items-center">
				<div className="flex flex-1 flex-col gap-2">
					<h1 className="text-2xl font-bold">{plan.name}</h1>
					<p className="text-gray-500">{plan.description}</p>
				</div>
				<div className="flex px-5 justify-end gap-2">
					<div
						className={`transition-all p-3 px-4 pt-2 w-36 flex items-center justify-center rounded  text-white hover:-translate-y-1.5 hover:cursor-pointer bg-violet-600`}
						onClick={() => setPage(2)}
					>
						Change Plan
					</div>
				</div>
			</div>
			<div className="flex flex-col">
				This is alot of information about the plan and its limitations
			</div>
			<div className="flex  px-5 justify-end gap-2">
				<div
					className={`transition-all p-3 px-4 pt-2 w-36 flex text-gray-500  border-gray-500 items-center justify-center rounded border-2  hover:-translate-y-1.5 hover:cursor-pointer`}
					onClick={() => plan.onClick()}
				>
					Back
				</div>
			</div>
		</div>
	)
}

function CustomerInfo({
	plan,
	setPage,
	setIntent,
}: {
	plan: Plan
	setPage: React.Dispatch<React.SetStateAction<number>>
	setIntent: React.Dispatch<React.SetStateAction<StripeIntent | null>>
}) {
	const { user } = readApi()!
	const { stripeCheckout } = writeApi()!
	const [address, setAddress] = useState<
		StripeAddressElementChangeEvent["value"] | null
	>({})
	const handleInfo:
		| ((event: StripeAddressElementChangeEvent) => any)
		| undefined = (event) => {
		if (event.complete) {
			// Extract potentially complete address
			console.log(event.value)
			setAddress({ ...event.value })
		} else {
			setAddress(null)
		}
	}
	const [isSubmit, setSubmit] = useState(false)
	async function handleSubmit() {
		const email = (user?.emails as any[]).find(
			(e) => e.id == user?.primary_email_id
		)
		// if (!user || !email || !address || isSubmit) return
		setSubmit(true)
		console.log(plan.id)
		const response = await stripeCheckout(plan.id)
		if (response) {
			setIntent(response as StripeIntent)
			setPage(3)
		} else {
			toast.error("Something went wrong")
		}
		setSubmit(false)
	}
	return (
		<div className="flex flex-col gap-8 h-full">
			<div className="flex items-center gap-4">
				<div className="flex flex-1 flex-col gap-2">
					<h1 className="text-2xl font-bold">Billing Information</h1>
				</div>
			</div>
			<div
				id="address-element"
				className={isSubmit ? "pointer-events-none brightness-90" : ""}
			>
				{/* <AddressElement
					onChange={handleInfo}
					options={{ mode: "shipping" }}
				/> */}
			</div>
			<div className="flex justify-between gap-2">
				<div
					className={`transition-all flex items-center justify-center hover:border-gray-500  hover:cursor-pointer text-gray-500  border-gray-300 text-xl border-2 px-4 gap-1 rounded-full py-1 w-28`}
					onClick={() => {
						setSubmit(false)
						setPage(0)
					}}
				>
					<Icon.ArrowLeft className="h-6 w-6" /> Back
				</div>
				<div
					className={`transition-all flex items-center justify-center hover:border-violet-900  hover:cursor-pointer  text-white text-xl border-2 px-4 gap-1 rounded-full py-1 w-28  ${
						!address
							? "pointer-events-none bg-gray-500"
							: "bg-violet-600"
					}`}
					onClick={() => handleSubmit()}
				>
					{!isSubmit ? (
						<>
							Next <Icon.ArrowRight className="h-6 w-6" />
						</>
					) : (
						<Icon.CircleNotch
							className="animate-spin"
							width={24}
							height={24}
						/>
					)}
				</div>
			</div>
		</div>
	)
}

const stripePromise = loadStripe(
	process.env.NEXT_PUBLIC_DEV_STRIPE_PUBLISHABLE_KEY as string
)

function PaymentPage({
	plan,
	setPage,
	intent,
	setIntent,
}: {
	plan: Plan
	setPage: React.Dispatch<React.SetStateAction<number>>
	intent: StripeIntent
	setIntent: React.Dispatch<React.SetStateAction<StripeIntent | null>>
}) {
	console.log(intent)
	const [isSubmit, setSubmit] = useState(false)
	async function handleSubmit() {
		setSubmit(true)

		setSubmit(false)
	}
	return (
		<div className="flex flex-col gap-8 h-full">
			<div className="flex items-center gap-4">
				<div className="flex flex-1 flex-col gap-2">
					<h1 className="text-2xl font-bold">Payment Details</h1>
				</div>
			</div>
			<div>
				<EmbeddedCheckoutProvider
					stripe={stripePromise}
					options={{
						clientSecret: intent,
					}}
				>
					<EmbeddedCheckout />
				</EmbeddedCheckoutProvider>
			</div>
		</div>
	)
}

function SuccessPage({
	sessionID,
	setPage,
}: {
	sessionID: string
	setPage: React.Dispatch<React.SetStateAction<number>>
}) {
	const { isReady } = readApi()!
	const { stripeCheckoutSession } = writeApi()!
	const router = useRouter()
	const [status, setStatus] = useState<object | null>(null)
	const [isLoading, setLoading] = useState(true)
	useEffect(() => {
		if (!isReady) return
		stripeCheckoutSession(sessionID).then((data) => {
			if (data) setStatus({ ...data })
			setLoading(false)
		})
	}, [sessionID, isReady])
	return (
		<div className="flex flex-col gap-8 h-full">
			<div className="flex items-center gap-4">
				<div className="flex flex-1 flex-col gap-2">
					<h1 className="text-2xl font-bold">Thank You</h1>
				</div>
			</div>
			<div className="flex flex-col items-center justify-center">
				{isLoading && (
					<Icon.CircleNotch
						className="text-violet-600 animate-spin"
						width={48}
						height={48}
					/>
				)}
				{!isLoading && !status && (
					<>
						<Icon.CloudX
							className="text-red-600"
							width={48}
							height={48}
						/>
						<p>Invalid Checkout Session</p>
					</>
				)}
				{!isLoading && status && (
					<>
						<Icon.CheckCircle
							className="text-green-600"
							width={48}
							height={48}
						/>
						<p className="text-xl">Your payment was successful</p>
						<p className="text-gray-500">
							Name: {status.customer.name}
						</p>
						<p className="text-gray-500">
							Email: {status.customer.email}
						</p>
						<div
							className={`mt-10 transition-all flex items-center justify-center hover:border-gray-500  hover:cursor-pointer text-gray-500  border-gray-300 text-xl border-2 px-4 gap-1 rounded-full py-1`}
							onClick={() => {
								router.push("/dashboard")
							}}
						>
							<Icon.ArrowLeft className="h-6 w-6" /> Back to
							Dashboard
						</div>
					</>
				)}
			</div>
		</div>
	)
}
