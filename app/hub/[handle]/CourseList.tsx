"use client"
import * as Icon from "@phosphor-icons/react"
import { useState, useRef, useEffect, useLayoutEffect } from "react"
import { useRouter } from "next/navigation"
import { writeContext, readContext } from "@/app/context"
import { Course } from "@/lib/@schemas"

export default function CourseList(props: { _handle: string }) {
	const [toggleSearch, setToggleSearch] = useState(false)
	const setOverlay = writeContext()?.setOverlay!
	const getCourses = writeContext()?.getCourses!
	const courses = readContext()?.courses

	useEffect(() => {
		getCourses(props._handle)
	}, [])

	return (
		<div className="flex flex-col flex-none px-4">
			{/* Course Content Here w/Loading Skeleton*/}
			<div className="flex gap-4 w-full h-fit flex-none items-center py-4">
				<h2 className="text-gray-500 text-3xl">Courses</h2>
				<div
					className={`transition-all flex border-2 p-1 rounded ${
						toggleSearch ? "border-gray-200" : "border-gray-500"
					}`}
				>
					<input
						className={`${
							toggleSearch ? "max-w-2xl px-2" : "max-w-0"
						} box-border outline-none focus:ring focus:ring-gray-300 transition-all bg-transparent border-b-2 border-b-gray-500`}
						type="text"
					/>
					<Icon.MagnifyingGlass
						onClick={() => setToggleSearch((l) => !l)}
						className=" transition-all hover:scale-90 cursor-pointer fill-gray-500"
						width={24}
						height={24}
					/>
				</div>
				{
					// Tags Array pulled from courses data
					// !courses
					// 	? Array(3)
					// 			.fill(0)
					// 			.map((i, idx) => (
					// 				<div
					// 					key={idx}
					// 					className="animate-pulse w-36 h-9 transition-all flex items-center gap-2 px-3 py-1 border-2   border-gray-500 rounded-lg bg-gray-200"
					// 				/>
					// 			))
					// 	: courses
					// 			?.map((i) => i.tags)
					// 			.reduce((a, b) => [...a, ...b], [])
					// 			.filter((value, index, self) => {
					// 				return self.indexOf(value) === index
					// 			})
					// 			.map((tag, idx) => {
					// 				let i = {
					// 					icon: [
					// 						Icon.TreeStructure,
					// 						Icon.Cube,
					// 						Icon.TestTube,
					// 					][idx],
					// 					rgb: [
					// 						"189, 137, 246",
					// 						"169,156,249",
					// 						"151,175,238",
					// 					][idx],
					// 				}
					// 				return (
					// 					<div
					// 						key={tag}
					// 						className={`transition-all h=9 flex items-center gap-2 px-3 py-1 border-2 rounded-lg cursor-pointer hover:scale-95`}
					// 						style={{
					// 							borderColor: `rgba(${i.rgb},1)`,
					// 							backgroundColor: `rgba(${i.rgb},0.15)`,
					// 						}}
					// 					>
					// 						<i.icon
					// 							color={`rgba(${i.rgb},1)`}
					// 							width={24}
					// 							height={24}
					// 						/>
					// 						<p
					// 							style={{
					// 								color: `rgba(${i.rgb},1)`,
					// 							}}
					// 						>
					// 							{tag}
					// 						</p>
					// 					</div>
					// 				)
					// 			})
				}
				<div
					className={`transition-all flex items-center h-9 gap-2 px-3 py-1 border-2 rounded-lg cursor-pointer hover:scale-95 border-gray-600`}
					onClick={() => setOverlay("course")}
				>
					<Icon.Plus
						className="fill-gray-600"
						width={24}
						height={24}
					/>
					<p className="text-gray-600">Add Course</p>
				</div>
			</div>
			<div className="flex flex-wrap gap-8 h-[60vh] overflow-y-auto">
				{!courses
					? Array(6)
							.fill(0)
							.map((i, idx) => {
								return <LoadingUI key={idx} />
							})
					: courses.map((i) => {
							return (
								<CourseItem
									key={i._ref}
									data={i}
								/>
							)
					  })}
			</div>
		</div>
	)
}

function CourseItem(props: { data: Course }) {
	const { push } = useRouter()

	return (
		<div className="w-56 relative h-72 rounded-md group flex items-center overflow-hidden transition-all ease-linear ">
			<div
				className="cursor-pointer relative w-56 h-full flex flex-none items-end bg-gray-200 z-10"
				onClick={() => push(`${window.location}/${props.data.slug}`)}
			>
				<div className="absolute left-0 top-3 text-xs text-white px-3 py-1 bg-gray-500 z-10">
					<p>{props.data.label}</p>
				</div>
				<div className="flex p-3 z-10">
					<h2 className="font-bold text-2xl text-gray-500">
						{props.data.title}
					</h2>
					<Icon.ArrowRight
						className="w-14 h-14 fill-gray-500"
						weight="light"
					/>
				</div>
				<div className="w-full h-full absolute overflow-hidden z-0 after:h-full after:w-full after:absolute after:bg-gradient-to-tr after:from-gray-200 after:from-35%">
					<img
						className="absolute -right-1/4 top-0 aspect-auto w-48 opacity-100 -z-10"
						src={`/${props.data.icon}`}
						alt=""
					/>
				</div>
			</div>
		</div>
	)
}

function LoadingUI() {
	return (
		<div className="w-56 relative h-72 rounded-md group flex items-center overflow-hidden transition-all ease-linear ">
			<div className="cursor-pointer relative w-56 h-full flex flex-none items-end bg-gray-200 z-10">
				<div className="animate-pulse absolute left-0 top-3 h-6 w-1/3 text-xs text-white px-3 py-1 bg-gray-500 z-10"></div>
				<div className="flex gap-2 p-3 z-10 w-full">
					<div className="flex flex-col gap-2 w-3/4 h-full ">
						<h2 className="animate-pulse w-full rounded-full h-6 font-bold text-2xl text-gray-500 bg-gray-500"></h2>
						<h2 className="animate-pulse w-3/4 rounded-full h-6 font-bold text-2xl text-gray-500 bg-gray-500"></h2>
					</div>
					<div className="animate-pulse w-14 h-14 bg-gray-500 rounded-full flex-none"></div>
				</div>
			</div>
		</div>
	)
}
