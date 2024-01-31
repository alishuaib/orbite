"use client"

import { readApi, writeApi } from "@/app/_context/api"
import { Toaster } from "sonner"
export default function Overlay() {
	const { overlay } = readApi()!
	const { setOverlay } = writeApi()!

	return (
		<section
			onClick={(e) => {
				if (e.target !== e.currentTarget) return
				setOverlay(null)
			}}
			style={
				{
					// backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.10)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
					// backgroundPosition: "10px 10px",
				}
			}
			className={`${
				overlay ? "opacity-100" : "pointer-events-none opacity-0"
			} transition-all flex fixed z-100 h-screen w-screen bg-black/60 p-10`}
		>
			{overlay}
			<Toaster
				position="bottom-center"
				richColors
			/>
		</section>
	)
}
