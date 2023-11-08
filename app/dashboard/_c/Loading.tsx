"use client"
export default function DashboardLoading() {
	return (
		<div className="flex bg-zinc-100 text-zinc-900 flex-col h-screen">
			<header className="flex pt-8 pb-4 px-10 justify-between">
				<div className="flex gap-4 items-center">
					<div className="h-8 w-8 animate-pulse bg-zinc-300 rounded-full"></div>
					<div className="flex gap-2 text-lg items-center">
						<div className="h-7 w-24 animate-pulse bg-zinc-300 rounded-full"></div>
						<span className="text-zinc-300 text-2xl">/</span>
						<div className="h-7 w-24 animate-pulse bg-zinc-300 rounded-full"></div>
					</div>
				</div>
				<div className="flex gap-4 items-center">
					<div className="h-7 w-24 animate-pulse bg-zinc-300 rounded-full"></div>
					<div className="h-8 w-8 animate-pulse bg-zinc-300 rounded-full"></div>
				</div>
			</header>
			<div className="flex border-b border-zinc-300 px-10">
				{Array(5)
					.fill(0)
					.map((tab, i) => (
						<div
							className={`animate-pulse h-7 w-24 p-3 px-4 mx-2 pt-2 border-b bg-zinc-300 `}
						></div>
					))}
			</div>
		</div>
	)
}
