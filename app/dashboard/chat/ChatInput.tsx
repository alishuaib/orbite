"use client"
import React, {
	MouseEventHandler,
	ChangeEventHandler,
	ReactElement,
	cloneElement,
	useEffect,
	useState,
} from "react"
import { useRouter } from "next/navigation"
import { readApi, writeApi } from "@/app/_context/api"
import * as Icon from "@phosphor-icons/react"
import { ChatHistory } from "./page"
export default function ChatInput({
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
	const courses = readApi()?.courses

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
				className="flex-1 p-2 bg-transparent outline-none focus:ring-2 ring-violet-600 rounded"
				placeholder={
					!courses
						? "Loading Source..."
						: selectedCourse
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
					value.length > 0 ? "text-violet-500" : "text-transparent"
				}`}
			>
				<Icon.Folders
					weight="fill"
					className="w-4 h-4"
				/>
				{selectedCourse &&
					courses?.find((c) => c.id == selectedCourse)?.title}
			</div>
			{selectedCourse ? (
				<>
					{courses && !isGenerating ? (
						<div
							onClick={onClick}
							className="m-2 hover:scale-110  transition-all cursor-pointer flex items-center justify-center text-violet-600"
						>
							<Icon.PaperPlaneRight
								width={24}
								height={24}
							/>
						</div>
					) : (
						<div className="m-2 hover:scale-110  transition-all cursor-wait flex items-center justify-center text-violet-600">
							<Icon.CircleNotch
								width={24}
								height={24}
								className="animate-spin"
							/>
						</div>
					)}
				</>
			) : (
				<div className="m-2 transition-all cursor-not-allowed flex items-center justify-center text-gray-500">
					<Icon.LockSimple
						width={24}
						height={24}
					/>
				</div>
			)}
		</>
	)
}
