"use client"
//NextJS has React Strict Mode auto enabled for Development
// This is why the Context will re-render twice only during development phase

import { Course, File, Module } from "@/lib/@schemas"

import React, {
	useContext,
	useState,
	useEffect,
	useRef,
	useTransition,
} from "react"

interface OrbiteUser {
	_handle: string | null
	_id: string | null
	domain: string | null
	name: string | null
}

type Props = {
	children: React.ReactNode
}

const ReadContext = React.createContext<ReadContextType | undefined>(undefined)
const WriteContext = React.createContext<WriteContextType | undefined>(
	undefined
)

export function readContext(): ReadContextType | undefined {
	return useContext(ReadContext)
}

export function writeContext(): WriteContextType | undefined {
	return useContext(WriteContext)
}

export default function MainContext({ children }: Props): JSX.Element {
	const [user, setUser] = useState({
		_handle: null,
		_id: null,
		domain: null,
		name: null,
	})
	const [courses, setCourses] = useState<Course[]>([])
	const [modules, setModules] = useState<Module[]>([])
	const [files, setFiles] = useState<File[]>([])

	const [overlay, setOverlay] = useState<"course" | "module" | null>(null)

	async function getCourses(handle: string) {
		// Gets the course list for a given handle
		try {
			const response = await fetch(`/api/get/course`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ handle: handle }),
			})

			const data = await response.json()

			// console.log("getCourses", data)
			if (data) setCourses((l) => [...data])

			return data
		} catch (error) {
			console.error(error)
		}
	}

	async function getModules(handle: string, courseSlug: string) {
		// Gets the course list for a given handle
		if (!courses || courses.length == 0) await getCourses(handle)
		const courseData = courses?.find((i) => i.slug == courseSlug)
		if (!courseData) {
			// console.log("No course data")
			setModules([])
			return
		}
		const _course = courseData._ref
		// console.log("getModules", handle, `${courseSlug}: ${_course}`)
		try {
			const response = await fetch(`/api/get/module`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ handle: handle, _course: _course }),
			})

			const data = await response.json()
			// console.log("getModules", data)
			if (data) setModules((l) => [...data])

			return data
		} catch (error) {
			console.error(error)
		}
	}

	async function getFiles(
		handle: string,
		courseSlug: string,
		moduleSlug: string
	) {
		// Gets the course list for a given handle
		if (!courses || courses.length == 0) await getCourses(handle)
		const courseData = courses?.find((i) => i.slug == courseSlug)
		if (!courseData) {
			// console.log("No course data")
			setModules([])
			return
		}
		const _course = courseData._ref

		if (!modules || modules.length == 0)
			await getModules(handle, courseSlug)

		const moduleData = modules?.find((i) => i.slug == moduleSlug)
		if (!moduleData) {
			// console.log("No module data")
			setFiles([])
			return
		}
		const _module = moduleData._ref

		// console.log(
		// 	"getFiles",
		// 	handle,
		// 	`${courseSlug}: ${_course}`,
		// 	`${moduleSlug}: ${_module}`
		// )

		try {
			const response = await fetch(`/api/get/file`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ handle: handle, _module: _module }),
			})

			const data = await response.json()
			// console.log("getFiles", data)
			if (data) setFiles((l) => [...data])
			else console.log("getFiles", data)

			return data
		} catch (error) {
			console.error(error)
		}
	}

	async function authUser(email: string) {
		try {
			const response = await fetch(`/api/get/auth`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: email }),
			})

			const data = await response.json()

			console.log(data)
			if (data) setUser({ ...data })

			return data
		} catch (error) {
			console.error(error)
		}
	}

	async function uploadContent(
		handle: string,
		_course: string,
		_module: string,
		form: FormData,
		setUploadProgress: React.Dispatch<React.SetStateAction<number>>
	) {
		setUploadProgress(0)
		form.append(
			"params",
			JSON.stringify({
				handle: handle,
				_course: _course,
				_module: _module,
			})
		)
		console.log(form)
		console.log(
			JSON.stringify({
				handle: handle,
				_course: _course,
				_module: _module,
			})
		)
		try {
			const xhr = new XMLHttpRequest()

			xhr.open("POST", "/api/create/file")
			xhr.upload.addEventListener("progress", function (event) {
				if (event.lengthComputable) {
					const percentComplete = (event.loaded / event.total) * 100
					console.log(`Upload progress: ${percentComplete}%`)
					if (percentComplete < 100)
						setUploadProgress(percentComplete)
				}
			})

			xhr.onload = function () {
				if (xhr.status === 200) {
					console.log("Upload complete")
					console.log(xhr.responseText)
					setUploadProgress(100)
					return xhr.responseText
				} else {
					console.error("Upload failed")
				}
			}

			xhr.send(form)
			// const response = await fetch(`/api/create/file`, {
			// 	method: "POST",
			// 	body: form,
			// })

			// const output = await response.json()

			// console.log(output)

			// return output
		} catch (error) {
			console.error(error)
		}
	}

	async function deleteContent(handle: string, _ref: string) {
		try {
			const response = await fetch(`/api/delete/file`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ handle: handle, _ref: _ref }),
			})

			const data = await response.json()

			console.log(data)

			return data
		} catch (error) {
			console.error(error)
		}
	}

	async function readContent(handle: string, _ref: string) {
		try {
			const response = await fetch(`/api/orbot/document`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ handle: handle, _ref: _ref }),
			})

			const data = await response.json()
			console.log(data)
			return data
		} catch (error) {
			console.error(error)
		}
	}

	async function askOrbot(
		handle: string,
		query: string,
		_course?: string,
		_module?: string
	) {
		try {
			const response = await fetch(`/api/orbot/query`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					handle: handle,
					query: query,
					_course: _course,
					_module: _module,
				}),
			})
			const data = await response.json()

			return data
		} catch (error) {
			console.error(error)
		}
	}

	async function getPreview(handle: string, _ref: string) {
		try {
			const response = await fetch(`/api/orbot/preview`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					handle: handle,
					_ref: _ref,
				}),
			})

			const data = await response.json()

			return data
		} catch (error) {
			console.error(error)
		}
	}

	async function newCourse(
		handle: string,
		doc: {
			title: string
			summary: string
			icon: string
			label: string
			tags: string[]
			slug: string
		}
	) {
		try {
			const response = await fetch(`/api/create/course`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					handle: handle,
					doc: doc,
				}),
			})

			const data = await response.json()

			return data
		} catch (error) {
			console.error(error)
		}
	}

	async function newModule(
		handle: string,
		doc: {
			title: string
			duration: number
			slug: string
			_course: string
		}
	) {
		try {
			const response = await fetch(`/api/create/module`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					handle: handle,
					doc: doc,
				}),
			})

			const data = await response.json()

			return data
		} catch (error) {
			console.error(error)
		}
	}

	async function getAuth(token: string) {
		try {
			const response = await fetch(`/api/auth/validate`, {
				method: "GET",
				headers: { Authorization: token },
			})

			const data = await response.json()

			return data
		} catch (error) {
			console.error(error)
		}
	}

	return (
		<ReadContext.Provider
			value={{ overlay, user, courses, modules, files }}
		>
			<WriteContext.Provider
				value={{
					setOverlay,
					authUser,
					getCourses,
					getModules,
					getFiles,
					uploadContent,
					deleteContent,
					readContent,
					askOrbot,
					getPreview,
					newCourse,
					newModule,
					getAuth,
				}}
			>
				{children}
			</WriteContext.Provider>
		</ReadContext.Provider>
	)
}

