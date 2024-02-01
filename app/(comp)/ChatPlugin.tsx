// UNUSED COMPONENT

"use client"
import * as ico from "@phosphor-icons/react"
import { useState, useRef, useEffect, useLayoutEffect, use } from "react"
import { useRouter, usePathname } from "next/navigation"
import { writeApi, readApi } from "@/app/_context/api"
import { writeAdminContext, readAdminContext } from "@/app/adminContext"
import { Course, Module } from "@/lib/@schemas"
import { DefaultExtensionType, FileIcon, defaultStyles } from "react-file-icon"
import { on } from "events"
interface ChatHistory {
	author: "user" | "bot" | "loader"
	message: string
	data: any[]
}

// export default function ChatPlugin() {
// 	const { handle } = readAdminContext()!
// 	const [isOpen, setOpen] = useState(false)
// 	const [isActive, setActive] = useState(false)
// 	const pathname = usePathname()

// 	useEffect(() => {
// 		const url = `${pathname}`
// 		console.log(url, "/hub/" + handle)
// 		if (url.startsWith("/hub/" + handle + "/")) {
// 			setActive(true)
// 		} else {
// 			setActive(false)
// 		}
// 		setOpen(false)
// 	}, [pathname, handle])
// 	return (
// 		<div
// 			className="absolute top-0 h-screen w-1/4 bg-zinc-800 flex flex-col gap-2 transition-all z-50 text-zinc-100 border-zinc-500 border-l-2"
// 			style={{
// 				right: isOpen ? "0" : "-25%",
// 				filter: isActive ? "grayScale(0)" : "grayScale(1)",
// 			}}
// 		>
// 			<div
// 				className={
// 					"absolute bottom-7 -left-12 bg-zinc-800 border-2 border-zinc-500 border-r-0 p-2 rounded-l-md w-12 h-20 items-center flex hover:bg-zinc-700 " +
// 					(!isActive ? "hover:bg-zinc-800" : "")
// 				}
// 				onClick={() => setOpen(!isOpen)}
// 				style={{
// 					cursor: isActive ? "pointer" : "not-allowed",
// 				}}
// 			>
// 				<svg
// 					xmlns="http://www.w3.org/2000/svg"
// 					width="32"
// 					height="32"
// 					viewBox="0 0 256 256"
// 				>
// 					<defs>
// 						<linearGradient
// 							id="0"
// 							x1="0.25"
// 							y1="0.07"
// 							x2="0.75"
// 							y2="0.93"
// 						>
// 							<stop
// 								offset="0%"
// 								stopColor="#a1d0ec"
// 							/>
// 							<stop
// 								offset="3.14%"
// 								stopColor="#9dcaed"
// 							/>
// 							<stop
// 								offset="6.29%"
// 								stopColor="#9bc4ee"
// 							/>
// 							<stop
// 								offset="9.43%"
// 								stopColor="#99beef"
// 							/>
// 							<stop
// 								offset="12.57%"
// 								stopColor="#9ab7f1"
// 							/>
// 							<stop
// 								offset="15.71%"
// 								stopColor="#9cb0f3"
// 							/>
// 							<stop
// 								offset="22%"
// 								stopColor="#a79ef9"
// 							/>
// 							<stop
// 								offset="26.29%"
// 								stopColor="#a99bf9"
// 							/>
// 							<stop
// 								offset="30.57%"
// 								stopColor="#ab97f8"
// 							/>
// 							<stop
// 								offset="34.86%"
// 								stopColor="#ad94f8"
// 							/>
// 							<stop
// 								offset="39.14%"
// 								stopColor="#af90f8"
// 							/>
// 							<stop
// 								offset="43.43%"
// 								stopColor="#b18cf8"
// 							/>
// 							<stop
// 								offset="52%"
// 								stopColor="#b684f7"
// 							/>
// 							<stop
// 								offset="56.29%"
// 								stopColor="#c983f5"
// 							/>
// 							<stop
// 								offset="60.57%"
// 								stopColor="#da83f4"
// 							/>
// 							<stop
// 								offset="64.86%"
// 								stopColor="#ea83f3"
// 							/>
// 							<stop
// 								offset="69.14%"
// 								stopColor="#f288eb"
// 							/>
// 							<stop
// 								offset="73.43%"
// 								stopColor="#f293de"
// 							/>
// 							<stop
// 								offset="82%"
// 								stopColor="#f1a6cf"
// 							/>
// 							<stop
// 								offset="84.57%"
// 								stopColor="#f1aad1"
// 							/>
// 							<stop
// 								offset="87.14%"
// 								stopColor="#f1afd3"
// 							/>
// 							<stop
// 								offset="89.71%"
// 								stopColor="#f1b3d5"
// 							/>
// 							<stop
// 								offset="92.29%"
// 								stopColor="#f1b7d8"
// 							/>
// 							<stop
// 								offset="94.86%"
// 								stopColor="#f1bcda"
// 							/>
// 							<stop
// 								offset="100%"
// 								stopColor="#f2c4de"
// 							/>
// 						</linearGradient>
// 					</defs>
// 					<path
// 						fill={"url(#0)"}
// 						d="M216,48H40A16,16,0,0,0,24,64V224a15.84,15.84,0,0,0,9.25,14.5A16.05,16.05,0,0,0,40,240a15.89,15.89,0,0,0,10.25-3.78.69.69,0,0,0,.13-.11L82.5,208H216a16,16,0,0,0,16-16V64A16,16,0,0,0,216,48ZM84,140a12,12,0,1,1,12-12A12,12,0,0,1,84,140Zm44,0a12,12,0,1,1,12-12A12,12,0,0,1,128,140Zm44,0a12,12,0,1,1,12-12A12,12,0,0,1,172,140Z"
// 					></path>
// 				</svg>
// 			</div>
// 			<ChatPage course={pathname?.split("/")[3] || ""} />
// 		</div>
// 	)
// }
// function ChatPage(props: { course?: string }) {
// 	const { handle, courses, modules, files } = readAdminContext()!
// 	//Content Variables

