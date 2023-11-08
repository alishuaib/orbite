"use client"
import {
	ChangeEventHandler,
	Dispatch,
	MouseEventHandler,
	ReactElement,
	SetStateAction,
	cloneElement,
	useEffect,
	useRef,
	useState,
} from "react"
import { useRouter } from "next/navigation"
import { readApi, writeApi } from "@/app/_context/api"
import * as Icon from "@phosphor-icons/react"
import PreviewPanel from "./Preview"
import { Toaster, toast } from "sonner"
export default function CustomizationPage() {
	const { isReady, user, chatConfig } = readApi()!
	const { saveChatConfig, setChatConfig } = writeApi()!
	const [activeTab, setActiveTab] = useState(0)

	const [isSaving, setIsSaving] = useState(false)
	function isConfigChanged() {
		if (!user) return false
		return (
			JSON.stringify(chatConfig) !=
			JSON.stringify(user?.config.chat_config)
		)
	}
	async function handleSave() {
		if (!isConfigChanged()) return
		setIsSaving(true)
		const result = await saveChatConfig()
		if (result) {
			toast.success("Changes saved successfully")
		} else {
			toast.error("Changes failed to save")
		}
		setIsSaving(false)
	}
	useEffect(() => {
		console.log(isConfigChanged(), chatConfig, user?.config.chat_config)
	}, [chatConfig])
	return (
		<div className="flex border-2 border-gray-300 flex-1 rounded-md bg-gray-100">
			<div className="flex flex-col flex-1 border-r-2 border-gray-300 h-full">
				<div className="flex border-b border-zinc-300 px-5 mt-3">
					<div
						className={`transition-all p-3 px-4 pt-2 border-b hover:border-zinc-400 hover:cursor-pointer ${
							activeTab == 0 ? "border-violet-600 font-bold" : ""
						}`}
						onClick={() => setActiveTab(0)}
					>
						General
					</div>
					{/* <div
						className={`transition-all p-3 px-4 pt-2 border-b hover:border-zinc-400 hover:cursor-pointer ${
							activeTab == 1 ? "border-violet-600 font-bold" : ""
						}`}
						onClick={() => setActiveTab(1)}
					>
						Embed Button
					</div> */}
				</div>
				{isReady && (
					<div className="px-5 mt-3 flex-col flex gap-6">
						{activeTab == 0 ? <ChatViewConfig /> : <EmbedConfig />}
					</div>
				)}
				<div className="flex mt-auto mb-3 px-5 justify-end gap-2">
					<div
						className={`transition-all p-3 px-4 pt-2 w-36 flex text-gray-300  border-gray-300 items-center justify-center rounded border-2  hover:-translate-y-1.5 hover:cursor-pointer ${
							isConfigChanged()
								? "text-gray-500  border-gray-500 "
								: "text-gray-300  border-gray-300"
						}`}
						onClick={() => setChatConfig(user?.config.chat_config!)}
					>
						{!isSaving ? (
							"Reset Changes"
						) : (
							<Icon.CircleNotch
								className="animate-spin"
								width={24}
								height={24}
							/>
						)}
					</div>
					<div
						className={`transition-all p-3 px-4 pt-2 w-36 flex items-center justify-center rounded  text-white hover:-translate-y-1.5 hover:cursor-pointer ${
							isConfigChanged() ? "bg-violet-600 " : "bg-gray-300"
						}`}
						onClick={handleSave}
					>
						{!isSaving ? (
							"Save Changes"
						) : (
							<Icon.CircleNotch
								className="animate-spin"
								width={24}
								height={24}
							/>
						)}
					</div>
				</div>
			</div>
			<div className="flex flex-[2] bg-gray-200 relative">
				<div className="absolute -top-0 left-0 w-full h-full overflow-hidden">
					<p className="relative -top-[23%] -left-[35%] text-6xl leading-loose w-[180%] -rotate-45 text-gray-300/25">
						{Array(40)
							.fill(0)
							.map((i) => "Preview")
							.join(" ")}
					</p>
				</div>
				<div className="flex w-full h-full z-20">
					<PreviewPanel />
				</div>
			</div>
			<Toaster
				position="bottom-left"
				richColors
			/>
		</div>
	)
}

