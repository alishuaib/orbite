"use client"
import * as ico from "@phosphor-icons/react"
import { useState, useRef, useEffect, useLayoutEffect, use } from "react"
import { useRouter } from "next/navigation"
import { writeContext, readContext } from "@/app/context"
import { writeAdminContext, readAdminContext } from "@/app/adminContext"
import { Course, File, Module } from "@/lib/@schemas"
import { DefaultExtensionType, FileIcon, defaultStyles } from "react-file-icon"
import { on } from "events"
interface ChatHistory {
	author: "user" | "bot" | "loader"
	message: string
	data: any[]
}
export default function ChatPage() {
	const { handle, courses, modules, files } = readAdminContext()!
	//Content Variables

	const askOrbot = writeContext()?.askOrbot!

	const [chatCourse, setChatCourse] = useState<string | undefined>(undefined)
	const [chatModule, setChatModule] = useState<string | undefined>(undefined)

	const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
	const [chatLoading, setChatLoading] = useState(false)
	const chatInputRef = useRef<HTMLInputElement>(null)
	const askOrbotResponse = useRef<any>(null)
	async function requestQuery() {
		if (
			chatInputRef.current?.value &&
			chatInputRef.current?.value != "" &&
			!chatLoading
		) {
			const query = postParsed.current
			console.log(query)
			setChatHistory([
				{
					author: "user",
					message: query,
					data:
						courses
							?.filter((c) => c._ref == chatCourse)
							?.map((i) => "Query in " + i.title.toLowerCase()) ||
						[],
				},
				{
					author: "loader",
					message: "",
					data: [],
				},
			])
			setChatLoading(true)
			const response = await askOrbot(
				handle,
				query,
				chatCourse,
				chatModule
			)
			let data = response.content.map((c: any) => c.file_id)
			let distances = response.content.map((c: any) => c.score)
			let mList = Object.values(modules)
				.map((lst) => lst.map((i) => i))
				.flat()
			let fList = Object.values(files)
				.map((lst) => lst.map((i) => i))
				.flat()
			let find = data.map((file_ref: any, idx: number) => {
				let file = fList.filter((f) => f._ref == file_ref).pop()
				let mod = mList.filter((m) => m._ref == file?._module).pop()
				let course = courses
					?.filter((c) => c._ref == mod?._course)
					.pop()

				return {
					course: course,
					module: mod,
					file: file,
					distance: `${(distances[idx] * 100).toFixed(2)}%`,
					validation: `${(
						response.chat.validation[idx] * 100
					).toFixed(2)}%`,
					sliceIdx: response.content[idx].slice_index,
				}
			})
			console.log(find)
			setChatHistory([
				{
					author: "user",
					message: query,
					data:
						courses
							?.filter((c) => c._ref == chatCourse)
							?.map((i) => "Query in " + i.title.toLowerCase()) ||
						[],
				},
				{
					author: "bot",
					message: response.chat.message,
					data: find,
				},
			])
			;(chatInputRef.current as HTMLInputElement).value = ""
			setChatInputHTML("")
			setChatLoading(false)
			askOrbotResponse.current = response
			//Request Server to query vector database for closest document matches
			//Then add to chat history to display in chat window
		}
	}

	const [chatInputHTML, setChatInputHTML] = useState("")
	const postParsed = useRef<string>("")
	const [useManualMode, setUseManualMode] = useState(false)
	const chatCourseLoc = useRef<[number, number | undefined]>([0, undefined])
	useEffect(() => {
		parseCourse(chatInputRef.current?.value as string)
	}, [useManualMode])
	function parseCourse(currentValue: string) {
		setChatInputHTML("<p>" + currentValue + "</p>")
		postParsed.current = currentValue
		if (useManualMode) {
			return
		}
		const value = currentValue.replace("?", " ")
		let keywordIdx = value.split(" ").indexOf("in")
		if (keywordIdx == -1) return setChatCourse(undefined)

		let keywordProspects = value
			.trim()
			.split(" ")
			.slice(keywordIdx + 1)

		if (keywordProspects?.length == 0 || !keywordProspects)
			return setChatCourse(undefined)

		let found: Course[] = []
		let keyword: string = ""

		let holder: string[] = []
		keywordProspects.forEach((k) => {
			holder.push(k)
			let course = courses?.filter((t) =>
				t.title.toLowerCase().includes(holder.join(" ").toLowerCase())
			)
			// console.log(holder, course)
			if (course && course?.length > 0) {
				found = course
				keyword = holder.join(" ")
			}
		})

		if (keyword == "") return setChatCourse(undefined)
		console.log(
			found[0].title,
			keyword,
			found[0].title.replace(new RegExp(keyword, "i"), "")
		)

		let startLoc = value.lastIndexOf(" in ") + 1
		let endLoc = startLoc + keyword.length + 4

		let highlighted =
			"<p>" +
			currentValue.substring(0, startLoc) +
			`<mark class="text-violet-300 bg-transparent" >` +
			currentValue.substring(startLoc, endLoc) +
			"</mark>" +
			`<mark class="text-zinc-500 bg-transparent" >` +
			found[0].title.replace(new RegExp(keyword, "i"), "") +
			" " +
			"</mark>" +
			currentValue.substring(endLoc) +
			"</p>"
		postParsed.current =
			currentValue.substring(0, startLoc) +
			currentValue.substring(startLoc, endLoc) +
			found[0].title.replace(new RegExp(keyword, "i"), "") +
			" " +
			currentValue.substring(endLoc)
		chatCourseLoc.current = [startLoc, endLoc]
		setChatInputHTML(highlighted)
		setChatCourse(found[0]._ref)
	}
	return (
		<div className="w-full h-screen flex flex-col">
			<div className="border-zinc-500 border-b flex-none items-center w-full p-2 h-16 text-2xl flex justify-end gap-2">
				<h2 className="flex-1">Chat Simulation</h2>
				<div
					className="bg-zinc-500 p-2 rounded-md hover:bg-zinc-400 hover:scale-105 active:scale-95 transition-all cursor-pointer flex text-base gap-2"
					onClick={() => {
						setChatHistory([])
					}}
				>
					<ico.Eraser
						size={20}
						weight="duotone"
					/>
				</div>
			</div>
			<div className="w-full h-[calc(100vh-12rem)] flex-col flex p-2">
				<div className="flex flex-none h-[calc(100vh-12rem)] flex-col w-full overflow-y-auto gap-2 text-sm">
					{chatHistory.map((item, idx) => {
						if (item.author == "loader") {
							return (
								<div
									key={idx}
									className="flex flex-col h-fit w-full "
								>
									<div className="flex flex-col w-full gap-2">
										<div className="flex items-center gap-1 h-fit ">
											<div className="rounded-sm flex-none h-full w-fit bg-violet-100">
												<div className="h-fit w-fit p-2 rounded-sm flex items-center bg-violet-200">
													<ico.CircleDashed className="fill-violet-600 h-6 w-6" />
												</div>
											</div>
											<div className="p-2 whitespace-normal flex gap-2 flex-1">
												<div className="h-2 w-2 rounded-full bg-gray-500 animate-pulse" />
												<div className="h-2 w-2 rounded-full bg-gray-500 animate-pulse" />
												<div className="h-2 w-2 rounded-full bg-gray-500 animate-pulse" />
											</div>
										</div>
									</div>
								</div>
							)
						} else if (item.author == "bot") {
							return (
								<div
									key={idx}
									className="flex flex-col h-fit w-full "
								>
									<div className="flex flex-col w-full gap-2">
										<div className="flex items-center gap-1 h-fit w-4/5">
											<div className="rounded-sm flex-none h-full w-fit bg-violet-100">
												<div className="h-fit w-fit p-2 rounded-sm flex items-center bg-violet-200">
													<ico.CircleDashed className="fill-violet-600 h-6 w-6" />
												</div>
											</div>
											<div className="overflow-y-auto max-h-80 flex-1">
												<p className="p-2 whitespace-pre-wrap flex-1">
													{item.message}
												</p>
											</div>
										</div>
										<ChatModule
											key={idx}
											item={item}
											handle={handle}
										/>
									</div>
								</div>
							)
						} else {
							return (
								<div
									key={idx}
									className="flex flex-col items-end gap-1  h-fit w-full justify-end  "
								>
									<div className="flex w-4/5 bg-zinc-950 rounded-sm">
										<p className="p-2 whitespace-normal flex-1">
											{item.message}
										</p>
										<div className="rounded-sm flex-none p-2 h-full w-fit bg-indigo-200">
											<ico.User className="fill-indigo-600 h-6 w-6" />
										</div>
									</div>
									<p className="italic text-xs text-violet-300">
										{item.data}
									</p>
								</div>
							)
						}
					})}
				</div>
			</div>
			<div className="flex flex-none flex-col p-2 gap-1 h-32">
				<div className="flex flex-none h-fit flex-col gap-2 w-full text-sm">
					<div className="flex items-center gap-2">
						<div className="bg-zinc-700 rounded-md p-1">
							<ico.LightbulbFilament
								size={"1.25rem"}
								className=" fill-zinc-100"
							/>
						</div>
						<div className="flex flex-1 items-center gap-2">
							<p className="">Asking about: </p>
							<select
								className={
									(!chatCourse
										? "italic text-zinc-500"
										: "text-violet-300") +
									" flex-1 rounded-md bg-zinc-800 p-1 hover:ring-2 hover:ring-zinc-300 cursor-pointer"
								}
								name="course"
								id="course"
								onChange={(e) => {
									if (e.target.value == "") {
										setUseManualMode(false)
										setChatCourse(undefined)
										return
									}
									setUseManualMode(true)
									setChatCourse(e.target.value)
								}}
							>
								<option
									value=""
									selected={!chatCourse}
									className="text-zinc-500 italic"
								>
									{`(Use "in" to specify course)`}
								</option>
								{courses?.map((course) => {
									return (
										<option
											key={course._ref}
											value={course._ref}
											className="text-zinc-100"
											selected={chatCourse == course._ref}
										>
											{course.title}
										</option>
									)
								})}
							</select>
						</div>
					</div>
				</div>
				<div className="w-full flex flex-none h-fit gap-2">
					<div className="relative w-full flex bg-zinc-700 rounded-md">
						<div
							className="absolute flex items-center w-full h-full rounded-md bg-transparent pointer-events-none select-none outline-none text-zinc-100 px-2"
							dangerouslySetInnerHTML={{ __html: chatInputHTML }}
						></div>
						<input
							ref={chatInputRef}
							className="whitespace-pre-wrap caret-white flex-1 h-full rounded-md bg-transparent px-2 outline-none placeholder:text-zinc-500 text-zinc-700"
							type="text"
							placeholder="Ask a question..."
							onChange={(e) => parseCourse(e.target.value)}
							onKeyDown={async (e) => {
								if (e.key == "Enter") requestQuery()
							}}
						/>
					</div>
					<div
						className="flex items-center justify-center h-10 w-12 bg-zinc-950 rounded-md transition-all cursor-pointer hover:scale-95"
						onClick={requestQuery}
					>
						<ico.PaperPlaneTilt className="fill-zinc-100 w-6 h-6" />
					</div>
				</div>
				<div className="flex items-center gap-2 text-xs text-zinc-500 italic">
					<p>
						<code>Ctrl+K</code> for chat palette
					</p>
				</div>
			</div>
		</div>
	)
}

