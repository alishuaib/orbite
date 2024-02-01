// UNUSED COMPONENT

// "use client"
// import * as ico from "@phosphor-icons/react"
// import { useState, useRef, useEffect, useLayoutEffect, use } from "react"
// import { useRouter } from "next/navigation"
// import { writeContext, readContext } from "@/app/context"
// import { writeAdminContext, readAdminContext } from "@/app/adminContext"
// import { Course, File, Module } from "@/lib/@schemas"
// import { DefaultExtensionType, FileIcon, defaultStyles } from "react-file-icon"

// export default function FilePage() {
// 	const { handle, courses, modules, files, isText } = readAdminContext()!
// 	const { getCourses } = writeContext()!
// 	//Content Variables

// 	return (
// 		<div className="w-full h-screen flex flex-col gap-2 overflow-y-auto">
// 			<div className="border-zinc-500 border-b flex w-full text-2xl px-2 h-16 items-center gap-2 flex-none">
// 				<h2 className="flex-1">Filesystem</h2>
// 				<div
// 					className="bg-zinc-500 p-2 rounded-md hover:bg-zinc-400 hover:scale-105 active:scale-95 transition-all cursor-pointer"
// 					onClick={() => {
// 						getCourses(handle)
// 					}}
// 				>
// 					<ico.ArrowCounterClockwise
// 						size={20}
// 						className="fill-zinc-100"
// 					/>
// 				</div>
// 			</div>
// 			<Folder
// 				level="root"
// 				title={handle}
// 				count={courses?.length || 0}
// 			>
// 				{courses?.map((course) => (
// 					<Folder
// 						key={course._ref}
// 						level="course"
// 						title={course.title}
// 						count={modules[course.slug]?.length || 0}
// 					>
// 						{modules[course.slug]?.map((module) => (
// 							<Folder
// 								key={module._ref}
// 								level="module"
// 								title={module.title}
// 								count={files[module.slug]?.length || 0}
// 							>
// 								{files[module.slug]?.map((file) => (
// 									<FileItem
// 										key={file._ref}
// 										file={file}
// 									/>
// 								))}
// 								<AddFileButton
// 									course={course}
// 									module={module}
// 								/>
// 							</Folder>
// 						))}
// 						<AddFolderButton
// 							level="module"
// 							course={course}
// 						/>
// 					</Folder>
// 				))}
// 				<AddFolderButton level="course" />
// 			</Folder>
// 		</div>
// 	)
// }

// function AddFolderButton(props: {
// 	level: "course" | "module"
// 	course?: Course
// }) {
// 	const { level, course } = props
// 	//Folder Create Variables
// 	const [isCreating, setIsCreating] = useState<boolean>(false)
// 	const { newCourse, newModule, getCourses } = writeContext()!
// 	const { handle } = readAdminContext()!
// 	const titleRef = useRef<HTMLInputElement>(null)
// 	const slugRef = useRef<HTMLInputElement>(null)
// 	const [slugPlaceholder, setSlugPlaceholder] = useState<string>("")
// 	const [isOpen, setIsOpen] = useState<boolean>(false)
// 	const [isValid, setIsValid] = useState<boolean>(false)

// 	async function createFolder(
// 		e: React.MouseEvent<HTMLDivElement, MouseEvent>
// 	) {
// 		e.stopPropagation()
// 		console.log("working")
// 		if (titleRef.current?.value && titleRef.current?.value != "") {
// 			if (level == "course") {
// 				await newCourse(handle, {
// 					title: titleRef.current?.value,
// 					slug:
// 						slugRef.current?.value && slugRef.current?.value != ""
// 							? slugRef.current?.value
// 							: slugPlaceholder,
// 					icon: "altair.png",
// 					label: "",
// 					summary: "",
// 					tags: [],
// 				})
// 			} else {
// 				await newModule(handle, {
// 					title: titleRef.current?.value,
// 					slug:
// 						slugRef.current?.value && slugRef.current?.value != ""
// 							? slugRef.current?.value
// 							: slugPlaceholder,
// 					duration: 0,
// 					_course: course!._ref,
// 				})
// 			}
// 			await getCourses(handle)
// 			setIsOpen(false)
// 		}
// 	}

// 	return (
// 		<div
// 			className={
// 				"border-sky-500 px-1 border-l-2 ml-3 my-1 flex flex-col select-none   hover:bg-sky-50 text-sky-500 transition-all" +
// 				(isOpen ? " bg-sky-50" : "")
// 			}
// 		>
// 			<div
// 				className="flex gap-1 items-center cursor-pointer"
// 				onClick={(e) => {
// 					e.stopPropagation()
// 					e.nativeEvent.stopImmediatePropagation()
// 					setIsOpen(!isOpen)
// 				}}
// 			>
// 				{isCreating ? (
// 					<ico.CircleNotch
// 						size={20}
// 						className="fill-sky-500 animate-spin"
// 					/>
// 				) : level == "course" ? (
// 					<ico.BookBookmark
// 						size={20}
// 						weight={isOpen ? "fill" : undefined}
// 						className="fill-sky-500"
// 					/>
// 				) : (
// 					<ico.Bookmark
// 						size={20}
// 						weight={isOpen ? "fill" : undefined}
// 						className="fill-sky-500"
// 					/>
// 				)}

