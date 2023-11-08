"use client"
import React, {
	MouseEventHandler,
	ReactElement,
	cloneElement,
	useEffect,
	useRef,
	useState,
} from "react"
import { useSearchParams } from "next/navigation"
import { readApi, writeApi } from "@/app/_context/api"
import * as Icon from "@phosphor-icons/react"
import { motion } from "framer-motion"
import { Session } from "@/lib/@schemas"
import { useUser } from "@clerk/nextjs"
import FileIcon from "../_c/FileIcon"

enum SessionStates {
	SESSION_INVALID = "SESSION_INVALID",
	AUTHORIZING = "AUTHORIZING",
	CHAT_CLOSED = "CHAT_CLOSED",
	CHAT_OPEN = "CHAT_OPEN",
}
type ChatHistory = {
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
const sampleChat: ChatHistory[] = [
	{
		author: "user",
		message: "Can you tell me more about orbites chat customization?",
		index: 0,
		data: undefined,
	},
	{
		author: "bot",
		message:
			"Sure the chat customization is used to change how user interface elements look for integrations and embeds.\n\nTheres 2 primary type of elements, Embed Button and Chat Window. \n\nThe embed button is displayed on your LMS website and allows the user to open and close the Chat Window. \n\nThe Chat Window is the actual chat interface where the user can ask questions and get answers. \n\nThe chat customization allows you to change the colors and other attributes of these elements to match your website." +
			"Sure the chat customization is used to change how user interface elements look for integrations and embeds.\n\nTheres 2 primary type of elements, Embed Button and Chat Window. \n\nThe embed button is displayed on your LMS website and allows the user to open and close the Chat Window. \n\nThe Chat Window is the actual chat interface where the user can ask questions and get answers. \n\nThe chat customization allows you to change the colors and other attributes of these elements to match your website.",
		index: 0,
		data: [
			{
				answer: "Sure the chat customization is used to change how user interface elements look for integrations and embeds. Theres 2 primary type of elements, Embed Button and Chat Window. The embed button is displayed on your LMS website and allows the user to open and close the Chat Window. The Chat Window is the actual chat interface where the user can ask questions and get answers. The chat customization allows you to change the colors and other attributes of these elements to match your website.",
				content_id: 0,
				course_id: 0,
				module_id: 0,
				section_id: 0,
				slice_index: 0,
				text: "Some sample source data answer was retrieved from",
			},
			{
				answer: "Here is the second example response",
				content_id: 0,
				course_id: 0,
				module_id: 0,
				section_id: 0,
				slice_index: 0,
				text: "Some sample source data answer was retrieved from",
			},
			{
				answer: "Here is the third example respones",
				content_id: 0,
				course_id: 0,
				module_id: 0,
				section_id: 0,
				slice_index: 0,
				text: "Some sample source data answer was retrieved from",
			},
		],
	},
]
export default function PreviewPanel() {
	const { chatConfig } = readApi()!
	const { c } = writeApi()!

	const [timer, setTimer] = useState(12.56)
	const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
	return (
		<div className="flex-1 flex p-5 justify-around">
			<div className="flex flex-col gap-6 justify-around">
				<div className="flex flex-col gap-2">
					<p className="font-bold">Embed Button States</p>
					<div className="flex flex-col h-fit w-fit gap-3">
						<div className="flex gap-2 items-center">
							<Button state={SessionStates.CHAT_CLOSED} />
							<p>Chat Ready</p>
						</div>
						<div className="flex gap-2 items-center">
							<Button state={SessionStates.CHAT_OPEN} />
							<p>Chat Open</p>
						</div>
						<div className="flex gap-2 items-center">
							<Button state={SessionStates.AUTHORIZING} />
							<p>Authorizing</p>
						</div>
						<div className="flex gap-2 items-center">
							<Button state={SessionStates.SESSION_INVALID} />
							<p>Session Invalid</p>
						</div>
					</div>
				</div>
				<div className="flex flex-col gap-4 w-[300px] items-end">
					<div className="flex gap-2 items-center w-full">
						<p className="font-bold">Embed Prompt</p>
						<span
							className={`py-1 px-2 flex gap-2  rounded-md text-white cursor-pointer bg-violet-500`}
							onClick={() => setTimer((l) => (l > 0 ? 0 : 12.56))}
						>
							{timer > 0 ? "Close" : "Open"}
						</span>
					</div>
					<Prompt timer={timer} />
				</div>
			</div>
			<div className="flex flex-col w-[430px] gap-4 h-[660px]">
				<div className="flex gap-2 items-center w-full">
					<p className="font-bold">Chat View</p>
					<span
						className={`py-1 px-2 flex gap-2  rounded-md text-white cursor-pointer bg-violet-500`}
						onClick={() =>
							setChatHistory((l) => {
								if (l.length != 0) return []
								return [...sampleChat]
							})
						}
					>
						{chatHistory.length == 0
							? "Ask sample question"
							: "Clear Chat"}
					</span>
				</div>
				<Chat
					chatHistory={chatHistory}
					setChatHistory={setChatHistory}
				/>
			</div>
		</div>
	)
}

function Button({ state }: { state: SessionStates }) {
	const { c } = writeApi()!
	const button = {
		[SessionStates.SESSION_INVALID]: (
			<Icon.LockKey
				className="text-red-500 pointer-events-auto"
				width={32}
				height={32}
			/>
		),
		[SessionStates.AUTHORIZING]: (
			<Icon.CircleNotch
				className="text-gray-600 pointer-events-auto animate-spin"
				width={32}
				height={32}
			/>
		),
		[SessionStates.CHAT_CLOSED]: (
			<Icon.ChatDots
				className="text-white pointer-events-auto"
				width={32}
				height={32}
			/>
		),
		[SessionStates.CHAT_OPEN]: (
			<Icon.X
				className="text-white pointer-events-auto"
				width={32}
				height={32}
			/>
		),
	}

	const class_color = {
		[SessionStates.SESSION_INVALID]:
			"bg-red-300 border-red-400 shadow-red-500",
		[SessionStates.AUTHORIZING]:
			"bg-gray-300 border-gray-400 shadow-gray-500",
		[SessionStates.CHAT_CLOSED]:
			c("bg", "300", 1) + c("border", "400", 1) + c("shadow", "500", 1),
		[SessionStates.CHAT_OPEN]:
			c("bg", "300", 1) + c("border", "400", 1) + c("shadow", "500", 1),
	}

	return (
		<motion.div
			className={`cursor-pointer ${class_color[state]} p-3 rounded-xl border-b-4 shadow-sm  active:border-b-0 hover:brightness-90`}
		>
			{button[state]}
		</motion.div>
	)
}

function Prompt({ timer }: { timer: number }) {
	const { c } = writeApi()!
	const parent = {
		visible: { width: 250, opacity: 1, transition: { duration: 1 } },
		hidden: { width: 0, opacity: 0, transition: { duration: 1 } },
	}
	const child = {
		visible: { opacity: 1, transition: { duration: 1, delay: 0.5 } },
		hidden: { opacity: 0, transition: { duration: 1 } },
	}

	return (
		<motion.div
			className={`cursor-pointer ${
				c("bg", "300", 1) +
				c("border", "400", 1) +
				c("shadow", "500", 1)
			} relative h-fit w-fit p-3 rounded-xl border-b-4 shadow-sm  active:border-b-0 hover:brightness-90`}
		>
			<Icon.ChatDots
				className="text-white pointer-events-auto"
				width={32}
				height={32}
			/>

			<motion.div
				initial={{ width: 0, opacity: 0 }}
				animate={timer > 0 ? "visible" : "hidden"}
				variants={parent}
				className={`absolute bottom-0 right-[105%] py-2 px-4 bg-gradient-to-r text-white rounded-3xl rounded-br-none whitespace-nowrap overflow-hidden ${
					c("from", "400", 1) + c("to", "600", 1)
				}`}
			>
				Have a question? Try asking <br /> your personal AI assistant!
				<motion.div
					initial={{ opacity: 0 }}
					variants={child}
					className="absolute bottom-1 right-1 w-6 h-6 -rotate-90"
				>
					<svg
						className="absolute top-0 right-0 fill-white w-6 h-6"
						xmlns="http://www.w3.org/2000/svg"
					>
						<circle
							className="stroke-white"
							id="circle"
							r="5"
							cy="50%"
							cx="50%"
							stroke-width="10"
							fill="none"
							style={{
								strokeDasharray: 31.42,
								strokeDashoffset: timer,
							}}
						/>
					</svg>
					<svg
						className="absolute top-0 right-0 w-6 h-6"
						xmlns="http://www.w3.org/2000/svg"
					>
						<circle
							className="stroke-white/30"
							id="circle"
							r="5"
							cy="50%"
							cx="50%"
							stroke-width="10"
							fill="none"
						/>
					</svg>
				</motion.div>
			</motion.div>
		</motion.div>
	)
}

function Chat({
	chatHistory,
	setChatHistory,
}: {
	chatHistory: ChatHistory[]
	setChatHistory: React.Dispatch<React.SetStateAction<ChatHistory[]>>
}) {
	const { chatConfig } = readApi()!
	const { c } = writeApi()!

	const [isGenerating, setIsGenerating] = useState(false)
	const [selectedCourse, setSelectedCourse] = useState(0)
	function handleSubmit() {
		return
	}
	return (
		<div
			className={`relative flex border-2 ${c(
				"border",
				"300",
				0
			)} flex-1 rounded-md ${c("bg", "100", 0)} pointer-events-auto `}
		>
			<div className="relative flex flex-col flex-[3] h-[660px]">
				{chatHistory.length == 0 && (
					<div className="absolute flex w-full h-full items-center justify-center pointer-events-none">
						<img
							className="grayscale opacity-50 aspect-auto h-14"
							src={
								chatConfig?.logo
									? chatConfig?.logo
									: "/logo_lg.png"
							}
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
					<div
						className={`relative flex w-full p-2 self-center mt-auto ${c(
							"bg",
							"300",
							0
						)}  rounded mb-5 items-center`}
					>
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
			</div>
		</div>
	)
}

function ChatView({
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
	const { c } = writeApi()!
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
				<div
					className={`flex w-full justify-center py-3 ${c(
						"bg",
						"200",
						0
					)} `}
				>
					<div className={`flex gap-4 ${width}`}>
						<div className="flex-none">
							<div
								className={`rounded flex items-center justify-center w-10 h-10 ${c(
									"bg",
									"200",
									1
								)} ${c("text", "700", 1)}`}
							>
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
	const { c } = writeApi()!
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
				chat.author == "bot" ? c("bg", "200", 0) : ""
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
								className={`rounded flex items-center justify-center w-10 h-10 ${c(
									"bg",
									"200",
									1
								)}`}
							>
								<Icon.User
									weight="bold"
									className={`w-6 h-6 ` + c("text", "700", 1)}
								/>
							</div>
						)
					) : (
						<div
							className={`rounded flex items-center justify-center w-10 h-10 ${
								chat.author == "bot"
									? c("bg", "300", 1)
									: "bg-yellow-300"
							}`}
						>
							{chat.author == "bot" ? (
								<Icon.CircleDashed
									weight="bold"
									className={`w-6 h-6 ` + c("text", "700", 1)}
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
								className={`flex gap-1 self-start ${c(
									"text",
									"600",
									1
								)} border-b cursor-pointer hover:${c(
									"border-b",
									"600",
									1
								)}`}
							>
								View Source
							</div>
							<div className="flex gap-1 self-end">
								<Icon.NumberSquareOne
									onClick={() => setAnswer(0)}
									weight="fill"
									className={`w-5 h-5 ${
										answerIndex == 0
											? c("text", "600", 1)
											: "text-gray-400 cursor-pointer"
									}`}
								/>
								<Icon.NumberSquareTwo
									onClick={() => setAnswer(1)}
									weight="fill"
									className={`w-5 h-5 ${
										answerIndex == 1
											? c("text", "600", 1)
											: "text-gray-400 cursor-pointer"
									}`}
								/>
								<Icon.NumberSquareThree
									onClick={() => setAnswer(2)}
									weight="fill"
									className={`w-5 h-5 ${
										answerIndex == 2
											? c("text", "600", 1)
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
								className={`absolute top-4 right-4 border-2 p-2 rounded hover:scale-110  transition-all cursor-pointer flex items-center justify-center text-gray-600 bg-gray-200 border-gray-400 `}
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
									className={`w-full rounded flex items-center justify-between p-2 cursor-pointer ${c(
										"bg",
										"200",
										1
									)} font-bold ${c(
										"text",
										"800",
										1
									)} hover:${c("bg", "200", 1)}`}
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
									className={`w-full rounded flex items-center justify-between p-2 cursor-pointer ${c(
										"bg",
										"200",
										1
									)} font-bold ${c(
										"text",
										"800",
										1
									)} hover:${c("bg", "200", 1)}`}
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
									className={`w-full rounded flex items-center justify-between p-2 cursor-pointer ${c(
										"bg",
										"200",
										1
									)} font-bold ${c(
										"text",
										"800",
										1
									)} hover:${c("bg", "200", 1)}`}
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
									className={`w-full rounded flex items-center justify-between p-2 cursor-pointer ${c(
										"bg",
										"200",
										1
									)} font-bold ${c(
										"text",
										"800",
										1
									)} hover:${c("bg", "200", 1)}`}
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
								className={`absolute top-4 right-4 border-2 p-2 rounded hover:scale-110  transition-all cursor-pointer flex items-center justify-center text-gray-600 bg-gray-200 gray-violet-300 `}
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
										className={`w-full rounded flex items-center justify-between p-2 cursor-pointer ${c(
											"bg",
											"200",
											1
										)} font-bold ${c(
											"text",
											"800",
											1
										)} hover:${c("bg", "200", 1)}`}
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
										className={`w-full rounded flex items-center justify-between p-2 cursor-pointer ${c(
											"bg",
											"200",
											1
										)} font-bold ${c(
											"text",
											"800",
											1
										)} hover:${c("bg", "200", 1)}`}
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
										className={`w-full rounded flex items-center justify-between p-2 cursor-pointer ${c(
											"bg",
											"200",
											1
										)} font-bold ${c(
											"text",
											"800",
											1
										)} hover:${c("bg", "200", 1)}`}
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
										className={`w-full rounded flex items-center justify-between p-2 cursor-pointer ${c(
											"bg",
											"200",
											1
										)} font-bold ${c(
											"text",
											"800",
											1
										)} hover:${c("bg", "200", 1)}`}
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

function ChatInput({
	selectedCourse,
	submit,
	chatHistory,
	clearChat,
}: {
	selectedCourse: number | null
	submit: (query: string) => void
	chatHistory: ChatHistory[]
	clearChat?: () => void
}) {
	console.log(selectedCourse)
	const { c } = writeApi()!
	const courses = [
		{
			id: 0,
			title: "Sample Course",
		},
	]

	//Auto resize text area
	const MIN_TEXTAREA_HEIGHT = 32
	const textareaRef = React.useRef(null)
	const [value, setValue] = React.useState("")

	const onChange = (event: any) => {
		if (event.nativeEvent.inputType === "insertLineBreak") {
			onClick()
			return
		}
		setValue(event.target.value)
	}

	React.useEffect(() => {
		// Reset height - important to shrink on delete
		// @ts-ignore
		textareaRef.current.style.height = "32px"

		// Set height
		// @ts-ignore
		textareaRef.current.style.height = `${Math.max(
			// @ts-ignore
			textareaRef.current.scrollHeight,
			MIN_TEXTAREA_HEIGHT
		)}px`
	}, [value])

	const [isGenerating, setGenerating] = useState(false)
	async function onClick() {
		setGenerating(true)
		await submit(value)
		setValue("")
		setGenerating(false)
	}

	return (
		<>
			<textarea
				onChange={onChange}
				ref={textareaRef}
				style={{
					minHeight: MIN_TEXTAREA_HEIGHT,
					resize: "none",
				}}
				value={value}
				maxLength={250}
				wrap="soft"
				disabled={!selectedCourse}
				className={
					"flex-1 p-2 bg-transparent outline-none focus:ring-2 rounded " +
					c("ring", "600", 1)
				}
				placeholder={
					!courses
						? "Loading Source..."
						: selectedCourse != null
						? `Ask a question about ${
								courses?.find((c) => c.id == selectedCourse)
									?.title
						  }`
						: "Select a course from sidebar"
				}
			/>
			{clearChat && (
				<div
					onClick={clearChat}
					className={`absolute -top-6 left-0 text-sm flex items-center gap-1 cursor-pointer ${
						chatHistory.length > 0
							? "text-red-500"
							: "text-transparent pointer-events-none"
					}`}
				>
					<Icon.Trash
						weight="fill"
						className="w-4 h-4"
					/>
					Clear Chat
				</div>
			)}

			<div
				className={`absolute -bottom-5 right-0 text-sm ${
					value.length > 200 ? "text-red-500" : "text-transparent"
				}`}
			>
				{value.length}/250
			</div>
			<div
				className={`absolute -top-6 right-0 text-sm flex items-center gap-1 ${
					value.length > 0 ? c("text", "500", 1) : "text-transparent"
				}`}
			>
				<Icon.Folders
					weight="fill"
					className="w-4 h-4"
				/>
				{selectedCourse &&
					courses?.find((c) => c.id == selectedCourse)?.title}
			</div>
			{selectedCourse != null ? (
				<>
					{courses && !isGenerating ? (
						<div
							onClick={onClick}
							className={
								"m-2 hover:scale-110  transition-all cursor-pointer flex items-center justify-center " +
								c("text", "600", 1)
							}
						>
							<Icon.PaperPlaneRight
								width={24}
								height={24}
							/>
						</div>
					) : (
						<div
							className={
								"m-2 hover:scale-110  transition-all cursor-wait flex items-center justify-center " +
								c("text", "600", 1)
							}
						>
							<Icon.CircleNotch
								width={24}
								height={24}
								className="animate-spin"
							/>
						</div>
					)}
				</>
			) : (
				<div
					className={
						"m-2 transition-all cursor-not-allowed flex items-center justify-center " +
						c("text", "500", 0)
					}
				>
					<Icon.LockSimple
						width={24}
						height={24}
					/>
				</div>
			)}
		</>
	)
}
