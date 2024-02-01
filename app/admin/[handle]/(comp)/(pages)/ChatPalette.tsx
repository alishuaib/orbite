// UNUSED COMPONENT

// "use client"
// import * as ico from "@phosphor-icons/react"
// import { useState, useRef, useEffect, useLayoutEffect, use } from "react"
// import { useRouter } from "next/navigation"
// import { writeContext, readContext } from "@/app/context"
// import { writeAdminContext, readAdminContext } from "@/app/adminContext"
// import { Course, File, Module } from "@/lib/@schemas"
// import { DefaultExtensionType, FileIcon, defaultStyles } from "react-file-icon"
// interface ChatHistory {
// 	author: "user" | "bot" | "loader"
// 	message: string
// 	data: any[]
// }

// export function ChatPalette() {
// 	const { handle, courses, modules, files } = readAdminContext()!
// 	//Content Variables

// 	const askOrbot = writeContext()?.askOrbot!

// 	const [isVisible, setVisible] = useState(false)

// 	const [chatCourse, setChatCourse] = useState<string | undefined>(undefined)
// 	const [chatModule, setChatModule] = useState<string | undefined>(undefined)

// 	const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
// 	const [chatLoading, setChatLoading] = useState(false)
// 	const chatInputRef = useRef<HTMLInputElement>(null)
// 	async function requestQuery() {
// 		if (
// 			chatInputRef.current?.value &&
// 			chatInputRef.current?.value != "" &&
// 			!chatLoading
// 		) {
// 			const query =
// 				chatInputRef.current?.value.substring(
// 					0,
// 					chatCourseLoc.current[0]
// 				) +
// 				chatInputRef.current?.value.substring(
// 					chatCourseLoc.current[1] ? chatCourseLoc.current[1] : 0
// 				)
// 			console.log(query)
// 			setChatHistory([
// 				{
// 					author: "user",
// 					message: query,
// 					data: [
// 						chatInputRef.current?.value.substring(
// 							chatCourseLoc.current[0],
// 							chatCourseLoc.current[1]
// 						),
// 					],
// 				},
// 				{
// 					author: "loader",
// 					message: "",
// 					data: [],
// 				},
// 			])
// 			setChatLoading(true)
// 			const response = await askOrbot(
// 				handle,
// 				query,
// 				chatCourse,
// 				chatModule
// 			)
// 			let data = response.content.map((c: any) => c.file_id)
// 			let distances = response.content.map((c: any) => c.score)
// 			let mList = Object.values(modules)
// 				.map((lst) => lst.map((i) => i))
// 				.flat()
// 			let fList = Object.values(files)
// 				.map((lst) => lst.map((i) => i))
// 				.flat()
// 			let find = data.map((file_ref: any, idx: number) => {
// 				let file = fList.filter((f) => f._ref == file_ref).pop()
// 				let moduledb = mList
// 					.filter((m) => m._ref == file?._module)
// 					.pop()
// 				let course = courses
// 					?.filter((c) => c._ref == moduledb?._course)
// 					.pop()

// 				return {
// 					course: course,
// 					module: moduledb,
// 					file: file,
// 					distance: `${distances[idx].toFixed(4) * 100}%`,
// 				}
// 			})
// 			console.log(find)
// 			setChatHistory([
// 				{
// 					author: "user",
// 					message: query,
// 					data: [
// 						chatInputRef.current?.value.substring(
// 							chatCourseLoc.current[0],
// 							chatCourseLoc.current[1]
// 						),
// 					],
// 				},
// 				{
// 					author: "bot",
// 					message: response.chat.message,
// 					data: find,
// 				},
// 			])
// 			;(chatInputRef.current as HTMLInputElement).value = ""
// 			setChatInputHTML("")
// 			setChatLoading(false)
// 			//Request Server to query vector database for closest document matches
// 			//Then add to chat history to display in chat window
// 		}
// 	}

// 	const [chatInputHTML, setChatInputHTML] = useState("")
// 	const chatCourseLoc = useRef<[number, number | undefined]>([0, undefined])
// 	function parseCourse(currentValue: string) {
// 		setChatInputHTML("<p>" + currentValue + "</p>")
// 		const value = currentValue.replace("?", " ")
// 		let keywordIdx = value.split(" ").indexOf("in")
// 		if (keywordIdx == -1) return setChatCourse(undefined)

// 		let keywordProspects = value
// 			.trim()
// 			.split(" ")
// 			.slice(keywordIdx + 1)

