"use client"
import {
	MouseEventHandler,
	ReactElement,
	cloneElement,
	use,
	useEffect,
	useState,
} from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { readApi, writeApi } from "@/app/_context/api"
import { UserButton, UserProfile, useClerk } from "@clerk/nextjs"
import * as Icon from "@phosphor-icons/react"
import { AccountProfile } from "@/app/auth/_c/ManageUser"
export default function DashboardTabs() {
	const { setOverlay } = writeApi()!
	const [active, setActive] = useState(0)
	const router = useRouter()
	const pathname = usePathname()
	const tabs = [
		{
			name: "Overview",
			path: "/dashboard",
			onClick: (i: number) => handleClick("/dashboard", i),
		},
		{
			name: "Synced Content",
			path: "/dashboard/content",
			onClick: (i: number) => handleClick("/dashboard/content", i),
		},
		{
			name: "Chat Simulation",
			path: "/dashboard/chat",
			onClick: (i: number) => handleClick("/dashboard/chat", i),
		},
		{
			name: "Customization",
			path: "/dashboard/custom",
			onClick: (i: number) => handleClick("/dashboard/custom", i),
		},
		{
			name: "Plugins",
			path: "/dashboard/plugins",
			onClick: (i: number) => handleClick("/dashboard/plugins", i),
		},
		{
			name: "Settings",
			path: "/dashboard/settings",
			onClick: (i: number) => {
				setOverlay(
					<div className="h-full w-full py-24 flex items-center justify-center pointer-events-none">
						<div className="relative h-full w-fit">
							<div
								onClick={() => setOverlay(null)}
								className="absolute pointer-events-auto w-9 h-9 p-2 top-4 right-10 bg-white z-50 rounded hover:brightness-95 cursor-pointer"
							>
								<Icon.X
									weight="bold"
									className="h-full w-full text-gray-600"
								/>
							</div>
							<AccountProfile />
						</div>
					</div>
				)
			},
		},
	]
	const params = useSearchParams()
	useEffect(() => {
		const session_id = params?.get("session_id")
		console.log(session_id)
	}, [])
	function handleClick(url: string, i: number) {
		router.push(url)
		setActive(i)
	}
	useEffect(() => {
		const index = tabs.findIndex((tab) => tab.path == pathname)
		if (index != -1) setActive(index)
	}, [pathname])

	useEffect(() => {
		if (window.location.href.includes("#/billing")) {
			tabs.find((tab) => tab.name == "Settings")?.onClick(-1)
		}
	}, [active])
	return (
		<div className="flex border-b border-zinc-300 px-10">
			{tabs.map((tab, i) => (
				<div
					className={`transition-all p-3 px-4 pt-2 border-b hover:border-zinc-400 hover:cursor-pointer ${
						active == i ? "border-violet-600 font-bold" : ""
					}`}
					onClick={() => tab.onClick(i)}
				>
					{tab.name}
				</div>
			))}
		</div>
	)
}
