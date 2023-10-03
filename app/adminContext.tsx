"use client"
import { useAuth } from "@clerk/nextjs"
//NextJS has React Strict Mode auto enabled for Development
// This is why the Context will re-render twice only during development phase
import { writeContext, readContext } from "@/app/context"

import React, {
	useContext,
	useState,
	useEffect,
	useRef,
	useTransition,
} from "react"

type Props = {
	children: React.ReactNode
}

interface ModuleMap {
	[key: string]: Module[]
}
interface FileMap {
	[key: string]: File[]
}

export default function AdminContext({ children }: Props): JSX.Element {
	const { isLoaded, userId, sessionId, getToken } = useAuth()

	const [handle, setHandle] = useState<string>("")
	const courses = readContext()?.courses
	const [modules, setModules] = useState<ModuleMap>({})
	const [files, setFiles] = useState<FileMap>({})

	const getCourses = writeContext()?.getCourses!
	const getModules = writeContext()?.getModules!
	const getFiles = writeContext()?.getFiles!

	const [selectedFile, setSelectedFile] = useState("")
	const [selectedFileData, setSelectedFileData] = useState<File>()
	const [preview, setPreview] = useState<string>("No Preview Available")
	const [slices, setSlices] = useState<string[]>([])
	const [isText, setIsText] = useState<boolean>(true)
	const [previewHTML, setPreviewHTML] = useState<string>("")
	const [highlightIdx, setHighlight] = useState<number | null>(null)

	const readContent = writeContext()?.readContent!
	const getPreview = writeContext()?.getPreview!

	useEffect(() => {
		if (!isLoaded || !userId) return
		if (handle == "") {
			try {
				fetch(`/api/auth/user?method=GET`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						user: {
							id: userId,
						},
					}),
				})
					.then((res) =>
						res
							.json()
							.then((body) => {
								console.log(body)
								setHandle(body.data.auth.handle)
							})
							.catch((err) => console.log(err))
					)
					.catch((err) => console.log(err))
			} catch (error) {
				console.error(error)
			}
		}
	}, [userId])

	useEffect(() => {
		if (handle == "") return
		getCourses(handle)
	}, [handle])

	useEffect(() => {
		let content: ModuleMap = {}
		courses?.forEach(async (c) => {
			let data = await getModules(handle, c.slug)
			content[c.slug] = data
			setModules({ ...content })
		})
	}, [courses])

	function loadFiles() {
		let content: FileMap = {}
		courses?.forEach((c) => {
			if (modules[c.slug]) {
				modules[c.slug].forEach(async (m) => {
					try {
						const response = await fetch(`/api/get/file`, {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								handle: handle,
								_module: m._ref,
							}),
						})

						const data = await response.json()
						// console.log("getFiles", data)
						if (data) content[m.slug] = data
						else console.log("admin/FileMap", data)

						setFiles({ ...content })
					} catch (error) {
						console.error(error)
					}
				})
			}
		})
	}

	useEffect(() => {
		loadFiles()
	}, [modules])

	//Used to show file preview
	useEffect(() => {
		if (selectedFile == "") {
			setSelectedFileData(undefined)
			return
		}
		console.log("selectedFile", selectedFile)
		Object.values(files).forEach((value) => {
			value.forEach((f) => {
				if (f._ref == selectedFile) setSelectedFileData(f)
			})
		})
	}, [selectedFile])

	const [loadingPreview, startPreview] = useState(false)
	useEffect(() => {
		async function content() {
			if (selectedFileData) {
				startPreview(true)
				const c = await readContent(handle, selectedFileData._ref)
				setPreview(c.preview)
				setSlices(c.slices)
				const html = await getPreview(handle, selectedFileData._ref)
				setPreviewHTML(html.html)
				startPreview(false)
			}
		}
		content()
	}, [selectedFileData])

	return (
		<ReadContext.Provider
			value={{
				handle,
				courses,
				modules,
				files,
				selectedFile,
				isText,
				loadingPreview,
				selectedFileData: selectedFile
					? {
							file: selectedFileData,
							content: previewHTML,
							text: preview,
							slices: slices,
							isText: isText,
							highlight: highlightIdx,
					  }
					: null,
			}}
		>
			<WriteContext.Provider
				value={{
					setHandle,
					loadFiles,
					setSelectedFile,
					setIsText,
					setHighlight,
				}}
			>
				{children}
			</WriteContext.Provider>
		</ReadContext.Provider>
	)
}

type ReadContextType = {
	// Define your context properties here
	handle: string
	courses: Course[] | undefined
	modules: ModuleMap
	files: FileMap
	selectedFile: string
	isText: boolean
	loadingPreview: boolean
	selectedFileData: {
		file: File | undefined
		content: string
		text: string
		slices: string[]
		isText: boolean
		highlight: number | null
	} | null
}

type WriteContextType = {
	setHandle: React.Dispatch<React.SetStateAction<string>>
	loadFiles: () => void
	setSelectedFile: React.Dispatch<React.SetStateAction<string>>
	setIsText: React.Dispatch<React.SetStateAction<boolean>>
	setHighlight: React.Dispatch<React.SetStateAction<number | null>>
	// Define your context properties here
}

const ReadContext = React.createContext<ReadContextType | undefined>(undefined)
const WriteContext = React.createContext<WriteContextType | undefined>(
	undefined
)

export function readAdminContext(): ReadContextType | undefined {
	return useContext(ReadContext)
}

export function writeAdminContext(): WriteContextType | undefined {
	return useContext(WriteContext)
}
