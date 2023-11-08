"use client"
import {
	MouseEventHandler,
	ReactElement,
	cloneElement,
	use,
	useEffect,
	useState,
} from "react"
import { useRouter } from "next/navigation"
import { readApi, writeApi } from "@/app/_context/api"
import * as Icon from "@phosphor-icons/react"
import * as T from "@/lib/@schemas"
import { Prisma } from "@prisma/client"
import FileIcon from "../_c/FileIcon"

type NavigationSelected = {
	course?: number
	section?: number
	module?: number
	content?: number
}
export default function Preview({
	selected,
	setSelected,
}: {
	selected: NavigationSelected
	setSelected: React.Dispatch<React.SetStateAction<NavigationSelected>>
}) {
	const courses = readApi()?.courses

	const content = courses
		?.find((c) => c.id == selected.course)
		?.sections.find((s) => s.id == selected.section)
		?.modules.find((m) => m.id == selected.module)
		?.contents.find((c) => c.id == selected.content)

	const { getPreview } = writeApi()!
	const [preview, setPreview] = useState<T.Preview | null>(null)

	useEffect(() => {
		let isCancelled = false

		const fetchCourses = async () => {
			if (!selected.content) return
			const response = await getPreview(selected.content)
			if (!isCancelled && response) {
				setPreview(response)
			}
		}

		fetchCourses()

		return () => {
			isCancelled = true
		}
	}, [])

	return (
		<div className="absolute top-0 left-0 backdrop-blur-sm w-screen h-screen flex">
			<div className="flex-1 flex items-center justify-center">
				<div className="flex flex-col bg-gray-800 rounded aspect-square w-1/2 p-4 text-white gap-4">
					{content && (
						<>
							<div className="flex items-center gap-3">
								<FileIcon ext={content.ext} />
								<p className="text-xl">
									{content.name + "." + content.ext}
								</p>
							</div>
							<div className="flex flex-col gap-1">
								<p className="text-lg font-bold">|| Details</p>
								<div className="flex gap-3">
									<p className="font-bold">File Size:</p>
									<p>{content.size}Mb</p>
								</div>
								<div className="flex gap-3">
									<p className="font-bold">Mimetype:</p>
									<p>{content.mimetype}</p>
								</div>
								<div className="flex gap-3">
									<p className="font-bold">
										Last Modified at:
									</p>
									<p>{content.modified_at}</p>
								</div>
								<div className="flex gap-3">
									<p className="font-bold">Version:</p>
									<p>{content.version}</p>
								</div>
							</div>
						</>
					)}
				</div>
			</div>
			<div className="relative flex-1 flex bg-gray-800 rounded p-4 px-36">
				<div className="absolute top-4 right-4">
					<Icon.XSquare
						width={34}
						height={34}
						className="text-white hover:cursor-pointer"
						onClick={() => {
							setSelected({ ...selected, content: undefined })
						}}
					></Icon.XSquare>
				</div>
				<div
					className={`p-4 overflow-y-scroll flex flex-1 bg-slate-50 ${
						!preview && "animate-pulse"
					}`}
				>
					{preview && preview.text.join("\n")}
				</div>
			</div>
		</div>
	)
}
