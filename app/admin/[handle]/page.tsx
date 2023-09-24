"use client"
import * as ico from "@phosphor-icons/react"
import { useState, useRef, useEffect, useLayoutEffect, use } from "react"
import { useRouter } from "next/navigation"
import { writeContext, readContext } from "@/app/context"
import { writeAdminContext, readAdminContext } from "@/app/adminContext"
import { Course, Module, File } from "@/lib/@schemas"
import { DefaultExtensionType, FileIcon, defaultStyles } from "react-file-icon"
import { Toaster, toast } from "sonner"
import Viewer from "./(comp)/viewer"
import Sidebar from "./(comp)/sidebar"
import { ChatPalette } from "./(comp)/(pages)/ChatPalette"
type Params = {
	handle: string
}
export default function Home({ params }: { params: Params }) {
	const { push } = useRouter()
	const setHandle = writeAdminContext()?.setHandle!

	useEffect(() => {
		setHandle(params.handle)
	})

	return (
		<main className="relative h-screen w-screen flex bg-gray-200">
			<ChatPalette />
			<Sidebar />
			<Viewer preview />
			<Toaster
				position="bottom-center"
				richColors
			/>
		</main>
	)
}
