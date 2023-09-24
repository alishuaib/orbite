"use client"
import NavBtn from "@/app/(comp)/navbtn"
import { useEffect, useRef, useState } from "react"
import {
	CaretLeft,
	ArrowRight,
	HouseSimple,
	ArrowLeft,
} from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { readContext, writeContext } from "@/app/context"
import { DefaultExtensionType, FileIcon, defaultStyles } from "react-file-icon"
import { Course, Module } from "@/lib/@schemas"
import { readAdminContext, writeAdminContext } from "@/app/adminContext"
import Viewer from "@/app/admin/[handle]/(comp)/viewer"

type Params = {
	handle: string
	course: string
	module: string
}

export default function ModulePage({ params }: { params: Params }) {
	const [sidepanel, setSidepanel] = useState(false)
	const { push } = useRouter()
	const files = readContext()?.files
	const modules = readContext()?.modules
	const courses = readContext()?.courses
	const { selectedFile, selectedFileData } = readAdminContext()!
	const { setSelectedFile, setHighlight } = writeAdminContext()!
	// const uploadProgress = readContext()?.uploadProgress
	const getFiles = writeContext()?.getFiles!
	const uploadContent = writeContext()?.uploadContent!
	const setHandle = writeAdminContext()!.setHandle
	useEffect(() => {
		setHandle(params.handle)
	}, [])
	const [courseData, setCourseData] = useState<Course>()
	const [moduleData, setModuleData] = useState<Module>()

	const fileInput = useRef<HTMLInputElement>(null)
	const [filesList, setFilesList] = useState<File[]>([])

	useEffect(() => {
		getFiles(params.handle, params.course, params.module)
	}, [moduleData])

	useEffect(() => {
		getFiles(params.handle, params.course, params.module)
	}, [courseData])

	useEffect(() => {
		let data = courses?.find((i) => i.slug == params.course)
		setCourseData(data ? { ...data } : undefined)
	}, [courses])

	useEffect(() => {
		let data = modules?.find((i) => i.slug == params.module)
		setModuleData(data ? { ...data } : undefined)
	}, [modules])

	useEffect(() => {
		if (files && files.length > 0 && selectedFile == "") {
			setSelectedFile(files[0]._ref)
		}
	}, [files])

	// function onFileUpload() {
	// 	const files = fileInput.current?.files || []
	// 	const formData = new FormData()
	// 	for (let i = 0; i < files.length; i++) {
	// 		formData.append("file", files[i])
	// 	}

	// 	uploadContent(
	// 		params.handle,
	// 		courseData?._ref,
	// 		moduleData?._ref,
	// 		formData
	// 	)
	// }

	return (
		<main className="h-screen w-screen flex items-center bg-gray-100 overflow-hidden">
			<NavBtn override="absolute top-4 left-4">
				<HouseSimple color="#7B7E88" />
			</NavBtn>
			<NavBtn
				override="absolute bottom-4 left-4"
				href={`/hub/${params.handle}/${params.course}`}
			>
				<ArrowLeft color="#7B7E88" />
			</NavBtn>
			<div className="relative left-4 flex flex-col h-fit items-center z-30">
				{modules?.map((item, i) => {
					let active = item.slug == params.module

					return (
						<div
							key={item._ref}
							className="group cursor-pointer py-2 "
							onClick={() => {
								setSelectedFile("")
								setHighlight(null)
								push(
									window.location
										.toString()
										.replace(params.module, item.slug)
								)
							}}
						>
							<div
								className={`
                    ${
						active
							? "w-5 h-5 bg-gradient-to-br from-indigo-400 via-purple-400 to-fuchsia-400"
							: "w-4 h-4 bg-gray-300"
					} rounded-full relative`}
							>
								<div className="pointer-events-none group-hover:left-7 group-hover:opacity-100 transition-all ease-linear opacity-0 absolute top-0 bottom-0 m-auto left-4 whitespace-nowrap py-1 px-3 bg-gray-200 w-fit h-fit">
									{item.title}
								</div>
							</div>
						</div>
					)
				})}
			</div>
			<div className="relative left-8 flex flex-col h-fit items-center z-20">
				{files?.map((item, i) => {
					let active = item._ref == selectedFile

					return (
						<div
							key={item._ref}
							className="group cursor-pointer py-2 "
							onClick={() => {
								setSelectedFile(item._ref)
								setHighlight(null)
							}}
						>
							<div
								className={`
                    ${
						active
							? "w-4 h-4 bg-gradient-to-br from-indigo-400 via-purple-400 to-fuchsia-400"
							: "w-3 h-3 bg-gray-300"
					} rounded-sm relative`}
							>
								<div className="pointer-events-none group-hover:left-7 group-hover:opacity-100 transition-all ease-linear opacity-0 absolute top-0 bottom-0 m-auto left-4 whitespace-nowrap py-1 px-3 bg-gray-200 w-fit h-fit">
									{item.name}
								</div>
							</div>
						</div>
					)
				})}
			</div>
			<div className="flex flex-col flex-1 h-screen w-2/5 items-center justify-center gap-4">
				<div className="w-4/5 h-screen bg-gray-200 flex flex-col gap-2 items-center justify-center">
					<div className="flex w-full h-full">
						<Viewer preview></Viewer>
					</div>
				</div>
				{/* <div className="flex flex-col h-fit items-center text-gray-500">
					<h2 className="text-2xl">{moduleData?.title}</h2>
					<p className="text-lg">{courseData?.title}</p>
				</div> */}
			</div>
			<div
				className={`absolute ${
					sidepanel ? "-right-0" : "-right-80"
				} transition-all top-0 h-screen bg-gray-200 w-80 flex`}
			>
				<div
					onClick={() => setSidepanel((l) => !l)}
					className="absolute cursor-pointer top-0 bottom-0 -left-9 w-10 h-14 m-auto bg-gray-200 flex justify-center items-center rounded-lg"
				>
					<CaretLeft
						className={`${sidepanel ? "rotate-180" : "rotate-0"}`}
					></CaretLeft>
				</div>
				<div className="flex flex-col gap-4 w-full max-h-screen overflow-x-auto py-4 px-4">
					{modules?.map((item, i) => {
						return (
							<div
								key={item._ref}
								className=" bg-gray-100 flex w-full p-3 rounded-sm items-center hover:bg-gray-400 transition-all cursor-pointer"
								onClick={() => {
									setSelectedFile("")
									setHighlight(null)
									push(
										window.location
											.toString()
											.replace(params.module, item.slug)
									)
								}}
							>
								<div className="flex flex-col flex-1">
									<h2 className="text-lg">{item.title}</h2>
									<p className="text-sm">
										Duration: {item.duration} Min
									</p>
								</div>
								<ArrowRight
									width={34}
									height={34}
								></ArrowRight>
							</div>
						)
					})}
				</div>
			</div>
		</main>
	)
}
