"use client"

import { UserButton, UserProfile } from "@clerk/nextjs"
import * as Icon from "@phosphor-icons/react"
import BillingPage from "../billing/Billing"
export function AccountProfile() {
	return (
		<UserProfile
			appearance={{
				elements: {
					rootBox: "h-full pointer-events-auto",
				},
			}}
		>
			<UserProfile.Page
				label="Plan & Billing"
				labelIcon={
					<Icon.CreditCard
						weight="fill"
						width={16}
						height={16}
					/>
				}
				url="billing"
			>
				<BillingPage />
			</UserProfile.Page>
		</UserProfile>
	)
}

export function AccountButton() {
	return (
		<UserButton afterSignOutUrl="/">
			<UserButton.UserProfilePage
				label="Plan & Billing"
				labelIcon={
					<Icon.CreditCard
						weight="fill"
						width={16}
						height={16}
					/>
				}
				url="billing"
			>
				<BillingPage />
			</UserButton.UserProfilePage>
		</UserButton>
	)
}