// 	const askOrbot = writeApi()?.askOrbot!

// 	const [chatCourse, setChatCourse] = useState<string | undefined>(undefined)
// 	const [chatModule, setChatModule] = useState<string | undefined>(undefined)

// 	const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
// 	const [chatLoading, setChatLoading] = useState(false)
// 	const chatInputRef = useRef<HTMLInputElement>(null)
// 	const askOrbotResponse = useRef<any>(null)

// 	useEffect(() => {
// 		if (props.course) {
// 			let currentCourse = courses
// 				?.filter((c) => c.slug == props.course)
// 				.pop()
// 			if (currentCourse) {
// 				setChatCourse(currentCourse._ref)
// 				setUseManualMode(true)
// 			}
// 		}
// 	})

// 	async function requestQuery() {
// 		if (
// 			chatInputRef.current?.value &&
// 			chatInputRef.current?.value != "" &&
// 			!chatLoading
// 		) {
// 			const query = postParsed.current
// 			console.log(query)
// 			setChatHistory([
// 				{
// 					author: "user",
// 					message: query,
// 					data:
// 						courses
// 							?.filter((c) => c._ref == chatCourse)
// 							?.map((i) => "Query in " + i.title.toLowerCase()) ||
// 						[],
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
// 				let mod = mList.filter((m) => m._ref == file?._module).pop()
// 				let course = courses
// 					?.filter((c) => c._ref == mod?._course)
// 					.pop()

// 				return {
// 					course: course,
// 					module: mod,
// 					file: file,
// 					distance: `${(distances[idx] * 100).toFixed(2)}%`,
// 					validation: `${(
// 						response.chat.validation[idx] * 100
// 					).toFixed(2)}%`,
// 					sliceIdx: response.content[idx].slice_index,
// 				}
// 			})
// 			console.log(find)
// 			setChatHistory([
// 				{
// 					author: "user",
// 					message: query,
// 					data:
// 						courses
// 							?.filter((c) => c._ref == chatCourse)
// 							?.map((i) => "Query in " + i.title.toLowerCase()) ||
// 						[],
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
// 			askOrbotResponse.current = response
// 			//Request Server to query vector database for closest document matches
// 			//Then add to chat history to display in chat window
// 		}
// 	}

// 	const [chatInputHTML, setChatInputHTML] = useState("")
// 	const postParsed = useRef<string>("")
// 	const [useManualMode, setUseManualMode] = useState(false)
// 	const chatCourseLoc = useRef<[number, number | undefined]>([0, undefined])
// 	useEffect(() => {
// 		parseCourse(chatInputRef.current?.value as string)
// 	}, [useManualMode])
// 	function parseCourse(currentValue: string) {
// 		setChatInputHTML("<p>" + currentValue + "</p>")
// 		postParsed.current = currentValue
// 		if (useManualMode) {
// 			return
// 		}
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
// 			// console.log(holder, course)
// 			if (course && course?.length > 0) {
// 				found = course
// 				keyword = holder.join(" ")
// 			}
// 		})