function ChatViewConfig() {
	const { chatConfig } = readApi()!
	const { setChatConfig, c } = writeApi()!

	const fileInputRef = useRef(null)
	const [image, setImage] = useState<string | null>(null)
	const handleImageUpload: ChangeEventHandler<HTMLInputElement> = (event) => {
		const file = event.target.files?.[0]
		const MAX_FILE_SIZE = 30 * 1024 // 250kb
		if (file && file.size > MAX_FILE_SIZE) {
			alert("File is too large, please select a file smaller than 30kb.")
			event.target.value = ""
			return
		}
		setChatConfig((l) => {
			if (event.target.files && event.target.files[0]) {
				let object = URL.createObjectURL(event.target.files[0])
				console.log(object)
				return {
					...l!,
					logo: object,
				}
			}
			return l
		})
	}

	return (
		<>
			<div className="flex-col flex gap-2">
				<p className="text-md font-bold">Change Backdrop Logo</p>
				<div className="flex flex-wrap gap-4">
					<div className="border-2 border-gray-200 rounded p-2">
						<img
							className="grayscale opacity-50 aspect-auto h-10"
							src={
								chatConfig?.logo
									? chatConfig?.logo
									: "/logo_lg.png"
							}
							alt=""
						/>
					</div>
					<div
						onClick={() => {
							fileInputRef.current?.click()
						}}
						className="cursor-pointer flex items-center justify-center gap-4 border-gray-300 border-2 rounded px-2 hover:border-violet-600"
					>
						<div className="flex flex-col">
							<p>Upload new logo</p>
							<p className="text-gray-500 text-sm">
								Max file size 30kb
							</p>
						</div>
						<Icon.Upload
							width={34}
							height={34}
						/>
						<input
							hidden
							ref={fileInputRef}
							type="file"
							accept="image/*"
							onChange={handleImageUpload}
						/>
					</div>
					{chatConfig?.logo && (
						<div
							onClick={() => {
								setChatConfig((l) => ({ ...l!, logo: null }))
							}}
							className="cursor-pointer flex items-center justify-center gap-4 text-red-600 border-gray-300 border-2 rounded px-2 hover:border-red-600"
						>
							<div className="flex flex-col">
								<p>Reset logo</p>
								<p className="text-red-400 text-sm">
									Restore default logo
								</p>
							</div>
							<Icon.TrashSimple
								width={34}
								height={34}
							/>
						</div>
					)}
				</div>
			</div>
			<div className="flex-col flex gap-2">
				<p className="text-md font-bold">Change Primary Color</p>
				<div className="flex gap-4 flex-wrap">
					{[
						"bg-gray-200",
						"bg-rose-200",
						"bg-pink-200",
						"bg-fuchsia-200",
						"bg-purple-200",
						"bg-violet-200",
						"bg-indigo-200",
						"bg-blue-200",
						"bg-sky-200",
						"bg-cyan-200",
						"bg-teal-200",
						"bg-emerald-200",
						"bg-green-200",
						"bg-lime-200",
						"bg-yellow-200",
						"bg-amber-200",
						"bg-orange-200",
						"bg-red-200",
					].map((i) => {
						const isActive = c("bg", "200", 0).trimEnd() == i
						return (
							<div
								className={`${i} relative rounded-full w-10 h-10 border-2 cursor-pointer ${
									isActive
										? "border-violet-900"
										: "border-transparent"
								} `}
								onClick={() =>
									setChatConfig((l) => ({
										...l!,
										primary_color: i.split("-")[1],
									}))
								}
							>
								{isActive && (
									<div className="absolute -top-1 -right-1 rounded-full p-1 w-5 h-5 bg-violet-900">
										<Icon.CheckFat
											weight="fill"
											className="text-white w-full h-full  rounded-full"
										/>
									</div>
								)}
							</div>
						)
					})}
				</div>
			</div>
			<div className="flex-col flex gap-2">
				<p className="text-md font-bold">Change Secondary Color</p>
				<div className="flex gap-4 flex-wrap">
					{[
						"bg-gray-500",
						"bg-rose-500",
						"bg-pink-500",
						"bg-fuchsia-500",
						"bg-purple-500",
						"bg-violet-500",
						"bg-indigo-500",
						"bg-blue-500",
						"bg-sky-500",
						"bg-cyan-500",
						"bg-teal-500",
						"bg-emerald-500",
						"bg-green-500",
						"bg-lime-500",
						"bg-yellow-500",
						"bg-amber-500",
						"bg-orange-500",
						"bg-red-500",
					].map((i) => {
						const isActive = c("bg", "500", 1).trimEnd() == i
						return (
							<div
								className={`${i} relative rounded-full w-10 h-10 border-2 cursor-pointer ${
									isActive
										? "border-violet-900"
										: "border-transparent"
								} `}
								onClick={() =>
									setChatConfig((l) => ({
										...l!,
										secondary_color: i.split("-")[1],
									}))
								}
							>
								{isActive && (
									<div className="absolute -top-1 -right-1 rounded-full p-1 w-5 h-5 bg-violet-900">
										<Icon.CheckFat
											weight="fill"
											className="text-white w-full h-full  rounded-full"
										/>
									</div>
								)}
							</div>
						)
					})}
				</div>
			</div>
		</>
	)
}

function EmbedConfig() {
	const { chatConfig } = readApi()!
	const { setChatConfig } = writeApi()!
	return <div></div>
}
