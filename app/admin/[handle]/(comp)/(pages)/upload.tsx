// UNUSED COMPONENT

// "use client"
// import * as ico from "@phosphor-icons/react"
// import { useState, useRef, useEffect, useLayoutEffect, use } from "react"
// import { useRouter } from "next/navigation"
// import { writeContext, readContext } from "@/app/context"
// import { writeAdminContext, readAdminContext } from "@/app/adminContext"
// import { Course, File, Module } from "@/lib/@schemas"
// import { DefaultExtensionType, FileIcon, defaultStyles } from "react-file-icon"
// import { useDropzone } from "react-dropzone"
// import { toast } from "sonner"

// export default function UploadPage() {
// 	const { handle, courses, modules, files, isText } = readAdminContext()!
// 	const getCourses = writeContext()?.getCourses!
// 	//Content Variables
// 	const { acceptedFiles, getRootProps, getInputProps, inputRef } =
// 		useDropzone({ maxFiles: 1 })

// 	const courseSelectRef = useRef<HTMLSelectElement>(null)
// 	// const filesList = acceptedFiles.map((file) => console.log(file))
// 	useEffect(() => {
// 		console.log(acceptedFiles)
// 	}, [acceptedFiles])

// 	function uploadSCORM() {
// 		const formData = new FormData()
// 		formData.append("file", acceptedFiles[0])
// 		formData.append(
// 			"params",
// 			JSON.stringify({
// 				handle: handle,
// 				_course: courseSelectRef.current?.value!,
// 			})
// 		)

// 		fetch("/api/create/scorm", {
// 			method: "POST",
// 			body: formData,
// 		}).then((res) => {
// 			if (res.status == 200) {
// 				res.json().then((data) => {
// 					console.log(data)
// 				})
// 				//Reload all content
// 				getCourses(handle)
// 				toast.success(
// 					`Successfully uploaded course\n${acceptedFiles[0].name}`
// 				)
// 			} else {
// 				toast.error(`Error uploading course\n${acceptedFiles[0].name}`)
// 			}
// 		})
// 	}

// 	return (
// 		<>
// 			<div className="border-zinc-500 border-b flex w-full text-2xl px-2 h-16 items-center gap-2 flex-none">
// 				<h2 className="flex-1">SCORM Course Upload</h2>
// 			</div>
// 			<div className="w-full flex flex-none items-center justify-center">
// 				<div className="flex p-4 aspect-square w-3/4 justify-center container">
// 					<div
// 						{...getRootProps({
// 							className:
// 								"dropzone flex flex-col justify-center items-center text-zinc-300  h-full w-full border-2 border-zinc-400 border-dashed rounded-md text-2xl cursor-pointer",
// 						})}
// 					>
// 						<input {...getInputProps()} />
// 						{acceptedFiles.length == 0 ? (
// 							<>
// 								<ico.UploadSimple className="w-1/2 h-1/2" />
// 								<p>Upload a .zip</p>
// 							</>
// 						) : (
// 							<>
// 								{acceptedFiles.map((file) => (
// 									<div
// 										key={file.size}
// 										className="relative flex flex-col gap-1 items-center justify-center w-fit aspect-square px-2 bg-zinc-700 text-zinc-100 rounded-md text-lg"
// 										id="fileDisplay"
// 									>
// 										<style>
// 											{
// 												"#fileDisplay svg {width: 4rem; height: 4rem;}"
// 											}
// 										</style>
// 										<FileIcon
// 											extension={
// 												file.name.split(".").pop()!
// 											}
// 											{...defaultStyles[
// 												file.name
// 													.split(".")
// 													.pop()! as DefaultExtensionType
// 											]}
// 										/>
// 										<div className="flex items-center ">
// 											<p>{file.name}</p>
// 											<div
// 												className={`flex items-center justify-center rounded-md hover:bg-red-200 h-8 w-8 transition-all absolute -top-3 -right-3`}
// 												onClick={(e) => {
// 													inputRef.current!.value = ""
// 													acceptedFiles.pop()
// 												}}
// 											>
// 												<ico.Swap
// 													className="fill-red-600"
// 													weight="duotone"
// 												/>
// 											</div>
// 										</div>
// 									</div>
// 								))}
// 							</>
// 						)}
// 					</div>
// 				</div>
// 			</div>
// 			<div className="flex flex-1 w-full">
// 				{acceptedFiles.length == 0 ? (
// 					<></>
// 				) : (
// 					<div className="h-full flex flex-col w-full gap-4">
// 						<div className="flex flex-col w-full gap-2 items-center ">
// 							<p>Select a Course:</p>
// 							<select
// 								name="course"
// 								id=""
// 								className="rounded-md bg-zinc-700 py-1 px-3"
// 								ref={courseSelectRef}
// 							>
// 								<option
// 									value=""
// 									className="italic text-zinc-400"
// 									disabled
// 								>
// 									No Course Selected
// 								</option>
// 								{courses ? (
// 									courses.map((course, i) => {
// 										return (
// 											<option
// 												key={i}
// 												value={course._ref}
// 											>
// 												{course.title}
// 											</option>
// 										)
// 									})
// 								) : (
// 									<></>
// 								)}
// 							</select>
// 						</div>
// 						<div className="flex justify-center">
// 							<p
// 								onClick={uploadSCORM}
// 								className="px-3 py-1 bg-lime-300 rounded-md text-zinc-600 font-bold cursor-pointer hover:scale-90 transition-all"
// 							>
// 								Upload
// 							</p>
// 						</div>
// 					</div>
// 				)}
// 			</div>
// 		</>
// 	)
// }
