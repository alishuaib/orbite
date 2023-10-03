"use client"
import { useRouter } from "next/navigation"
import { readAdminContext } from "@/app/adminContext"
import { useEffect } from "react"

export default function AdminLoad() {
	const { push } = useRouter()
	const { handle } = readAdminContext()!

	useEffect(() => {
		if (!handle) return
		push(`/admin/${handle}`)
	}, [handle])

	return (
		<main className="relative h-screen w-screen flex bg-gray-200">
			<h1>Loading User and Auth information</h1>
		</main>
	)
}