// 		if (keyword == "") return setChatCourse(undefined)
// 		console.log(
// 			found[0].title,
// 			keyword,
// 			found[0].title.replace(new RegExp(keyword, "i"), "")
// 		)

// 		let startLoc = value.lastIndexOf(" in ") + 1
// 		let endLoc = startLoc + keyword.length + 4

// 		let highlighted =
// 			"<p>" +
// 			currentValue.substring(0, startLoc) +
// 			`<mark class="text-violet-300 bg-transparent" >` +
// 			currentValue.substring(startLoc, endLoc) +
// 			"</mark>" +
// 			`<mark class="text-zinc-500 bg-transparent" >` +
// 			found[0].title.replace(new RegExp(keyword, "i"), "") +
// 			" " +
// 			"</mark>" +
// 			currentValue.substring(endLoc) +
// 			"</p>"
// 		postParsed.current =
// 			currentValue.substring(0, startLoc) +
// 			currentValue.substring(startLoc, endLoc) +
// 			found[0].title.replace(new RegExp(keyword, "i"), "") +
// 			" " +
// 			currentValue.substring(endLoc)
// 		chatCourseLoc.current = [startLoc, endLoc]
// 		setChatInputHTML(highlighted)
// 		setChatCourse(found[0]._ref)
// 	}
// 	return (
// 		<div className="w-full h-screen flex flex-col">
// 			<div className="border-zinc-500 border-b flex-none items-center w-full p-2 h-16 text-2xl flex justify-end gap-2">
// 				<h2 className="flex-1">Orbot Chat</h2>
// 				<div
// 					className="bg-zinc-500 p-2 rounded-md hover:bg-zinc-400 hover:scale-105 active:scale-95 transition-all cursor-pointer flex text-base gap-2"
// 					onClick={() => {
// 						setChatHistory([])
// 					}}
// 				>
// 					<ico.Eraser
// 						size={20}
// 						weight="duotone"
// 					/>
// 				</div>
// 			</div>
// 			<div className="w-full h-[calc(100vh-12rem)] flex-col flex p-2">
// 				<div className="flex flex-none h-[calc(100vh-12rem)] flex-col w-full overflow-y-auto gap-2 text-sm">
// 					{chatHistory.map((item, idx) => {
// 						if (item.author == "loader") {
// 							return (
// 								<div
// 									key={idx}
// 									className="flex flex-col h-fit w-full "
// 								>
// 									<div className="flex flex-col w-full gap-2">
// 										<div className="flex items-center gap-1 h-fit ">
// 											<div className="rounded-sm flex-none h-full w-fit bg-violet-100">
// 												<div className="h-fit w-fit p-2 rounded-sm flex items-center bg-violet-200">
// 													<ico.CircleDashed className="fill-violet-600 h-6 w-6" />
// 												</div>
// 											</div>
// 											<div className="p-2 whitespace-normal flex gap-2 flex-1">
// 												<div className="h-2 w-2 rounded-full bg-gray-500 animate-pulse" />
// 												<div className="h-2 w-2 rounded-full bg-gray-500 animate-pulse" />
// 												<div className="h-2 w-2 rounded-full bg-gray-500 animate-pulse" />
// 											</div>
// 										</div>
// 									</div>
// 								</div>
// 							)
// 						} else if (item.author == "bot") {
// 							return (
// 								<div
// 									key={idx}
// 									className="flex flex-col h-fit w-full "
// 								>
// 									<div className="flex flex-col w-full gap-2">
// 										<div className="flex items-center gap-1 h-fit w-4/5">
// 											<div className="rounded-sm flex-none h-full w-fit bg-violet-100">
// 												<div className="h-fit w-fit p-2 rounded-sm flex items-center bg-violet-200">
// 													<ico.CircleDashed className="fill-violet-600 h-6 w-6" />
// 												</div>
// 											</div>
// 											<div className="overflow-y-auto max-h-80 flex-1">
// 												<p className="p-2 whitespace-pre-wrap flex-1">
// 													{item.message}
// 												</p>
// 											</div>
// 										</div>
// 										<ChatModule
// 											key={idx}
// 											item={item}
// 											handle={handle}
// 										/>
// 									</div>
// 								</div>
// 							)
// 						} else {
// 							return (
// 								<div
// 									key={idx}
// 									className="flex flex-col items-end gap-1  h-fit w-full justify-end  "
// 								>
// 									<div className="flex w-4/5 bg-zinc-950 rounded-sm">
// 										<p className="p-2 whitespace-normal flex-1">
// 											{item.message}
// 										</p>
// 										<div className="rounded-sm flex-none p-2 h-full w-fit bg-indigo-200">
// 											<ico.User className="fill-indigo-600 h-6 w-6" />
// 										</div>
// 									</div>
// 									<p className="italic text-xs text-violet-300">
// 										{item.data}
// 									</p>
// 								</div>
// 							)
// 						}
// 					})}
// 				</div>
// 			</div>
// 			<div className="flex flex-none flex-col p-2 gap-1 h-32">
// 				<div className="flex flex-none h-fit flex-col gap-2 w-full text-sm">
// 					<div className="flex items-center gap-2">
// 						<div className="bg-zinc-700 rounded-md p-1">
// 							<ico.LightbulbFilament
// 								size={"1.25rem"}
// 								className=" fill-zinc-100"
// 							/>
// 						</div>
// 						<div className="flex flex-1 items-center gap-2">
// 							<p className="">Asking about: </p>
// 							<select
// 								className={
// 									(!chatCourse
// 										? "italic text-zinc-500"
// 										: "text-violet-300") +
// 									" flex-1 rounded-md bg-zinc-800 p-1 hover:ring-2 hover:ring-zinc-300 cursor-pointer"
// 								}
// 								name="course"
// 								id="course"
// 								onChange={(e) => {
// 									if (e.target.value == "") {
// 										setUseManualMode(false)
// 										setChatCourse(undefined)
// 										return
// 									}
// 									setUseManualMode(true)
// 									setChatCourse(e.target.value)
// 								}}
// 								disabled={props.course ? true : false}
// 							>
// 								<option
// 									value=""
// 									selected={!chatCourse}
// 									className="text-zinc-500 italic"
// 								>
// 									{`(Use "in" to specify course)`}
// 								</option>
// 								{courses?.map((course) => {
// 									return (
// 										<option
// 											key={course._ref}
// 											value={course._ref}
// 											className="text-zinc-100"
// 											selected={chatCourse == course._ref}
// 										>
// 											{course.title}
// 										</option>
// 									)
// 								})}
// 							</select>
// 						</div>
// 					</div>
// 				</div>
// 				<div className="w-full flex flex-none h-fit gap-2">
// 					<div className="relative w-full flex bg-zinc-700 rounded-md">
// 						<div
// 							className="absolute flex items-center w-full h-full rounded-md bg-transparent pointer-events-none select-none outline-none text-zinc-100 px-2"
// 							dangerouslySetInnerHTML={{ __html: chatInputHTML }}
// 						></div>
// 						<input
// 							ref={chatInputRef}
// 							className="whitespace-pre-wrap caret-white flex-1 h-full rounded-md bg-transparent px-2 outline-none placeholder:text-zinc-500 text-zinc-700"
// 							type="text"
// 							placeholder="Ask a question..."
// 							onChange={(e) => parseCourse(e.target.value)}
// 							onKeyDown={async (e) => {
// 								if (e.key == "Enter") requestQuery()
// 							}}
// 						/>
// 					</div>
// 					<div
// 						className="flex items-center justify-center h-10 w-12 bg-zinc-950 rounded-md transition-all cursor-pointer hover:scale-95"
// 						onClick={requestQuery}
// 					>
// 						<ico.PaperPlaneTilt className="fill-zinc-100 w-6 h-6" />
// 					</div>
// 				</div>
// 			</div>
// 		</div>
// 	)
// }

