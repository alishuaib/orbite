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
import ChatPage from "../chat/page"

export default function Embed({ byPassAuth: byPassAuth = false }) {
	//Session Validation
	const { courses, isReady, user, chatConfig } = readApi()!
	const { validateSession, c } = writeApi()!
	const searchParams = useSearchParams()!
	const session_token = searchParams.get("session")
	const [session, setSession] = useState<Session | null>(null)
	const [isValidSession, setValidSession] = useState(true)

	async function authSession(token: string) {
		const session = await validateSession(token)
		if (!session) return setValidSession(false)
		setSession(session.session)

		console.log("Chat session for " + session.username + " started")
		startPromptTimer()
	}
	useEffect(() => {
		if (byPassAuth) return setChat(true)
		if (session_token && !user) {
			authSession(session_token)
		} else {
			setValidSession(false)
		}
	}, [session_token])

	//Handle Chat and Message prompt
	const [showChat, setChat] = useState(false)
	const [isVisible, setVisible] = useState(true)
	const [timer, setTimer] = useState(0)
	function startPromptTimer() {
		const time = 5
		const initialOffset = 31.42
		let sec = 0

		const interval = setInterval(function () {
			if (sec >= time) return endTimer()
			setTimer((sec + 0.1) * (initialOffset / time))
			sec += 0.1
		}, 100)
		function endTimer() {
			setTimer(0)
			setVisible(false)
			clearInterval(interval)
		}
	}

	//Button
	function triggerChat() {
		setChat((l) => !l)
		setVisible(false)
	}
	enum SessionStates {
		SESSION_INVALID = "SESSION_INVALID",
		AUTHORIZING = "AUTHORIZING",
		CHAT_CLOSED = "CHAT_CLOSED",
		CHAT_OPEN = "CHAT_OPEN",
	}
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
				onClick={triggerChat}
				className="text-white pointer-events-auto"
				width={32}
				height={32}
			/>
		),
		[SessionStates.CHAT_OPEN]: (
			<Icon.X
				onClick={triggerChat}
				className="text-white pointer-events-auto"
				width={32}
				height={32}
			/>
		),
	}
	function getSessionState() {
		if (!isValidSession) return SessionStates.SESSION_INVALID
		if (!isReady) return SessionStates.AUTHORIZING
		if (!showChat) return SessionStates.CHAT_CLOSED
		return SessionStates.CHAT_OPEN
	}
	//Animation
	const parent = {
		visible: { width: 250, opacity: 1, transition: { duration: 1 } },
		hidden: { width: 0, opacity: 0, transition: { duration: 1 } },
	}
	const child = {
		visible: { opacity: 1, transition: { duration: 1, delay: 0.5 } },
		hidden: { opacity: 0, transition: { duration: 1 } },
	}
	//Customization

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
		<div className="absolute bottom-0 right-0 flex items-end justify-end w-[520px] h-screen overflow-hidden pointer-events-none">
			<motion.div
				animate={showChat ? "visible" : "hidden"}
				variants={{
					visible: { right: 450 },
					hidden: { right: 18 },
				}}
				className={`relative bottom-4 right-4 cursor-pointer ${
					class_color[getSessionState()]
				} p-3 rounded-xl border-b-4 shadow-sm  active:border-b-0 hover:brightness-90`}
			>
				<motion.div
					initial={{ width: 0, opacity: 0 }}
					animate={timer > 0 ? "visible" : "hidden"}
					variants={parent}
					className="absolute bottom-0 right-[105%] py-2 px-4 bg-gradient-to-r from-indigo-400 to-indigo-600 text-white rounded-3xl rounded-br-none whitespace-nowrap overflow-hidden"
				>
					Have a question? Try asking <br /> your personal AI
					assistant!
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
				{button[getSessionState()]}
			</motion.div>
			<motion.div
				initial={{ right: -430 }}
				animate={showChat ? "visible" : "hidden"}
				variants={{ visible: { right: 0 }, hidden: { right: -430 } }}
				className="absolute h-screen w-[430px] "
			>
				{showChat && <ChatPage session={session} />}
			</motion.div>
		</div>
	)
}
