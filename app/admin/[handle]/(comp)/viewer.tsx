"use client"
import * as ico from "@phosphor-icons/react"
import { useState, useRef, useEffect, useLayoutEffect, use } from "react"
import { useRouter } from "next/navigation"
import { writeContext, readContext } from "@/app/context"
import { writeAdminContext, readAdminContext } from "@/app/adminContext"

import { File } from "@/lib/@schemas"
import { DefaultExtensionType, FileIcon, defaultStyles } from "react-file-icon"

import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer"

export default function Viewer(props: { preview: boolean }) {
	const selected = readAdminContext()?.selectedFileData
	const { isText, loadingPreview } = readAdminContext()!
	const { loadFiles, setSelectedFile } = writeAdminContext()!

	const { setIsText } = writeAdminContext()!

	const markRef = useRef<HTMLSpanElement>(null)
	function formatText() {
		return selected?.slices ? selected?.slices : [selected?.text]
	}

	useEffect(() => {
		if (props.preview) setIsText(false)
	}, [props.preview])

	useEffect(() => {
		if (markRef.current) {
			const rect = markRef.current.getBoundingClientRect()
			if (
				rect.top < 0 ||
				rect.bottom > window.innerHeight ||
				rect.left < 0 ||
				rect.right > window.innerWidth
			) {
				markRef.current.scrollIntoView({
					behavior: "smooth",
					block: "nearest",
				})
			}
		}
	}, [selected?.highlight])

	return (
		<div className="relative flex-1 h-full flex flex-col">
			<div className="absolute w-fit flex flex-col h-fit p-2 right-4 top-0 opacity-50 hover:opacity-100 transition-all">
				<div className="flex w-fit select-none ">
					<div
						className={`flex w-fit h-fit cursor-pointer transition-all border-2 border-zinc-700 bg-zinc-100`}
						onClick={() => setIsText((l) => !l)}
					>
						<div
							className={`${
								isText ? "bg-zinc-500 " : "hover:bg-zinc-300"
							} h-8 w-8 flex items-center justify-center  transition-all`}
						>
							<ico.TextAa
								weight="bold"
								className={isText ? "fill-zinc-100" : ""}
							/>
						</div>
						<div
							className={`${
								!isText ? "bg-zinc-500" : "hover:bg-zinc-300"
							} h-8 w-8 flex items-center justify-center transition-all`}
						>
							<ico.Monitor
								weight="bold"
								className={!isText ? "fill-zinc-100" : ""}
							/>
						</div>
					</div>
				</div>
			</div>
			<div className="w-full  flex-1 px-2">
				{!selected || loadingPreview ? ( //No File Selected or loading
					<div className="flex h-full w-full text-5xl text-gray-400 items-center justify-center">
						{loadingPreview ? (
							// <ico.Spinner
							// 	weight="bold"
							// 	className="animate-spin"
							// />
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="50"
								height="50"
								fill="#000000"
								viewBox="0 0 256 256"
								className="animate-spin"
							>
								<defs>
									<linearGradient
										id="0"
										x1="0"
										y1="0.5"
										x2="1"
										y2="0.5"
									>
										<stop
											offset="0%"
											stop-color="#4f4f4f"
										/>
										<stop
											offset="8.33%"
											stop-color="#5b5b5b"
										/>
										<stop
											offset="16.67%"
											stop-color="#686868"
										/>
										<stop
											offset="25%"
											stop-color="#757575"
										/>
										<stop
											offset="33.33%"
											stop-color="#828282"
										/>
										<stop
											offset="41.67%"
											stop-color="#909090"
										/>
										<stop
											offset="50%"
											stop-color="#9d9d9d"
										/>
										<stop
											offset="58.33%"
											stop-color="#ababab"
										/>
										<stop
											offset="66.67%"
											stop-color="#b9b9b9"
										/>
										<stop
											offset="75%"
											stop-color="#c8c8c8"
										/>
										<stop
											offset="83.33%"
											stop-color="#d6d6d6"
										/>
										<stop
											offset="100%"
											stop-color="#f4f4f4"
										/>
									</linearGradient>
								</defs>
								<path
									fill="url(#0)"
									d="M136,32V64a8,8,0,0,1-16,0V32a8,8,0,0,1,16,0Zm37.25,58.75a8,8,0,0,0,5.66-2.35l22.63-22.62a8,8,0,0,0-11.32-11.32L167.6,77.09a8,8,0,0,0,5.65,13.66ZM224,120H192a8,8,0,0,0,0,16h32a8,8,0,0,0,0-16Zm-45.09,47.6a8,8,0,0,0-11.31,11.31l22.62,22.63a8,8,0,0,0,11.32-11.32ZM128,184a8,8,0,0,0-8,8v32a8,8,0,0,0,16,0V192A8,8,0,0,0,128,184ZM77.09,167.6,54.46,190.22a8,8,0,0,0,11.32,11.32L88.4,178.91A8,8,0,0,0,77.09,167.6ZM72,128a8,8,0,0,0-8-8H32a8,8,0,0,0,0,16H64A8,8,0,0,0,72,128ZM65.78,54.46A8,8,0,0,0,54.46,65.78L77.09,88.4A8,8,0,0,0,88.4,77.09Z"
								></path>
							</svg>
						) : (
							<p>Select a file to preview</p>
						)}
					</div>
				) : selected.isText ? ( // Text Preview
					<div className="overflow-y-auto h-screen">
						<div className="flex min-h-screen flex-col gap-4 bg-gray-300 py-6 px-28 overflow-y-auto rounded-md">
							<h2 className=" text-3xl font-bold py-2">
								{selected.file?.name}
							</h2>
							<p className=" whitespace-pre-wrap leading-snug">
								{formatText().map((slice, idx) => {
									return selected.highlight == idx ? (
										<mark
											ref={markRef}
											className=" bg-indigo-300"
										>
											{slice + " "}
										</mark>
									) : (
										<>{slice + " "}</>
									)
								})}
							</p>
						</div>
					</div>
				) : (
					// Content Preview
					<div
						className="w-full h-full bg-gray-300"
						dangerouslySetInnerHTML={{ __html: selected.content }}
					/>
					// <div className="overflow-y-auto h-screen">
					// 	<div className="flex flex-col py-10 px-28 bg-gray-300 h-fit w-full">
					// 		<h2 className=" text-3xl font-bold py-2">
					// 			{selected.file?.name + " subtitles"}
					// 		</h2>
					// 		{Array(5)
					// 			.fill(
					// 				"There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc."
					// 			)
					// 			.map((i, idx) => {
					// 				return (
					// 					<div className="flex w-full bg-zinc-900 hover:bg-zinc-700 transition-all px-4 py-2 gap-8 border-t-2 border-t-zinc-700">
					// 						<div className="flex text-zinc-400  gap-3">
					// 							<p>{idx + 1}.</p>
					// 							<div className="flex flex-col justify-between">
					// 								<p>00:00:{10 * idx + 1}</p>
					// 								<p>00:00:{10 * idx + 10}</p>
					// 							</div>
					// 						</div>
					// 						<p className="text-zinc-200  whitespace-pre-wrap leading-relaxed">
					// 							{i}
					// 						</p>
					// 					</div>
					// 				)
					// 			})}
					// 	</div>
					// </div>
				)}
			</div>
		</div>
	)
}