type ReadContextType = {
	overlay: "course" | "module" | null
	user: OrbiteUser
	courses: Course[]
	modules: Module[]
	files: File[]
	// Define your context properties here
}

type WriteContextType = {
	setOverlay: React.Dispatch<React.SetStateAction<"course" | "module" | null>>
	authUser: (email: string) => Promise<any>
	getCourses: (handle: string) => Promise<any>
	getModules: (handle: string, courseSlug: string) => Promise<any>
	getFiles: (
		handle: string,
		courseSlug: string,
		moduleSlug: string
	) => Promise<any>
	uploadContent: (
		handle: string,
		_course: string,
		_module: string,
		form: FormData,
		setUploadProgress: React.Dispatch<React.SetStateAction<number>>
	) => Promise<any>
	deleteContent: (handle: string, _ref: string) => Promise<any>
	readContent: (_course: string, _ref: string) => Promise<any>
	askOrbot: (
		handle: string,
		query: string,
		_course?: string,
		_module?: string
	) => Promise<any>
	getPreview: (handle: string, _ref: string) => Promise<any>
	newCourse: (
		handle: string,
		doc: {
			title: string
			summary: string
			icon: string
			label: string
			tags: string[]
			slug: string
		}
	) => Promise<any>
	newModule: (
		handle: string,
		doc: {
			title: string
			duration: number
			slug: string
			_course: string
		}
	) => Promise<any>
	getAuth: (token: string) => Promise<any>

	// Define your context properties here
}
