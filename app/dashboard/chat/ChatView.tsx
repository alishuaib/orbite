"use client"
import React, {
	MouseEventHandler,
	ChangeEventHandler,
	ReactElement,
	cloneElement,
	useEffect,
	useState,
	use,
} from "react"
import { useRouter } from "next/navigation"
import { readApi, writeApi } from "@/app/_context/api"
import * as Icon from "@phosphor-icons/react"
import { ChatHistory } from "./page"
import { useUser } from "@clerk/nextjs"
import FileIcon from "../_c/FileIcon"

export default function ChatView({
	chatHistory,
	isGenerating,
	width = "w-1/3",
	sourceStyle = 0,
}: {
	chatHistory: ChatHistory[]
	isGenerating: boolean
	width?: string
	sourceStyle?: 0 | 1
}) {
	return (
		<div className="w-full h-full overflow-y-scroll">
			{chatHistory.map((chat, index) => {
				return (
					<ChatMessage
						chat={chat}
						width={width}
						sourceStyle={sourceStyle}
					/>
				)
			})}
			{isGenerating && (
				<div className={`flex w-full justify-center py-3 bg-gray-200`}>
					<div className={`flex gap-4 ${width}`}>
						<div className="flex-none">
							<div className="rounded flex items-center justify-center w-10 h-10 bg-violet-300 text-violet-700">
								<Icon.CircleDashed
									weight="bold"
									className="w-6 h-6"
								/>
							</div>
						</div>
						<div className="flex-1 flex gap-1 items-center">
							<span className="w-2 h-2 animate-bounce bg-gray-400 rounded-full" />
							<span className="w-2 h-2 animate-bounce bg-gray-400 rounded-full" />
							<span className="w-2 h-2 animate-bounce bg-gray-400 rounded-full" />
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

function ChatMessage({
	chat,
	width,
	sourceStyle,
}: {
	chat: ChatHistory
	width: string
	sourceStyle: 0 | 1
}) {
	const { user } = useUser()
	const [answerIndex, setAnswer] = useState(0)
	const [viewSource, setViewSource] = useState(false)
	const { courses, sections, modules, contents } = readApi()!
	const index = chat.data?.[answerIndex]
	const selected = {
		course: courses?.find((c) => c.id === index?.course_id),
		section: sections?.find((c) => c.id === index?.section_id),
		module: modules?.find((c) => c.id === index?.module_id),
		content: contents?.find((c) => c.id === index?.content_id),
	}
	return (
		<div
			className={`flex w-full justify-center py-3 ${
				chat.author == "bot" ? "bg-gray-200" : ""
			}  ${chat.author == "system" ? "bg-yellow-100" : ""}`}
		>
			<div className={`flex gap-4 ${width} `}>
				<div className="flex-none">
					{chat.author == "user" ? (
						user?.imageUrl ? (
							<img
								src={user?.imageUrl}
								className="rounded w-10 h-10"
								alt=""
							/>
						) : (
							<div
								className={`rounded flex items-center justify-center w-10 h-10 bg-indigo-300`}
							>
								<Icon.User
									weight="bold"
									className="w-6 h-6 text-indigo-700"
								/>
							</div>
						)
					) : (
						<div
							className={`rounded flex items-center justify-center w-10 h-10 ${
								chat.author == "bot"
									? "bg-violet-300"
									: "bg-yellow-300"
							}`}
						>
							{chat.author == "bot" ? (
								<Icon.CircleDashed
									weight="bold"
									className="w-6 h-6 text-violet-700"
								/>
							) : (
								<Icon.Warning
									weight="bold"
									className="w-6 h-6 text-yellow-700"
								/>
							)}
						</div>
					)}
				</div>
				<div className="flex-1 flex flex-col gap-1">
					<p className="whitespace-pre-wrap mt-1">
						{answerIndex == 0
							? chat.message
							: chat.data?.[answerIndex].answer}
					</p>
					{chat.author == "bot" && (
						<div className="flex justify-between">
							<div
								onClick={() => setViewSource(true)}
								className="flex gap-1 self-start text-violet-600 border-b cursor-pointer hover:border-b-violet-600"
							>
								View Source
							</div>
							<div className="flex gap-1 self-end">
								<Icon.NumberSquareOne
									onClick={() => setAnswer(0)}
									weight="fill"
									className={`w-5 h-5 ${
										answerIndex == 0
											? "text-violet-600"
											: "text-gray-400 cursor-pointer"
									}`}
								/>
								<Icon.NumberSquareTwo
									onClick={() => setAnswer(1)}
									weight="fill"
									className={`w-5 h-5 ${
										answerIndex == 1
											? "text-violet-600"
											: "text-gray-400 cursor-pointer"
									}`}
								/>
								<Icon.NumberSquareThree
									onClick={() => setAnswer(2)}
									weight="fill"
									className={`w-5 h-5 ${
										answerIndex == 2
											? "text-violet-600"
											: "text-gray-400 cursor-pointer"
									}`}
								/>
							</div>
						</div>
					)}
				</div>
				{viewSource &&
					(sourceStyle == 0 ? (
						<div className="absolute top-0 left-0 flex p-10 flex-1 backdrop-blur-sm z-10 h-full">
							<div
								onClick={() => {
									setViewSource(false)
								}}
								className={`absolute top-4 right-4 border-2 p-2 rounded hover:scale-110  transition-all cursor-pointer flex items-center justify-center text-gray-600 bg-gray-200 border-violet-300 `}
							>
								<Icon.X
									weight="bold"
									width={24}
									height={24}
								/>
							</div>
							<div className="bg-white flex-[2] p-4 overflow-y-scroll">
								<p className="whitespace-pre-wrap">
									{chat.data?.[answerIndex].text}
								</p>
							</div>
							<div className="flex flex-1 flex-col p-10 justify-center items-center">
								<span className="w-full mt-2  font-bold">
									Course
								</span>
								<div
									className={`w-full rounded flex items-center justify-between p-2 cursor-pointer bg-violet-200 font-bold text-violet-800 hover:bg-violet-200`}
								>
									<div className="flex gap-3 items-center">
										<Icon.Folders
											weight="light"
											width={40}
											height={40}
										/>
										<p>{selected.course?.title}</p>
									</div>
								</div>
								<span className="w-full mt-2  font-bold">
									Section
								</span>
								<div
									className={`w-full rounded flex items-center justify-between p-2 cursor-pointer bg-violet-200 font-bold text-violet-800 hover:bg-violet-200`}
								>
									<div className="flex gap-3 items-center">
										<Icon.Folder
											weight="light"
											width={40}
											height={40}
										/>
										<p>{selected.section?.title}</p>
									</div>
								</div>
								<span className="w-full mt-2  font-bold">
									Module
								</span>
								<div
									className={`w-full rounded flex items-center justify-between p-2 cursor-pointer bg-violet-200 font-bold text-violet-800 hover:bg-violet-200`}
								>
									<div className="flex gap-3 items-center">
										<Icon.Video
											weight="light"
											width={40}
											height={40}
										/>
										<p>{selected.module?.title}</p>
									</div>
								</div>
								<span className="mt-2 font-bold">Content</span>
								<div
									key={module.id}
									className={`w-fit aspect-square rounded flex items-center justify-center p-2 cursor-pointer bg-violet-200 font-bold text-violet-800 hover:bg-violet-200`}
								>
									<div className="flex gap-3 items-center flex-col justify-center ">
										<FileIcon
											ext={selected.content?.ext || ""}
										/>
										<p>
											{selected.content?.name +
												"." +
												selected.content?.ext}
										</p>
									</div>
								</div>
							</div>
						</div>
					) : (
						<div className="absolute top-0 left-0 flex p-4 flex-1 flex-col backdrop-blur-sm z-10 h-full">
							<div
								onClick={() => {
									setViewSource(false)
								}}
								className={`absolute top-4 right-4 border-2 p-2 rounded hover:scale-110  transition-all cursor-pointer flex items-center justify-center text-gray-600 bg-gray-200 border-violet-300 `}
							>
								<Icon.X
									weight="bold"
									width={24}
									height={24}
								/>
							</div>
							<div className="bg-white flex-[2] p-4 overflow-y-scroll">
								<p className="whitespace-pre-wrap">
									{chat.data?.[answerIndex].text}
								</p>
							</div>
							<div className="flex flex-1 flex-col p-4 justify-center items-center">
								<div className="w-full flex flex-col">
									<span className="w-full mt-2  font-bold">
										Course
									</span>
									<div
										onClick={() => {
											if (selected.course?.url)
												window.open(
													selected.course.url,
													"_blank"
												)
										}}
										className={`w-full rounded flex items-center justify-between p-2 cursor-pointer bg-violet-200 font-bold text-violet-800 hover:bg-violet-200`}
									>
										<div className="flex gap-3 items-center">
											<Icon.Folders
												weight="light"
												width={40}
												height={40}
											/>
											<p>{selected.course?.title}</p>
										</div>
									</div>
								</div>
								<div className="w-full flex flex-col">
									<span className="w-full mt-2  font-bold">
										Section
									</span>
									<div
										onClick={() => {
											if (selected.section?.url)
												window.open(
													selected.section.url,
													"_blank"
												)
										}}
										className={`w-full rounded flex items-center justify-between p-2 cursor-pointer bg-violet-200 font-bold text-violet-800 hover:bg-violet-200`}
									>
										<div className="flex gap-3 items-center">
											<Icon.Folder
												weight="light"
												width={40}
												height={40}
											/>
											<p>{selected.section?.title}</p>
										</div>
									</div>
								</div>
								<div className="w-full flex flex-col">
									<span className="w-full mt-2  font-bold">
										Module
									</span>
									<div
										onClick={() => {
											if (selected.module?.url)
												window.open(
													selected.module.url,
													"_blank"
												)
										}}
										className={`w-full rounded flex items-center justify-between p-2 cursor-pointer bg-violet-200 font-bold text-violet-800 hover:bg-violet-200`}
									>
										<div className="flex gap-3 items-center">
											<Icon.Video
												weight="light"
												width={40}
												height={40}
											/>
											<p>{selected.module?.title}</p>
										</div>
									</div>
								</div>
								<div className="w-full flex flex-col">
									<span className="w-full mt-2  font-bold">
										Content
									</span>
									<div
										onClick={() => {
											if (selected.content?.url)
												window.open(
													selected.content.url,
													"_blank"
												)
										}}
										className={`w-full rounded flex items-center justify-between p-2 cursor-pointer bg-violet-200 font-bold text-violet-800 hover:bg-violet-200`}
									>
										<div className="flex gap-3 items-center">
											<FileIcon
												ext={
													selected.content?.ext || ""
												}
												width={"40px"}
												height={"40px"}
											/>
											<p>
												{selected.content?.name +
													"." +
													selected.content?.ext}
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					))}
			</div>
		</div>
	)
}