// 		if (keywordProspects?.length == 0 || !keywordProspects)
// 			return setChatCourse(undefined)

// 		let found: Course[] = []
// 		let keyword: string = ""

// 		let holder: string[] = []
// 		keywordProspects.forEach((k) => {
// 			holder.push(k)
// 			let course = courses?.filter((t) =>
// 				t.title.toLowerCase().includes(holder.join(" ").toLowerCase())
// 			)
// 			console.log(holder, course)
// 			if (course && course?.length > 0) {
// 				found = course
// 				keyword = holder.join(" ")
// 			}
// 		})

// 		if (keyword == "") return setChatCourse(undefined)

// 		let startLoc = value.lastIndexOf(" in ") + 1
// 		let endLoc = startLoc + keyword.length + 4

// 		let highlighted =
// 			"<p>" +
// 			currentValue.substring(0, startLoc) +
// 			`<mark class="text-violet-300 bg-transparent" >` +
// 			currentValue.substring(startLoc, endLoc) +
// 			"</mark>" +
// 			currentValue.substring(endLoc) +
// 			"</p>"

// 		chatCourseLoc.current = [startLoc, endLoc]
// 		setChatInputHTML(highlighted)
// 		setChatCourse(found[0]._ref)
// 	}

// 	function handleCommandKey(e: KeyboardEvent) {
// 		if (e.ctrlKey && e.key == "k") {
// 			e.preventDefault()
// 			setVisible((l) => !l)
// 		}
// 		if (e.key == "Escape") {
// 			setVisible(false)
// 		}
// 	}

// 	useEffect(() => {
// 		if (isVisible) chatInputRef.current?.focus()
// 		if (!isVisible) {
// 			setChatInputHTML("")
// 			;(chatInputRef.current as HTMLInputElement).value = ""
// 		}
// 	}, [isVisible])

// 	useEffect(() => {
// 		document.addEventListener("keydown", handleCommandKey)

// 		return () => {
// 			document.removeEventListener("keydown", handleCommandKey)
// 		}
// 	}, [])

