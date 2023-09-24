"use client"
import { useState, useRef, useEffect, useLayoutEffect, use } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { readAdminContext, writeAdminContext } from "@/app/adminContext"
import { writeContext, readContext } from "@/app/context"

import PluginBtn from "./(comp)/btn"
import PluginChat from "./(comp)/chat"

export default function Plugin() {
	const pathname = usePathname()
	const searchParams = useSearchParams()!
	const session = searchParams.get("session")
	const course_id = searchParams.get("course_id")
	const [isValidSession, setValidSession] = useState(false)
	const { handle, courses, modules, files } = readAdminContext()!
	const [isLoading, setLoading] = useState(true)
	const setHandle = writeAdminContext()?.setHandle!
	const getAuth = writeContext()?.getAuth!

	async function validateSession(token: string) {
		const session = await getAuth(token)
		if (session === null) return
		setHandle(session.handle)
		setValidSession(true)

		console.log("Chat session for " + session + " started")
	}
	useEffect(() => {
		if (session) {
			validateSession(session)
		}
		setLoading(false)
	}, [session])

	return (
		<div className="absolute top-0 right-0 h-screen w-[430px] bg-zinc-800 flex flex-col gap-2 transition-all z-50 text-zinc-100 border-zinc-500 border-l-2">
			{isLoading ? (
				<div className="w-full h-full flex flex-col items-center justify-center gap-2">
					<svg
						className="animate-spin"
						xmlns="http://www.w3.org/2000/svg"
						width="64"
						height="64"
						viewBox="0 0 256 256"
					>
						<defs>
							<linearGradient
								id="0"
								x1="0.25"
								y1="0.07"
								x2="0.75"
								y2="0.93"
							>
								<stop
									offset="0%"
									stopColor="#a1d0ec"
								/>
								<stop
									offset="3.14%"
									stopColor="#9dcaed"
								/>
								<stop
									offset="6.29%"
									stopColor="#9bc4ee"
								/>
								<stop
									offset="9.43%"
									stopColor="#99beef"
								/>
								<stop
									offset="12.57%"
									stopColor="#9ab7f1"
								/>
								<stop
									offset="15.71%"
									stopColor="#9cb0f3"
								/>
								<stop
									offset="22%"
									stopColor="#a79ef9"
								/>
								<stop
									offset="26.29%"
									stopColor="#a99bf9"
								/>
								<stop
									offset="30.57%"
									stopColor="#ab97f8"
								/>
								<stop
									offset="34.86%"
									stopColor="#ad94f8"
								/>
								<stop
									offset="39.14%"
									stopColor="#af90f8"
								/>
								<stop
									offset="43.43%"
									stopColor="#b18cf8"
								/>
								<stop
									offset="52%"
									stopColor="#b684f7"
								/>
								<stop
									offset="56.29%"
									stopColor="#c983f5"
								/>
								<stop
									offset="60.57%"
									stopColor="#da83f4"
								/>
								<stop
									offset="64.86%"
									stopColor="#ea83f3"
								/>
								<stop
									offset="69.14%"
									stopColor="#f288eb"
								/>
								<stop
									offset="73.43%"
									stopColor="#f293de"
								/>
								<stop
									offset="82%"
									stopColor="#f1a6cf"
								/>
								<stop
									offset="84.57%"
									stopColor="#f1aad1"
								/>
								<stop
									offset="87.14%"
									stopColor="#f1afd3"
								/>
								<stop
									offset="89.71%"
									stopColor="#f1b3d5"
								/>
								<stop
									offset="92.29%"
									stopColor="#f1b7d8"
								/>
								<stop
									offset="94.86%"
									stopColor="#f1bcda"
								/>
								<stop
									offset="100%"
									stopColor="#f2c4de"
								/>
							</linearGradient>
						</defs>
						<path
							fill={"url(#0)"}
							d="M236,128a108,108,0,0,1-216,0c0-42.52,24.73-81.34,63-98.9A12,12,0,1,1,93,50.91C63.24,64.57,44,94.83,44,128a84,84,0,0,0,168,0c0-33.17-19.24-63.43-49-77.09A12,12,0,1,1,173,29.1C211.27,46.66,236,85.48,236,128Z"
						></path>
					</svg>
				</div>
			) : session && isValidSession ? (
				<PluginChat
					course_id={course_id}
					course={pathname?.split("/")[3] || ""}
				/>
			) : !session ? (
				<div className="w-full h-full flex flex-col items-center justify-center gap-2">
					<PluginBtn warning />
					<h1 className="text-red-400 font-bold text-4xl text-center">
						Unauthorized <br /> Session
					</h1>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="64"
						height="64"
						fill="#fca5a5"
						viewBox="0 0 256 256"
					>
						<path d="M128,24A104,104,0,1,0,232,128,104.13,104.13,0,0,0,128,24ZM92,96a12,12,0,1,1-12,12A12,12,0,0,1,92,96Zm76,72H88a8,8,0,0,1,0-16h80a8,8,0,0,1,0,16Zm-4-48a12,12,0,1,1,12-12A12,12,0,0,1,164,120Z"></path>
					</svg>
				</div>
			) : (
				<div className="w-full h-full flex flex-col items-center justify-center gap-2">
					<PluginBtn warning />
					<h1 className="text-amber-400 font-bold text-4xl text-center">
						Session <br /> Expired
					</h1>
					<p className="text-amber-400 text-2xl text-center">
						Reload Page
					</p>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="64"
						height="64"
						fill="#fbbf24"
						viewBox="0 0 256 256"
					>
						<path d="M148.48,67.93l-3.41,3.93a12,12,0,1,1-18.14-15.72l3.72-4.29c.19-.21.38-.42.58-.62a52,52,0,0,1,73.54,73.54c-.2.2-.41.39-.62.58l-4.29,3.72a12,12,0,1,1-15.72-18.14l3.93-3.41a28,28,0,0,0-39.59-39.59Zm-20.62,115a12,12,0,0,0-16.93,1.21l-3.41,3.93a28,28,0,0,1-39.59-39.59l3.93-3.41a12,12,0,0,0-15.72-18.14l-4.29,3.72c-.21.19-.42.38-.62.58a52,52,0,0,0,73.54,73.54c.2-.2.39-.41.58-.62l3.72-4.29A12,12,0,0,0,127.86,182.93ZM208,148H188a12,12,0,0,0,0,24h20a12,12,0,0,0,0-24ZM48,108H68a12,12,0,0,0,0-24H48a12,12,0,0,0,0,24Zm112,68a12,12,0,0,0-12,12v20a12,12,0,0,0,24,0V188A12,12,0,0,0,160,176ZM96,80a12,12,0,0,0,12-12V48a12,12,0,0,0-24,0V68A12,12,0,0,0,96,80Z"></path>
					</svg>
				</div>
			)}
		</div>
	)
}
