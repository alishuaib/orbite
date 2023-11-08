"use client"
import React, {
	MouseEventHandler,
	ReactElement,
	cloneElement,
	useEffect,
	useState,
} from "react"
import { useSearchParams } from "next/navigation"
import { readApi, writeApi } from "@/app/_context/api"
import * as Icon from "@phosphor-icons/react"
import ChatInput from "@/app/dashboard/chat/ChatInput"
import ChatView from "@/app/dashboard/chat/ChatView"
import { Session } from "@/lib/@schemas"

export type ChatHistory = {
	author: "user" | "bot" | "system"
	message: string | null
	index: number
	data:
		| {
				answer: string | null
				content_id: number
				course_id: number
				module_id: number
				section_id: number
				slice_index: number
				text: string
		  }[]
		| undefined
}

export default function ChatPage({ session }: { session: Session | null }) {
	const { courses, isReady, user } = readApi()!

	const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
	const [isGenerating, setGenerating] = useState(false)
	const [selectedCourse, setSelectedCourse] = useState<number | null>(null)
	const [isSidebar, setSidebar] = useState(true)

	//Handle fetching courses
	const [error, setError] = useState<string | null>(null)
	const { getCourses, generateAnswer } = writeApi()!
	useEffect(() => {
		console.log(user, isReady)
		if (!isReady) return
		let isCancelled = false

		const fetchCourses = async () => {
			const response = await getCourses()
			if (!isCancelled && !response) {
				console.error("Server Response Error - /courses API")
				setError("Server Response Error")
			}
		}

		fetchCourses()
		if (session?.course_id) setSelectedCourse(parseInt(session?.course_id))

		return () => {
			isCancelled = true
		}
	}, [isReady])

	//Handle chat input submission
	async function handleSubmit(query: string) {
		if (!selectedCourse || query.trim().length == 0) return
		setChatHistory((l) => [
			...l,
			{
				author: "user",
				message: query,
				index: 0,
				data: undefined,
			},
		])
		setGenerating(true)
		const response = await generateAnswer(selectedCourse, query)
		setGenerating(false)
		if (!response) {
			setChatHistory((l) => [
				...l,
				{
					author: "system",
					message: "Error generating answer, Please try again",
					index: 0,
					data: undefined,
				},
			])
		} else {
			const documents = response.data.Get.Content.map((item) => {
				const { _additional, ...rest } = item
				return {
					...rest,
					answer: _additional.generate.error
						? null
						: _additional.generate.singleResult,
				}
			})
			setChatHistory((l) => [
				...l,
				{
					author: "bot",
					message: documents[0].answer,
					index: 0,
					data: documents,
				},
			])
		}
	}

	return (
		<div className="relative flex border-2 border-gray-300 flex-1 rounded-md bg-gray-100 h-screen pointer-events-auto">
			<div className="relative flex flex-col flex-[3]">
				{chatHistory.length == 0 && (
					<div className="absolute flex w-full h-full items-center justify-center pointer-events-none">
						<img
							className="grayscale opacity-50 aspect-auto h-14"
							src="/logo_lg.png"
							alt=""
						/>
					</div>
				)}
				<div className="relative flex flex-1 flex-col w-full self-center rounded my-4 items-center overflow-y-hidden">
					<ChatView
						chatHistory={chatHistory}
						isGenerating={isGenerating}
						width="w-full px-4"
						sourceStyle={1}
					/>
				</div>
				<div className="flex w-full px-4 pt-3">
					<div className="relative flex w-full p-2 self-center mt-auto bg-gray-300 rounded mb-5 items-center">
						<ChatInput
							selectedCourse={selectedCourse}
							submit={handleSubmit}
							chatHistory={chatHistory}
							clearChat={() => {
								setChatHistory([])
							}}
						/>
					</div>
				</div>
				{/* <div
					onClick={() => {
						setSidebar((l) => !l)
					}}
					className={`absolute top-4 right-4 border-2 p-2 rounded hover:scale-110  transition-all cursor-pointer flex items-center justify-center text-gray-600 ${
						isSidebar && "border-violet-300 text-violet-600"
					}`}
				>
					<Icon.SidebarSimple
						width={24}
						height={24}
					/>
				</div> */}
				{/* <div
						onClick={() => {
							setChatHistory([])
						}}
						className={`absolute top-4 left-4 border-2 p-2 rounded   transition-all cursor-not-allowed flex items-center justify-center text-gray-300 ${
							chatHistory.length != 0 &&
							"border-red-300 text-red-600 hover:scale-110 cursor-pointer"
						}`}
					>
						<Icon.Trash
							width={24}
							height={24}
						/>
					</div> */}
			</div>

			{/* <div
				className={`overflow-hidden flex flex-col bg-gray-200 transition-all border-l-2 border-l-gray-400 ${
					isSidebar ? "flex-1" : "w-0"
				}`}
			>
				<div className="flex p-4 items-center gap-2">
					<h2 className="text-2xl flex-1 whitespace-nowrap">
						Course Selection
					</h2>
				</div>
				<div className="flex flex-1 flex-col overflow-y-scroll">
					{courses ? (
						courses.map((course) => {
							return (
								<div
									key={course.id}
									className={`rounded flex items-center justify-between p-2 hover:bg-gray-200 cursor-pointer ${
										selectedCourse == course.id
											? "bg-violet-200 font-bold text-violet-800 hover:bg-violet-200"
											: ""
									}`}
									onClick={() => {
										setSelectedCourse(course.id)
									}}
								>
									<div className="flex gap-3 items-center">
										<Icon.Folders
											weight="light"
											width={40}
											height={40}
										/>
										<p>{course.title}</p>
									</div>
								</div>
							)
						})
					) : (
						<div className="flex-1 items-center justify-center flex flex-col text-violet-500">
							{!error ? (
								<>
									<Icon.CircleNotch
										width={48}
										height={48}
										className="animate-spin"
									/>
									<p className="text-2xl animate-pulse">
										Loading Courses
									</p>
								</>
							) : (
								<>
									<Icon.CloudX
										width={48}
										height={48}
										className=" text-red-300"
									/>
									<p className="text-2xl text-red-300">
										{error}
									</p>
								</>
							)}
						</div>
					)}
				</div>
			</div> */}
		</div>
	)
}