function ChatModule(props: { item: ChatHistory; handle: string }) {
	const [chatPage, setChatPage] = useState<number>(0)
	const { selectedFile, selectedFileData } = readAdminContext()!

	const { setSelectedFile, setHighlight } = writeAdminContext()!
	const { item, handle } = props

	function changePage(next: boolean) {
		if (next) {
			if (chatPage < item.data.length) {
				setChatPage(chatPage + 1)
			}
		} else {
			if (chatPage > 0) {
				setChatPage(chatPage - 1)
			}
		}
	}

	function onClickEvent(d: any) {
		if (
			selectedFile == d.file._ref && //If clicked file is same
			item.data[chatPage].sliceIdx != selectedFileData?.highlight //And highlighted slice is different
		) {
			//Change highlight without changing file reference
			setHighlight(item.data[chatPage].sliceIdx)
		} else {
			setSelectedFile(selectedFile == d.file._ref ? "" : d.file._ref)
			setHighlight(item.data[chatPage].sliceIdx)
		}
		// console.log(item.data[chatPage].sliceIdx)
	}

	return (
		<div className="h-fit w-full flex flex-col">
			{item.data?.map((d, idx) => {
				if (!(idx == chatPage)) return
				return (
					<div
						key={d.module._ref}
						className="flex flex-col w-full h-fit"
					>
						<div className="flex w-full h-fit">
							<div
								className=" bg-zinc-950 flex flex-col w-4/5 h-fit rounded-sm items-center hover:bg-zinc-700 transition-all group  cursor-pointer"
								onClick={() => onClickEvent(d)}
							>
								<div className="flex w-full h-36 relative items-end">
									<div className="z-10 flex flex-col flex-1  h-full justify-end p-2">
										<h2 className="text-xl">
											{d.module.title}
										</h2>
										<p>{d.course.title}</p>
										<p className="text-xs italic text-zinc-400">
											{d.file.name}
										</p>
										{/* <p className="text-xs whitespace-pre-wrap">{`Course: ${d.course.title}\nDuration: ${d.module.duration} Min\nContent: ${d.file.name}`}</p> */}
									</div>
									<div className="z-10 flex flex-col h-fit w-fit group-hover:scale-125 transition-all justify-end p-2">
										<ico.ArrowRight
											width={34}
											height={34}
										/>
									</div>

									<div className="w-full h-full absolute overflow-hidden z-0 after:h-full after:w-full after:absolute after:bg-gradient-to-tr after:from-zinc-950 after:transition-all group-hover:after:from-zinc-700 after:from-55%">
										<img
											className="absolute -right-1 -top-1 aspect-auto w-24 opacity-100 -z-10"
											src={`/${d.course.icon}`}
											alt=""
										/>
									</div>
								</div>
							</div>

							<div
								className={`h-full flex-1  flex flex-col justify-center items-center gap-2 `}
							>
								<div
									className={`${
										chatPage == item.data.length - 1
											? "opacity-30"
											: "hover:bg-zinc-700 cursor-pointer"
									} h-10 w-10 rounded-full bg-zinc-950 p-2   transition-all`}
									onClick={() => changePage(true)}
								>
									<ico.CaretRight className="w-full h-full" />
								</div>
								<div className="h-fit w-fit flex flex-col justify-center gap-1">
									{item.data.map((i, n) => {
										return (
											<div
												key={n}
												className={`rounded-full h-2 w-2 ${
													n == chatPage
														? "bg-zinc-300"
														: "bg-zinc-600"
												}`}
												onClick={() => {
													setChatPage(n)
												}}
											/>
										)
									})}
								</div>
								<div
									className={`${
										chatPage == 0
											? "opacity-30"
											: "hover:bg-zinc-700 cursor-pointer"
									} h-10 w-10 rounded-full bg-zinc-950 p-2   transition-all`}
									onClick={() => changePage(false)}
								>
									<ico.CaretLeft className="w-full h-full" />
								</div>
							</div>
						</div>
						<div className="flex w-full h-fit gap-2">
							<p className="italic text-xs text-zinc-300">
								Vector Similarity:
							</p>
							<p className="italic text-xs text-violet-300">
								Source: {d.distance}
							</p>
							<p className="italic text-xs text-violet-300">
								Response: {d.validation}
							</p>
						</div>
					</div>
				)
			})}
		</div>
	)
}