// 	return (
// 		<div
// 			className={`${
// 				isVisible
// 					? "opacity-100"
// 					: "opacity-0 pointer-events-none select-none"
// 			} absolute top-0 left-0 h-screen w-screen bg-zinc-900/40 backdrop-blur-sm flex flex-col justify-start z-50 transition-all text-zinc-100`}
// 		>
// 			<div className="pt-24 flex flex-col items-center justify-center gap-1">
// 				<div className="w-1/2 max-w-[550px] flex gap-2 text-xs text-zinc-800  items-center">
// 					<p className="flex-1">
// 						<code
// 							className="bg-zinc-800 text-zinc-300 p-1 rounded-sm font-bold cursor-pointer"
// 							onClick={() => {
// 								setVisible(false)
// 							}}
// 						>
// 							ESC
// 						</code>{" "}
// 						to close chat palette
// 					</p>
// 				</div>
// 				<div className="w-1/2 max-w-[550px] flex flex-none flex-col p-2 gap-1 bg-zinc-800 rounded-md">
// 					<div className="w-full flex flex-none h-fit">
// 						<div className="relative w-full flex bg-zinc-700 rounded-l-md">
// 							<div
// 								className="absolute flex items-center w-full h-full rounded-md bg-transparent pointer-events-none select-none outline-none text-zinc-100 px-2"
// 								dangerouslySetInnerHTML={{
// 									__html: chatInputHTML,
// 								}}
// 							></div>
// 							<input
// 								ref={chatInputRef}
// 								className="caret-white flex-1 h-full rounded-md bg-transparent px-2 outline-none placeholder:text-zinc-500 text-zinc-700"
// 								type="text"
// 								placeholder="Ask a question..."
// 								onChange={(e) => parseCourse(e.target.value)}
// 								onKeyDown={async (e) => {
// 									if (e.key == "Enter") requestQuery()
// 								}}
// 							/>
// 						</div>
// 						<div
// 							className="flex items-center justify-center h-10 w-12 bg-zinc-700 rounded-r-md transition-all cursor-pointer hover:bg-zinc-600"
// 							onClick={requestQuery}
// 						>
// 							{chatLoading ? (
// 								<ico.CircleNotch className="fill-zinc-100 w-6 h-6 animate-spin" />
// 							) : (
// 								<ico.KeyReturn className="fill-zinc-100 w-6 h-6" />
// 							)}
// 						</div>
// 					</div>
// 					<div className="flex flex-none h-fit flex-col gap-2 w-full text-xs">
// 						<div className="flex items-center gap-2">
// 							<div className="flex flex-1 items-center justify-center gap-2 text-zinc-300">
// 								<p className="py-1">Asking about: </p>
// 								<select
// 									className={
// 										(!chatCourse
// 											? "text-zinc-500"
// 											: "text-violet-300") +
// 										"  rounded-md bg-zinc-800 p-1 hover:ring-2 hover:ring-zinc-300 cursor-pointer"
// 									}
// 									name="course"
// 									id="course"
// 									onChange={(e) =>
// 										setChatCourse(e.target.value)
// 									}
// 								>
// 									<option
// 										defaultValue=""
// 										selected={!chatCourse}
// 										disabled
// 										className="text-zinc-500 italic"
// 									>
// 										{`(Use "in" to specify course)`}
// 									</option>
// 									{courses?.map((course) => {
// 										return (
// 											<option
// 												key={course._ref}
// 												defaultValue={course._ref}
// 												className="text-zinc-100"
// 												selected={
// 													chatCourse == course._ref
// 												}
// 											>
// 												{course.title}
// 											</option>
// 										)
// 									})}
// 								</select>
// 							</div>
// 						</div>
// 					</div>
// 					<div className="w-full h-fit flex-col flex p-2 transition-all">
// 						<div className="flex flex-none h-fit flex-col w-full overflow-y-auto gap-2 text-sm  transition-all">
// 							{chatHistory.map((item, idx) => {
// 								if (item.author == "loader") {
// 									return (
// 										<div
// 											key={idx}
// 											className="flex flex-col h-fit w-full "
// 										>
// 											<div className="flex flex-col w-full gap-2">
// 												<div className="flex items-center gap-1 h-fit ">
// 													<div className="rounded-sm flex-none h-full w-fit bg-violet-100">
// 														<div className="h-fit w-fit p-2 rounded-sm flex items-center bg-violet-200">
// 															<ico.CircleDashed className="fill-violet-600 h-6 w-6" />
// 														</div>
// 													</div>
// 													<div className="p-2 whitespace-normal flex gap-2 flex-1">
// 														<div className="h-2 w-2 rounded-full bg-gray-500 animate-pulse" />
// 														<div className="h-2 w-2 rounded-full bg-gray-500 animate-pulse" />
// 														<div className="h-2 w-2 rounded-full bg-gray-500 animate-pulse" />
// 													</div>
// 												</div>
// 												<ChatModule
// 													key={idx}
// 													item={item}
// 													handle={handle}
// 												/>
// 											</div>
// 										</div>
// 									)
// 								} else if (item.author == "bot") {
// 									return (
// 										<div
// 											key={idx}
// 											className="flex flex-col h-fit w-full "
// 										>
// 											<div className="flex flex-col w-full gap-2 max-w-sm">
// 												<div className="flex items-center gap-1 h-fit  ">
// 													<div className="rounded-sm flex-none h-full w-fit bg-violet-100">
// 														<div className="h-fit w-fit p-2 rounded-sm flex items-center bg-violet-200">
// 															<ico.CircleDashed className="fill-violet-600 h-6 w-6" />
// 														</div>
// 													</div>
// 													<div className="overflow-y-auto max-h-40 flex-1">
// 														<p className="p-2 whitespace-normal flex-1">
// 															{item.message}
// 														</p>
// 													</div>
// 												</div>
// 												<ChatModule
// 													key={idx}
// 													item={item}
// 													handle={handle}
// 												/>
// 											</div>
// 										</div>
// 									)
// 								} else {
// 									return (
// 										<div
// 											key={idx}
// 											className="flex flex-col items-end gap-1  h-fit w-full justify-end "
// 										>
// 											<div className="flex max-w-sm w-fit bg-zinc-950 rounded-sm">
// 												<p className="p-2 whitespace-normal flex-1">
// 													{item.message}
// 												</p>
// 												<div className="rounded-sm flex-none h-full w-fit bg-indigo-100">
// 													<div className="h-fit w-fit p-2 rounded-sm flex items-center bg-indigo-200">
// 														<ico.User className="fill-indigo-600 h-6 w-6" />
// 													</div>
// 												</div>
// 											</div>
// 											<p className="italic text-xs text-violet-300">
// 												{item.data}
// 											</p>
// 										</div>
// 									)
// 								}
// 							})}
// 						</div>
// 					</div>
// 				</div>
// 			</div>
// 		</div>
// 	)
// }

