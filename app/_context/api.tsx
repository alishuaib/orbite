"use client"
//NextJS has React Strict Mode auto enabled for Development
// This is why the Context will re-render twice only during development phase
import React, {
	useContext,
	useState,
	useEffect,
	useRef,
	useTransition,
	use,
	useMemo,
} from "react"
import { useAuth } from "@clerk/nextjs"

import * as T from "@/lib/@schemas"
import DashboardLoading from "../dashboard/_c/Loading"
import { set } from "zod"

export default function ApiContext({
	children,
}: {
	children: React.ReactNode
}): JSX.Element {
	const { isLoaded, userId, sessionId, getToken } = useAuth()

	const [userState, setUser] = useState<T.User>()
	const user = useMemo(() => userState, [userState])
	const [chatConfig, setChatConfig] =
		useState<T.User["config"]["chat_config"]>(null)

	const [isReady, setReady] = useState(false)
	const [overlay, setOverlay] = useState<React.ReactNode>(null)

	const [courses, setCourses] = useState<T.Course[] | undefined | null>(
		undefined
	)
	const [sections, setSections] = useState<T.Section[]>([])
	const [modules, setModules] = useState<T.Module[]>([])
	const [contents, setContents] = useState<T.Content[]>([])

	async function query(
		route:
			| "sync/course"
			| "sync/section"
			| "sync/module"
			| "sync/content"
			| "preview"
			| "orbite/generate",
		method: "GET" | "POST" | "PATCH" | "DELETE",
		body: object = {}
	) {
		if (!user) throw Error("Attempted to query without user authorized")
		//Safetynet for unimplemented features
		if (
			route == "sync/content" &&
			(method == "POST" || method == "PATCH")
		) {
			console.error("Unimplemented feature to upload content")
			return
		}
		try {
			const query = await fetch(`/api/v1/${route}?method=${method}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-orbite-api-key": user?.auth.API_KEY as string,
				},
				body: JSON.stringify(body),
			})

			const data = await query.json()

			return data
		} catch (error) {
			console.error(error)
			return undefined
		}
	}

	async function getCourses() {
		const data = await query("sync/course", "GET", { course: {} })
		if (data) {
			setCourses((l) => [...data.data])
			return data.data
		}
		return data
	}
	useEffect(() => {
		if (!courses) return
		let sections = courses
			.map((course) =>
				course.sections.map((section) => {
					return { ...section, auth: course.auth, parent: course }
				})
			)
			.flat()

		let modules = sections
			.map((section) =>
				section.modules.map((module) => {
					return { ...module, auth: section.auth, parent: section }
				})
			)
			.flat()
		let contents = modules
			.map((module) =>
				module.contents.map((content) => {
					return { ...content, auth: module.auth, parent: module }
				})
			)
			.flat()
		setSections(sections)
		setModules(modules)
		setContents(contents)
	}, [courses])

	async function getOneSection(id: number) {
		const data = await query("sync/section", "GET", {
			module: {
				id: [id],
			},
		})
		return data
	}

	async function getOneModule(id: number) {
		const data = await query("sync/module", "GET", {
			module: {
				id: [id],
			},
		})
		return data
	}

	async function getContents(id: [number]) {
		const data = await query("sync/content", "GET", {
			content: {
				id: id,
			},
		})
		return data
	}

	async function getPreview(id: number) {
		const data = await query("preview", "GET", {
			content: {
				id: id,
			},
		})
		if (data) return data.data
		return data
	}

	async function authenticateUser(user_id: string) {
		//From Clerk Session
		if (user) return user
		try {
			const query = await fetch(
				`/api/auth/user?` +
					new URLSearchParams({
						method: "GET",
					}),
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						user: {
							id: user_id,
						},
					}),
				}
			)

			const data = await query.json()

			if (data) setUser({ ...data.data })
			if (process.env.NODE_ENV == "development") console.log(data)
			setReady(true)
			return data
		} catch (error) {
			console.error(error)
			setReady(false)
		}
	}
	useEffect(() => {
		if (!isLoaded || !userId) return setReady(false)
		authenticateUser(userId)
	}, [userId])
	useEffect(() => {
		if (!user) return
		setChatConfig(user.config.chat_config)
	}, [user])

	async function validateSession(token: string) {
		try {
			const query = await fetch(`/api/auth/session`, {
				method: "POST",
				headers: { Authorization: token },
			})

			const data = await query.json()

			if (data) setUser({ ...data.data })
			if (process.env.NODE_ENV == "development") console.log(data)
			setReady(true)
			return data.data
		} catch (error) {
			console.error(error)
			setReady(false)
			return null
		}
	}

	async function saveChatConfig(file?: File) {
		try {
			if (!user) throw Error("Attempted to save config without user")
			if (
				JSON.stringify(chatConfig) ==
				JSON.stringify(user?.config.chat_config)
			)
				return null
			let file: File | null = null
			if (chatConfig?.logo?.startsWith("blob:")) {
				const response = await fetch(chatConfig.logo)
				const blob = await response.blob()
				file = new File([blob], "chatlogo", { type: blob.type })
			}
			const form = new FormData()
			form.append(
				"body",
				JSON.stringify({ chatCustomization: chatConfig })
			)
			if (file) form.append("file", file)
			const response = await fetch("/api/v1/user/config?method=PATCH", {
				method: "POST",
				headers: {
					"x-orbite-api-key": user?.auth.API_KEY as string,
				},
				body: form,
			})

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}
			const data = await response.json()
			return data.data
		} catch (error) {
			console.error("Upload failed", error)
			return null
		}
	}

	async function generateAnswer(course_id: number, question: string) {
		const data = await query("orbite/generate", "GET", {
			course: {
				id: course_id,
			},
			query: question,
		})
		if (data) return data.data
		return data
	}

	async function stripeCheckout(priceId: string) {
		try {
			const query = await fetch(`/api/auth/stripe/checkout?method=POST`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-orbite-api-key": user?.auth.API_KEY as string,
				},
				body: JSON.stringify({
					plan: {
						id: priceId,
					},
				}),
			})

			const data = await query.json()

			if (process.env.NODE_ENV == "development") console.log(data)

			return data.data
		} catch (error) {
			console.error(error)
			return null
		}
	}

	async function stripeCheckoutSession(session_id: string) {
		try {
			const query = await fetch(`/api/auth/stripe/checkout?method=GET`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-orbite-api-key": user?.auth.API_KEY as string,
				},
				body: JSON.stringify({
					session_id: session_id,
				}),
			})

			const data = await query.json()

			if (process.env.NODE_ENV == "development") console.log(data)

			return data.data
		} catch (error) {
			console.error(error)
			return null
		}
	}

	async function stripeIntent(body: object) {
		try {
			const query = await fetch(
				`/api/auth/stripe/subscription?method=POST`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"x-orbite-api-key": user?.auth.API_KEY as string,
					},
					body: JSON.stringify(body),
				}
			)

			const data = await query.json()

			if (process.env.NODE_ENV == "development") console.log(data)

			return data.data
		} catch (error) {
			console.error(error)
			return null
		}
	}

	//Unimplemneted file upload feature
	async function uploadContent(
		form: FormData,
		setUploadProgress: React.Dispatch<React.SetStateAction<number>>,
		method: "POST" | "PATCH" = "POST"
	) {
		return
		setUploadProgress(0)
		try {
			const xhr = new XMLHttpRequest()

			xhr.open("POST", `/api/v1/content?method=${method}`)
			xhr.setRequestHeader(
				"x-orbite-api-key",
				user?.auth.API_KEY as string
			)

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
		} catch (error) {
			console.error(error)
		}
	}

	//Utility function to handle custom colors
	function c(attribute: string, blend: string, color: 0 | 1 = 0) {
		//Ex: c("bg", "200", 1) => "bg-violet-200 "
		return (
			attribute +
			"-" +
			chatConfig?.[color == 0 ? "primary_color" : "secondary_color"] +
			"-" +
			blend +
			" "
		)
	}

	return (
		<ReadContext.Provider
			value={{
				user,
				courses,
				sections,
				modules,
				contents,
				isReady,
				chatConfig,
				overlay,
			}}
		>
			<WriteContext.Provider
				value={{
					getCourses,
					getOneSection,
					getOneModule,
					getContents,
					getPreview,
					authenticateUser,
					validateSession,
					generateAnswer,
					saveChatConfig,
					setChatConfig,
					c,
					setOverlay,
					stripeCheckout,
					stripeCheckoutSession,
				}}
			>
				{children}
			</WriteContext.Provider>
		</ReadContext.Provider>
	)
}

const ReadContext = React.createContext<ReadContextType | undefined>(undefined)
const WriteContext = React.createContext<WriteContextType | undefined>(
	undefined
)

export function readApi(): ReadContextType | undefined {
	return useContext(ReadContext)
}

export function writeApi(): WriteContextType | undefined {
	return useContext(WriteContext)
}

type ReadContextType = {
	user: T.User | undefined
	courses: T.Course[] | undefined | null
	sections: T.Section[]
	modules: T.Module[]
	contents: T.Content[]
	isReady: boolean
	chatConfig: T.User["config"]["chat_config"] | undefined
	overlay: React.ReactNode
}

type WriteContextType = {
	getCourses: () => Promise<T.Course[] | undefined>
	getOneSection: (id: number) => Promise<T.Section | undefined>
	getOneModule: (id: number) => Promise<T.Module | undefined>
	getContents: (id: [number]) => Promise<T.Content[] | undefined>
	getPreview: (id: number) => Promise<T.Preview | undefined>
	authenticateUser: (user_id: string) => Promise<T.User | undefined>
	validateSession: (
		token: string
	) => Promise<(T.User & { session: T.Session }) | undefined>
	generateAnswer: (
		course_id: number,
		question: string
	) => Promise<T.GenerativeAnswer | undefined>
	saveChatConfig: (file?: File) => Promise<object | null>
	setChatConfig: React.Dispatch<
		React.SetStateAction<T.User["config"]["chat_config"]>
	>
	c: (attribute: string, blend: string, color?: 0 | 1) => string
	setOverlay: React.Dispatch<React.SetStateAction<React.ReactNode>>
	stripeCheckout: (priceId: string) => Promise<object | null>
	stripeCheckoutSession: (session_id: string) => Promise<object | null>
}
