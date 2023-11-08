"use client"
import { readApi } from "@/app/_context/api"
import { UserButton } from "@clerk/nextjs"
import * as Icon from "@phosphor-icons/react"
import { AccountButton } from "@/app/auth/_c/ManageUser"
export default function DashboardHeader() {
	const { user, isReady } = readApi()!
	return (
		<header className="flex pt-8 pb-4 px-10 justify-between">
			<div className="flex gap-4 items-center">
				<img
					className="aspect-auto h-8 hover:cursor-pointer"
					src="/logo_mini_new.png"
					alt=""
					onClick={() => open("/", "_self")}
				/>
				{isReady && user ? (
					<h2 className="flex gap-2 text-lg items-center">
						<span className="font-bold">{`${user.first_name} ${user.last_name}`}</span>
						<span className="text-zinc-300 text-2xl">/</span>
						<span className="font-bold">{`${user.username}`}</span>
					</h2>
				) : (
					<div className="flex gap-4 items-center">
						<div className="h-7 w-24 animate-pulse bg-zinc-300 rounded-full"></div>
						<div className="h-8 w-8 animate-pulse bg-zinc-300 rounded-full"></div>
					</div>
				)}
			</div>
			<div className="flex gap-4 items-center">
				<h3 className="transition-all rounded-full border-2 border-zinc-300 p-1 px-3 hover:bg-zinc-200 hover:cursor-pointer">
					Contact Us
				</h3>
				<AccountButton />
			</div>
		</header>
	)
}