// 				<p>Create new {level}</p>
// 			</div>

// 			{!isOpen ? (
// 				<></>
// 			) : (
// 				<div className="flex flex-col px-1 py-1  text-zinc-800 border-t-2 border-t-sky-300">
// 					<div className="flex flex-col relative">
// 						<label
// 							htmlFor="title"
// 							className="text-sm absolute bg-sky-50 px-2 rounded-sm left-2 top-1"
// 						>
// 							Title
// 						</label>
// 						<input
// 							ref={titleRef}
// 							onChange={() => {
// 								setSlugPlaceholder(
// 									titleRef.current?.value
// 										?.toLowerCase()
// 										.replace(/ /g, "-") || ""
// 								)
// 								if (
// 									titleRef.current?.value &&
// 									titleRef.current?.value != ""
// 								) {
// 									setIsValid(true)
// 								} else {
// 									setIsValid(false)
// 								}
// 							}}
// 							id="title"
// 							type="text"
// 							className="p-1 mt-4 rounded-sm bg-transparent border-2 border-zinc-300 text-sm"
// 						/>
// 					</div>
// 					<div className="flex flex-col relative">
// 						<label
// 							htmlFor="slug"
// 							className="text-sm absolute bg-sky-50 px-2 rounded-sm left-2 top-1"
// 						>
// 							Slug
// 						</label>
// 						<input
// 							ref={slugRef}
// 							id="slug"
// 							type="text"
// 							placeholder={slugPlaceholder}
// 							className="p-1 mt-4 rounded-sm bg-transparent border-2 border-zinc-300 text-sm"
// 						/>
// 					</div>
// 					<div className="flex justify-center gap-2 pt-3 pb-2">
// 						<div
// 							className={
// 								"bg-sky-500 px-3 py-1 rounded-sm text-white  transition-all cursor-pointer" +
// 								(isValid
// 									? " hover:scale-105 active:scale-95"
// 									: " opacity-30 bg-black cursor-not-allowed")
// 							}
// 							onClick={(e) => {
// 								if (isValid) createFolder(e)
// 							}}
// 						>
// 							Create {level}
// 						</div>
// 						<div
// 							className="bg-red-400 px-3 py-1 rounded-sm text-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
// 							onClick={() => setIsOpen(false)}
// 						>
// 							Cancel
// 						</div>
// 					</div>
// 				</div>
// 			)}
// 		</div>
// 	)
// }

// function AddFileButton(props: { course: Course; module: Module }) {
// 	const { course, module } = props
// 	//File Upload Variables
// 	const uploadContent = writeContext()?.uploadContent!
// 	const { handle } = readAdminContext()!
// 	const { loadFiles } = writeAdminContext()!
// 	const [uploadProgress, setUploadProgress] = useState<number>(0)
// 	async function onFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
// 		const files = e.target.files || []
// 		const formData = new FormData()
// 		for (let i = 0; i < files.length; i++) {
// 			formData.append("file", files[i])
// 		}
// 		uploadContent(
// 			handle,
// 			e.target.dataset.course!,
// 			e.target.dataset.module!,
// 			formData,
// 			setUploadProgress
// 		)
// 		e.target.value = ""
// 	}

// 	useEffect(() => {
// 		if (uploadProgress == 100) {
// 			console.info("Upload Complete :: Reloading Files")
// 			loadFiles()
// 			setUploadProgress(0)
// 		}
// 	}, [uploadProgress])

// 	return (
// 		<div
// 			className="pl-0.5 ml-3 my-1 flex flex-col select-none cursor-pointer hover:bg-green-200 text-green-500 transition-all"
// 			onClick={(e) => {
// 				const input = e.currentTarget.querySelector(
// 					"input[type=file]"
// 				) as HTMLInputElement
// 				input?.click()
// 			}}
// 		>
// 			<div className="flex gap-1 items-center">
// 				{!(uploadProgress == 0 || uploadProgress == 100) ? (
// 					<ico.CircleNotch
// 						size={20}
// 						className="fill-green-500 animate-spin"
// 					/>
// 				) : (
// 					<ico.FilePlus
// 						size={20}
// 						className="fill-green-500"
// 					/>
// 				)}

// 				<p>Add Files</p>
// 				<input
// 					hidden
// 					type="file"
// 					multiple
// 					data-course={course._ref}
// 					data-module={module._ref}
// 					onChange={onFileUpload}
// 				/>
// 			</div>

