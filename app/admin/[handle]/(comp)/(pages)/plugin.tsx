"use client"
import * as ico from "@phosphor-icons/react"
import { useState, useRef, useEffect, useLayoutEffect, use } from "react"
import { useRouter } from "next/navigation"
import { writeContext, readContext } from "@/app/context"
import { writeAdminContext, readAdminContext } from "@/app/adminContext"
import { Course, File, Module } from "@/lib/@schemas"
import { DefaultExtensionType, FileIcon, defaultStyles } from "react-file-icon"
import { useDropzone } from "react-dropzone"
import { toast } from "sonner"

export default function PluginPage() {
	return (
		<>
			<div className="border-zinc-500 border-b flex w-full text-2xl px-2 h-16 items-center gap-2 flex-none">
				<h2 className="flex-1">LMS Plugin</h2>
			</div>
			<div className="w-full flex flex-col gap-10 flex-none items-center justify-center pt-8">
				<div className="w-full h-fit flex flex-col gap-5 items-center justify-center">
					<div className="w-full flex gap-2 justify-center">
						<img
							className="rounded-xl aspect-square w-36"
							src="/moodle.png"
							alt=""
						/>
						<img
							className="rounded-xl aspect-square w-36"
							src="/totara.png"
							alt=""
						/>
					</div>
					<div className="bg-zinc-700 py-2 px-4 rounded-md text-zinc-400 w-fit">
						<p>Coming Soon</p>
					</div>
				</div>
				<div className="w-full h-fit flex flex-col gap-5 items-center justify-center">
					<div className="w-full flex gap-2 justify-center">
						<img
							className="rounded-xl aspect-auto h-36"
							src="/html.png"
							alt=""
						/>
					</div>
					<div className="bg-zinc-700 py-2 px-4 rounded-md text-zinc-400 w-fit">
						<p>Coming Soon</p>
					</div>
				</div>
			</div>
		</>
	)
}
