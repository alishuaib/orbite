"use client"
import { useRouter } from "next/navigation"
import { use, useEffect } from "react"
import { readContext, writeContext } from "@/app/context"

export default function Login() {
	const { push } = useRouter()
	const user = readContext()?.user
	const authUser = writeContext()?.authUser!

	//
	//FOR PREVIEW PURPOSES ONLY - TO BE REPLACED WITH AUTH
	//

	const INPUT_EMAIL = "ali@moonlite.digital"

	useEffect(() => {
		authUser(INPUT_EMAIL)
	}, [])

	useEffect(() => {
		setTimeout(() => {
			//Fake Delay
			push(`hub/${user?._handle}`)
		}, 2000)
	}, [user])

	return (
		<main className="h-screen w-screen flex gap-8 flex-col items-center justify-center text-gray-700">
			<h1 className="text-6xl">🚧 Login Page</h1>
			<div className="flex flex-col gap-2 items-center justify-center">
				<h2 className="text-2xl">Redirecting to Preview</h2>
				<div className="animate-pulse flex gap-4">
					<div className="rounded-full bg-slate-400 w-4 h-4"></div>
					<div className="rounded-full bg-slate-400 w-4 h-4"></div>
					<div className="rounded-full bg-slate-400 w-4 h-4"></div>
				</div>
			</div>
			<h3 className="text-m text-gray-200">
				Preview User: {JSON.stringify(INPUT_EMAIL, null, 4)}
			</h3>
		</main>
	)
}