// function ChatModule(props: { item: ChatHistory; handle: string }) {
// 	const push = useRouter()?.push
// 	const [chatPage, setChatPage] = useState<number>(0)
// 	const { selectedFile, selectedFileData } = readAdminContext()!

// 	const { setSelectedFile, setHighlight } = writeAdminContext()!
// 	const { item, handle } = props

// 	const uniqueData = item.data.filter((d, index, self) => {
// 		const ref = d.file._ref
// 		return index === self.findIndex((d2) => d2.file._ref === ref)
// 	})

// 	function changePage(next: boolean) {
// 		if (next) {
// 			if (chatPage < uniqueData.length) {
// 				setChatPage(chatPage + 1)
// 			}
// 		} else {
// 			if (chatPage > 0) {
// 				setChatPage(chatPage - 1)
// 			}
// 		}
// 	}

// 	function onClickEvent(d: any) {
// 		if (selectedFile == d.file._ref) return
// 		setSelectedFile(d.file._ref)
// 		setHighlight(uniqueData[chatPage].sliceIdx)
// 		push(`/hub/${handle}/${d.course.slug}/${d.module.slug}`)
// 		// console.log(uniqueData[chatPage].sliceIdx)
// 	}

// 	return (
// 		<div className="h-fit w-full flex flex-col">
// 			{uniqueData?.map((d, idx) => {
// 				if (!(idx == chatPage)) return
// 				return (
// 					<div
// 						key={d.module._ref}
// 						className="flex flex-col w-full h-fit"
// 					>
// 						<div className="flex w-full h-fit">
// 							<div
// 								className=" bg-zinc-950 flex flex-col w-4/5 h-fit rounded-sm items-center hover:bg-zinc-700 transition-all group  cursor-pointer"
// 								onClick={() => onClickEvent(d)}
// 							>
// 								<div className="flex w-full h-36 relative items-end">
// 									<div className="z-10 flex flex-col flex-1  h-full justify-end p-2">
// 										<h2 className="text-xl">
// 											{d.module.title}
// 										</h2>
// 										<p>{d.course.title}</p>
// 										<p className="text-xs italic text-zinc-400">
// 											{d.file.name}
// 										</p>
// 										{/* <p className="text-xs whitespace-pre-wrap">{`Course: ${d.course.title}\nDuration: ${d.module.duration} Min\nContent: ${d.file.name}`}</p> */}
// 									</div>
// 									<div className="z-10 flex flex-col h-fit w-fit group-hover:scale-125 transition-all justify-end p-2">
// 										<ico.ArrowRight
// 											width={34}
// 											height={34}
// 										/>
// 									</div>

