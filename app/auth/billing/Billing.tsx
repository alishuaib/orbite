"use client"
import {
	MouseEventHandler,
	ReactElement,
	cloneElement,
	useEffect,
	useState,
} from "react"
import { useRouter } from "next/navigation"
import { readApi, writeApi } from "@/app/_context/api"
import * as Icon from "@phosphor-icons/react"

export default function BillingPage() {
	return (
		<div className="flex flex-col gap-8">
			<div className="flex flex-col gap-2">
				<h1 className="text-3xl font-bold">Plan & Billing</h1>
				<p className="text-gray-500">
					Manage Payment plan and Billing details
				</p>
			</div>
		</div>
	)
}