// function ChatModule(props: { item: ChatHistory; handle: string }) {
// 	const [chatPage, setChatPage] = useState<number>(0)
// 	const { selectedFile } = readAdminContext()!

// 	const { setSelectedFile } = writeAdminContext()!
// 	const { item, handle } = props

// 	function changePage(next: boolean) {
// 		console.log(chatPage)
// 		if (next) {
// 			if (chatPage < item.data.length) {
// 				setChatPage(chatPage + 1)
// 			}
// 		} else {
// 			if (chatPage > 0) {
// 				setChatPage(chatPage - 1)
// 			}
// 		}
// 	}
// 	return (
// 		<div className="h-fit w-full flex flex-col">
// 			{item.data?.map((d, idx) => {
// 				if (!(idx == chatPage)) return
// 				return (
// 					<div
// 						key={idx}
// 						className="flex w-full h-fit"
// 					>
// 						<div
// 							key={d.module._ref}
// 							className=" bg-zinc-950 flex flex-col w-4/5 h-fit rounded-sm items-center hover:bg-zinc-700 transition-all group  cursor-pointer"
// 							onClick={
// 								() =>
// 									setSelectedFile(
// 										selectedFile == d.file._ref
// 											? ""
// 											: d.file._ref
// 									)
// 								// open(
// 								// 	`${window.location.origin}/hub/${handle}/${d.course.slug}/${d.module.slug}`
// 								// )
// 							}
// 						>
// 							<div className="flex w-full h-36 relative items-end">
// 								<div className="z-10 flex flex-col flex-1  h-full justify-end p-2">
// 									<h2 className="text-xl">
// 										{d.module.title}
// 									</h2>
// 									<p>{d.course.title}</p>
// 									<p className="text-xs italic text-zinc-400">
// 										{d.file.name}
// 									</p>
// 									{/* <p className="text-xs whitespace-pre-wrap">{`Course: ${d.course.title}\nDuration: ${d.module.duration} Min\nContent: ${d.file.name}`}</p> */}
// 								</div>
// 								<div className="z-10 flex flex-col h-fit w-fit group-hover:scale-125 transition-all justify-end p-2">
// 									<ico.ArrowRight
// 										width={34}
// 										height={34}
// 									/>
// 								</div>

// 								<div className="w-full h-full absolute overflow-hidden z-0 after:h-full after:w-full after:absolute after:bg-gradient-to-tr after:from-zinc-950 after:transition-all group-hover:after:from-zinc-700 after:from-55%">
// 									<img
// 										className="absolute -right-1 -top-1 aspect-auto w-24 opacity-100 -z-10"
// 										src={`/${d.course.icon}`}
// 										alt=""
// 									/>
// 								</div>
// 							</div>
// 						</div>

// 						<div
// 							className={`h-full flex-1  flex flex-col justify-center items-center gap-2 `}
// 						>
// 							<div
// 								className={`${
// 									chatPage == item.data.length - 1
// 										? "opacity-30"
// 										: "hover:bg-zinc-700 cursor-pointer"
// 								} h-10 w-10 rounded-full bg-zinc-950 p-2   transition-all`}
// 								onClick={() => changePage(true)}
// 							>
// 								<ico.CaretRight className="w-full h-full" />
// 							</div>
// 							<div className="h-fit w-fit flex flex-col justify-center gap-1">
// 								{item.data.map((i, n) => {
// 									return (
// 										<div
// 											key={n}
// 											className={`rounded-full h-2 w-2 ${
// 												n == chatPage
// 													? "bg-zinc-300"
// 													: "bg-zinc-600"
// 											}`}
// 											onClick={() => {
// 												setChatPage(n)
// 											}}
// 										/>
// 									)
// 								})}
// 							</div>
// 							<div
// 								className={`${
// 									chatPage == 0
// 										? "opacity-30"
// 										: "hover:bg-zinc-700 cursor-pointer"
// 								} h-10 w-10 rounded-full bg-zinc-950 p-2   transition-all`}
// 								onClick={() => changePage(false)}
// 							>
// 								<ico.CaretLeft className="w-full h-full" />
// 							</div>
// 						</div>
// 					</div>
// 				)
// 			})}
// 		</div>
// 	)
// }
