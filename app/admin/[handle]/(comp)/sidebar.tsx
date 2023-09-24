"use client"
import * as ico from "@phosphor-icons/react"
import { useState, useRef, useEffect, useLayoutEffect, use } from "react"
import { useRouter } from "next/navigation"
import { writeContext, readContext } from "@/app/context"
import { writeAdminContext, readAdminContext } from "@/app/adminContext"
import { Course, File, Module } from "@/lib/@schemas"
import { DefaultExtensionType, FileIcon, defaultStyles } from "react-file-icon"
import FilePage from "./(pages)/files"
import ChatPage from "./(pages)/chat"
import UploadPage from "./(pages)/upload"
import PluginPage from "./(pages)/plugin"

export default function Sidebar() {
	//Handle Page State
	const [page, setPage] = useState<string>("files")
	const { push } = useRouter()
	async function handlePage(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
		const page = e.currentTarget.dataset.page
		if (page) setPage(page)
	}
	return (
		<div className=" flex w-2/6 min-w-[422px] h-full text-zinc-100">
			<div className="bg-zinc-900 flex flex-col h-full w-16 flex-none">
				<div
					className="border-zinc-500 border-b border-r flex flex-none w-full h-16 items-center justify-center cursor-pointer"
					data-page=""
					onClick={() => push("")}
				>
					<img
						className="aspect-auto h-8"
						src="/logo_sm.png"
						alt=""
					/>
				</div>
				<div className="border-zinc-500 border-r flex flex-col w-full h-full">
					<div
						className={`${
							page == "files" ? "bg-zinc-800" : ""
						} h-16 w-full flex items-center justify-center hover:bg-zinc-800 cursor-pointer group`}
						data-page="files"
						onClick={handlePage}
					>
						<ico.Folders
							className={`${
								page == "files"
									? "scale-90 fill-zinc-100"
									: "fill-zinc-300"
							} h-8 w-8  group-hover:fill-zinc-100 group-hover:scale-90 transition-all`}
							weight="fill"
						/>
					</div>
					<div
						className={`${
							page == "chat" ? "bg-zinc-800" : ""
						} h-16 w-full flex items-center justify-center hover:bg-zinc-800 cursor-pointer group`}
						data-page="chat"
						onClick={handlePage}
					>
						<ico.Chats
							className={`${
								page == "chat"
									? "scale-90 fill-zinc-100"
									: "fill-zinc-300"
							} h-8 w-8  group-hover:fill-zinc-100 group-hover:scale-90 transition-all`}
							weight="fill"
						/>
					</div>
					<div
						className={`${
							page == "upload" ? "bg-zinc-800" : ""
						} h-16 w-full flex items-center justify-center hover:bg-zinc-800 cursor-pointer group`}
						data-page="upload"
						onClick={handlePage}
					>
						<ico.Upload
							className={`${
								page == "upload"
									? "scale-90 fill-zinc-100"
									: "fill-zinc-300"
							} h-8 w-8  group-hover:fill-zinc-100 group-hover:scale-90 transition-all`}
							weight="fill"
						/>
					</div>

					<div
						className={`${
							page == "plugin" ? "bg-zinc-800" : ""
						} h-16 w-full flex items-center justify-center hover:bg-zinc-800 cursor-pointer group`}
						data-page="plugin"
						onClick={handlePage}
					>
						<ico.PlugsConnected
							className={`${
								page == "plugin"
									? "scale-90 fill-zinc-100"
									: "fill-zinc-300"
							} h-8 w-8  group-hover:fill-zinc-100 group-hover:scale-90 transition-all`}
							weight="fill"
						/>
					</div>
					<div
						className={`${
							page == "theme" ? "bg-zinc-800" : ""
						} h-16 w-full flex items-center justify-center cursor-not-allowed group`}
						data-page="theme"
						// onClick={handlePage}
					>
						<ico.PaintBrush
							className={`${
								page == "theme"
									? "scale-90 fill-zinc-600"
									: "fill-zinc-600"
							} h-8 w-8  `}
							weight="fill"
						/>
					</div>
					<div
						className={`${
							page == "settings" ? "" : ""
						} h-16 w-full flex items-center justify-center cursor-not-allowed group`}
						data-page="settings"
						// onClick={handlePage}
					>
						<ico.UserCircleGear
							className={`${
								page == "settings"
									? "scale-90 fill-zinc-600"
									: "fill-zinc-600"
							} h-8 w-8  `}
							weight="fill"
						/>
					</div>
				</div>
			</div>
			<div className="bg-zinc-800 flex flex-col w-full flex-1 h-full gap-2">
				{
					{
						files: <FilePage />,
						chat: <ChatPage />,
						upload: <UploadPage />,
						plugin: <PluginPage />,
					}[page]
				}
			</div>
		</div>
	)
}