// 			<div
// 				className={`${
// 					uploadProgress == 0 || uploadProgress == 100 ? "h-0" : "h-1"
// 				} transition-all w-full bg-neutral-200 dark:bg-neutral-600 rounded-full overflow-hidden`}
// 			>
// 				<div
// 					className="h-1 bg-green-500 transition-all"
// 					style={{
// 						width: `${uploadProgress}%`,
// 					}}
// 				></div>
// 			</div>
// 		</div>
// 	)
// }

// function FileItem(props: { file: File }) {
// 	const { file } = props
// 	const { handle, selectedFile } = readAdminContext()!
// 	const { loadFiles, setSelectedFile, setHighlight } = writeAdminContext()!

// 	//File Delete Variables
// 	const [isDeleting, setIsDeleting] = useState<boolean>(false)
// 	const deleteContent = writeContext()?.deleteContent!
// 	async function deleteFile(
// 		e: React.MouseEvent<HTMLDivElement, MouseEvent>,
// 		file: File
// 	) {
// 		e.stopPropagation()
// 		setIsDeleting(true)
// 		const result = await deleteContent(handle, file._ref)
// 		console.log(result)
// 		if (result?.document?.acknowledged) {
// 			loadFiles()
// 			setIsDeleting(false)
// 		}
// 	}

// 	return (
// 		<div
// 			key={file._ref}
// 			className={`ml-3 pl-1 flex items-center gap-2 select-none cursor-pointer border-2 hover:bg-zinc-600 ${
// 				selectedFile == file._ref
// 					? " border-blue-400"
// 					: " border-transparent"
// 			}`}
// 			id="fileDisplay"
// 			onClick={() => {
// 				setHighlight(null)
// 				setSelectedFile(selectedFile == file._ref ? "" : file._ref)
// 			}}
// 		>
// 			<style>
// 				{
// 					"#fileDisplay svg {width: auto !important; height: 16px;flex:none}"
// 				}
// 			</style>
// 			<FileIcon
// 				extension={file.ext}
// 				{...defaultStyles[file.ext as DefaultExtensionType]}
// 			/>
// 			<p className="flex-1">
// 				{file.name}.{file.ext}
// 			</p>
// 			<div
// 				className={`${
// 					isDeleting ? "bg-red-200" : ""
// 				} flex items-center justify-center bg-orange hover:bg-red-200 h-6 w-6 transition-all`}
// 				onClick={(e) => deleteFile(e, file)}
// 			>
// 				{isDeleting ? (
// 					<ico.SpinnerGap
// 						size={"1.5rem"}
// 						className="fill-red-600 animate-spin"
// 					/>
// 				) : (
// 					<ico.Trash
// 						size={"1.5rem"}
// 						className="fill-red-600"
// 					/>
// 				)}
// 			</div>
// 		</div>
// 	)
// }

// function Folder(props: {
// 	level: "root" | "course" | "module"
// 	title: string
// 	children: React.ReactNode
// 	count: number
// }) {
// 	const [open, setOpen] = useState(false)

// 	const icons = {
// 		root: (
// 			<ico.Folders
// 				weight="duotone"
// 				size={20}
// 			/>
// 		),
// 		course: open ? (
// 			<ico.FolderNotchMinus
// 				weight="duotone"
// 				size={20}
// 			/>
// 		) : (
// 			<ico.FolderNotchPlus
// 				weight="duotone"
// 				size={20}
// 			/>
// 		),
// 		module: open ? (
// 			<ico.FolderNotchOpen
// 				weight="duotone"
// 				size={20}
// 			/>
// 		) : (
// 			<ico.FolderNotch
// 				weight="duotone"
// 				size={20}
// 			/>
// 		),
// 	}

// 	const weight = {
// 		root: "border-zinc-400/100",
// 		course: "border-zinc-400/70",
// 		module: "border-zinc-400/40",
// 	}

// 	const bg = {
// 		root: "bg-zinc-700/20",
// 		course: "bg-zinc-700/80",
// 		module: "bg-zinc-600/40",
// 	}

// 	function handleOpen(e: React.MouseEvent<HTMLDetailsElement>) {
// 		e.preventDefault()
// 		setOpen(!open)
// 	}
// 	return (
// 		<details
// 			key={props.title}
// 			className={`group group:opacity-30 ml-3 my-1  ${
// 				weight[props.level]
// 			}  ${
// 				open
// 					? `border-l-2 ${bg[props.level]} shadow-inner`
// 					: "border-l-2 border-transparent"
// 			}`}
// 			open={open}
// 		>
// 			<summary
// 				className="pl-1 flex items-center gap-2 select-none cursor-pointer hover:bg-zinc-600"
// 				onClick={handleOpen}
// 			>
// 				{icons[props.level]}
// 				<p className="flex-1">{props.title}</p>
// 				<p className="pr-2 text-zinc-400">{props.count}</p>
// 			</summary>
// 			{props.children}
// 		</details>
// 	)
// }
