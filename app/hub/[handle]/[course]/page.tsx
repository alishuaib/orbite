"use client"
import { writeAdminContext } from "@/app/adminContext"
import { readContext, writeContext } from "@/app/context"
import { Course } from "@/lib/@schemas"
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

type Params = {
	handle: string
	course: string
}

export default function CoursePage({ params }: { params: Params }) {
	const { push } = useRouter()
	const modules = readContext()?.modules
	const courses = readContext()?.courses
	const getModules = writeContext()?.getModules!
	const setHandle = writeAdminContext()!.setHandle
	const { setSelectedFile, setHighlight } = writeAdminContext()!

	useEffect(() => {
		setHandle(params.handle)
	}, [])
	const [courseData, setCourseData] = useState<Course>()

	useEffect(() => {
		getModules(params.handle, params.course)
	}, [courseData])

	useEffect(() => {
		let data = courses?.find((i) => i.slug == params.course)
		setCourseData(data ? { ...data } : undefined)
	}, [courses])

	return (
		<main className="h-screen w-screen flex bg-gray-100">
			<div className="flex flex-none w-1/3 bg-gray-200">
				<div className="w-full relative h-full rounded-md group flex items-center overflow-hidden transition-all ease-linear ">
					<div className="cursor-pointer relative w-full h-full flex flex-none items-end bg-gray-200 z-10">
						<div className="absolute left-0 top-8 text-lg text-white px-3 py-1 bg-gray-500 z-10">
							<p>{courseData?.label}</p>
						</div>
						<div
							className="flex px-4 py-12 z-10 justify-between items-center w-full"
							onClick={() => {
								push(`/hub/${params.handle}`)
							}}
						>
							<h2 className="font-bold w-2/3 text-5xl text-gray-500">
								{courseData?.title}
							</h2>
							<ArrowLeft
								className="w-20 h-20 fill-gray-500"
								weight="light"
							/>
						</div>
						<div className="w-full h-full absolute overflow-hidden z-0 after:h-full after:w-full after:absolute after:bg-gradient-to-tr after:from-gray-200 after:from-45%">
							<img
								className="absolute -right-1/4 top-0 aspect-auto w-3/4 opacity-100 -z-10"
								src={`/${courseData?.icon}`}
								alt=""
							/>
						</div>
					</div>
				</div>
			</div>
			<div className="flex flex-1 flex-col">
				<div className="flex px-8 py-6 flex-none">
					<h1 className="text-3xl">Modules</h1>
				</div>
				<div className="flex-1 grid grid-cols-2 overflow-y-auto px-8 gap-4 content-start">
					{modules?.map((item, idx) => {
						return (
							<div
								key={item._ref}
								className=" bg-gray-200 flex  h-fit p-3 rounded-sm items-center hover:bg-gray-400 transition-all cursor-pointer"
								onClick={() => {
									setSelectedFile("")
									setHighlight(null)
									push(`${window.location}/${item.slug}`)
								}}
							>
								<div className="flex flex-col flex-1">
									<h2 className="text-lg">{item.title}</h2>
									<p className="text-sm">
										Duration: {item.duration}Min
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