// 									<div className="w-full h-full absolute overflow-hidden z-0 after:h-full after:w-full after:absolute after:bg-gradient-to-tr after:from-zinc-950 after:transition-all group-hover:after:from-zinc-700 after:from-55%">
// 										<img
// 											className="absolute -right-1 -top-1 aspect-auto w-24 opacity-100 -z-10"
// 											src={`/${d.course.icon}`}
// 											alt=""
// 										/>
// 									</div>
// 								</div>
// 							</div>

// 							<div
// 								className={`h-full flex-1  flex flex-col justify-center items-center gap-2 `}
// 							>
// 								<div
// 									className={`${
// 										chatPage == uniqueData.length - 1
// 											? "opacity-30"
// 											: "hover:bg-zinc-700 cursor-pointer"
// 									} h-10 w-10 rounded-full bg-zinc-950 p-2   transition-all`}
// 									onClick={() => changePage(true)}
// 								>
// 									<ico.CaretRight className="w-full h-full" />
// 								</div>
// 								<div className="h-fit w-fit flex flex-col justify-center gap-1">
// 									{uniqueData.map((i, n) => {
// 										return (
// 											<div
// 												key={n}
// 												className={`rounded-full h-2 w-2 ${
// 													n == chatPage
// 														? "bg-zinc-300"
// 														: "bg-zinc-600"
// 												}`}
// 												onClick={() => {
// 													setChatPage(n)
// 												}}
// 											/>
// 										)
// 									})}
// 								</div>
// 								<div
// 									className={`${
// 										chatPage == 0
// 											? "opacity-30"
// 											: "hover:bg-zinc-700 cursor-pointer"
// 									} h-10 w-10 rounded-full bg-zinc-950 p-2   transition-all`}
// 									onClick={() => changePage(false)}
// 								>
// 									<ico.CaretLeft className="w-full h-full" />
// 								</div>
// 							</div>
// 						</div>
// 						{/* <div className="flex w-full h-fit gap-2">
// 							<p className="italic text-xs text-zinc-300">
// 								Vector Similarity:
// 							</p>
// 							<p className="italic text-xs text-violet-300">
// 								Source: {d.distance}
// 							</p>
// 							<p className="italic text-xs text-violet-300">
// 								Response: {d.validation}
// 							</p>
// 						</div> */}
// 					</div>
// 				)
// 			})}
// 		</div>
// 	)
// }
