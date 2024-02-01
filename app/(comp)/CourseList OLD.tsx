//UNUSED
// "use client"
// import * as Icon from "@phosphor-icons/react"
// import { useState, useRef } from "react"
// import { useRouter } from "next/navigation"
// import { writeContext } from "@/app/context"

// export default function CourseList() {
// 	const [toggleSearch, setToggleSearch] = useState(false)
// 	const setOverlay = writeContext()?.setOverlay!
// 	return (
// 		<div className="flex flex-col flex-none px-4">
// 			{/* Course Content Here w/Loading Skeleton*/}
// 			<div className="flex gap-4 w-full h-fit flex-none items-center py-4">
// 				<h2 className="text-gray-500 text-3xl">Courses</h2>
// 				<div
// 					className={`transition-all flex border-2 p-1 rounded ${
// 						toggleSearch ? "border-gray-200" : "border-gray-500"
// 					}`}
// 				>
// 					<input
// 						className={`${
// 							toggleSearch ? "max-w-2xl px-2" : "max-w-0"
// 						} box-border outline-none focus:ring focus:ring-gray-300 transition-all bg-transparent border-b-2 border-b-gray-500`}
// 						type="text"
// 					/>
// 					<Icon.MagnifyingGlass
// 						onClick={() => setToggleSearch((l) => !l)}
// 						className=" transition-all hover:scale-90 cursor-pointer fill-gray-500"
// 						width={24}
// 						height={24}
// 					/>
// 				</div>
// 				{
// 					// Tags Array pulled from courses data
// 					[
// 						{
// 							icon: Icon.TreeStructure,
// 							name: "Data Analytics",
// 							rgb: "189, 137, 246",
// 						},
// 						{
// 							icon: Icon.TestTube,
// 							name: "Simulation",
// 							rgb: "169,156,249",
// 						},
// 						{
// 							icon: Icon.Cube,
// 							name: "3D Modeling",
// 							rgb: "151,175,238",
// 						},
// 					].map((i, idx) => {
// 						return (
// 							<div
// 								key={idx}
// 								className={`transition-all flex items-center gap-2 px-3 py-1 border-2 rounded-lg cursor-pointer hover:scale-95`}
// 								style={{
// 									borderColor: `rgba(${i.rgb},1)`,
// 									backgroundColor: `rgba(${i.rgb},0.15)`,
// 								}}
// 							>
// 								<i.icon
// 									color={`rgba(${i.rgb},1)`}
// 									width={24}
// 									height={24}
// 								/>
// 								<p style={{ color: `rgba(${i.rgb},1)` }}>
// 									{i.name}
// 								</p>
// 							</div>
// 						)
// 					})
// 				}
// 				<div
// 					className={`transition-all flex items-center gap-2 px-3 py-1 border-2 rounded-lg cursor-pointer hover:scale-95 border-gray-600`}
// 					onClick={() => setOverlay("course")}
// 				>
// 					<Icon.Plus
// 						className="fill-gray-600"
// 						width={24}
// 						height={24}
// 					/>
// 					<p className="text-gray-600">Add Course</p>
// 				</div>
// 			</div>
// 			<div className="flex flex-wrap gap-8 h-[60vh] overflow-y-auto">
// 				{
// 					// Courses Cards pulled from courses data
// 					[
// 						{
// 							title: "Data Preparation",
// 							label: "Knowledge Studio",
// 							icon: "/altair.png",
// 							modules: [
// 								"Module 1",
// 								"Module 2",
// 								"Module 3",
// 								"Module 4",
// 								"Module 5",
// 								"Module 1",
// 								"Module 2",
// 								"Module 3",
// 								"Module 4",
// 								"Module 5",
// 							],
// 						},
// 						{
// 							title: "Data Preparation",
// 							label: "Knowledge Studio",
// 							icon: "/altair.png",
// 							modules: [
// 								"Module 1",
// 								"Module 2",
// 								"Module 3",
// 								"Module 4",
// 								"Module 5",
// 								"Module 1",
// 								"Module 2",
// 								"Module 3",
// 								"Module 4",
// 								"Module 5",
// 							],
// 						},
// 						{
// 							title: "Data Preparation",
// 							label: "Knowledge Studio",
// 							icon: "/altair.png",
// 							modules: [
// 								"Module 1",
// 								"Module 2",
// 								"Module 3",
// 								"Module 4",
// 								"Module 5",
// 								"Module 1",
// 								"Module 2",
// 								"Module 3",
// 								"Module 4",
// 								"Module 5",
// 							],
// 						},
// 						{
// 							title: "Data Preparation",
// 							label: "Knowledge Studio",
// 							icon: "/altair.png",
// 							modules: [
// 								"Module 1",
// 								"Module 2",
// 								"Module 3",
// 								"Module 4",
// 								"Module 5",
// 								"Module 1",
// 								"Module 2",
// 								"Module 3",
// 								"Module 4",
// 								"Module 5",
// 							],
// 						},
// 						{
// 							title: "Data Preparation",
// 							label: "Knowledge Studio",
// 							icon: "/altair.png",
// 							modules: [
// 								"Module 1",
// 								"Module 2",
// 								"Module 3",
// 								"Module 4",
// 								"Module 5",
// 								"Module 1",
// 								"Module 2",
// 								"Module 3",
// 								"Module 4",
// 								"Module 5",
// 							],
// 						},
// 						{
// 							title: "Data Preparation",
// 							label: "Knowledge Studio",
// 							icon: "/altair.png",
// 							modules: [
// 								"Module 1",
// 								"Module 2",
// 								"Module 3",
// 								"Module 4",
// 								"Module 5",
// 								"Module 1",
// 								"Module 2",
// 								"Module 3",
// 								"Module 4",
// 								"Module 5",
// 							],
// 						},
// 						{
// 							title: "Data Preparation",
// 							label: "Knowledge Studio",
// 							icon: "/altair.png",
// 							modules: [
// 								"Module 1",
// 								"Module 2",
// 								"Module 3",
// 								"Module 4",
// 								"Module 5",
// 								"Module 1",
// 								"Module 2",
// 								"Module 3",
// 								"Module 4",
// 								"Module 5",
// 							],
// 						},
// 						{
// 							title: "Data Preparation",
// 							label: "Knowledge Studio",
// 							icon: "/altair.png",
// 							modules: [
// 								"Module 1",
// 								"Module 2",
// 								"Module 3",
// 								"Module 4",
// 								"Module 5",
// 								"Module 1",
// 								"Module 2",
// 								"Module 3",
// 								"Module 4",
// 								"Module 5",
// 							],
// 						},
// 					].map((i, idx) => {
// 						return (
// 							<CourseItem
// 								key={idx}
// 								data={i}
// 							/>
// 						)
// 					})
// 				}
// 			</div>
// 		</div>
// 	)
// }

// interface CourseStructure {
// 	title: string
// 	label: string
// 	icon: string
// 	modules: string[]
// }

// function CourseItem(props: { data: CourseStructure }) {
// 	const { push } = useRouter()
// 	const [open, setOpen] = useState(false)
// 	const containerRef = useRef<HTMLDivElement>(null)
// 	const setOverlay = writeContext()?.setOverlay!

// 	function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
// 		event.stopPropagation()
// 		event.preventDefault()
// 		const container = containerRef.current
// 		if (container) {
// 			container.scrollLeft += event.deltaY
// 		}
// 	}

// 	return (
// 		<div
// 			className={`${
// 				open ? "w-full" : "w-56"
// 			} relative h-72 rounded-md group flex items-center overflow-hidden transition-all ease-linear `}
// 		>
// 			<div
// 				className="cursor-pointer relative w-56 h-full flex flex-none items-end bg-gray-200 z-10"
// 				onClick={() => setOpen((l) => !l)}
// 			>
// 				<div className="absolute left-0 top-3 text-xs text-white px-3 py-1 bg-gray-500 z-10">
// 					<p>{props.data.label}</p>
// 				</div>
// 				<div className="flex p-3 z-10">
// 					<h2 className="font-bold text-2xl text-gray-500">
// 						{props.data.title}
// 					</h2>
// 					<Icon.ArrowRight
// 						className="w-14 h-14 fill-gray-500"
// 						weight="light"
// 					/>
// 				</div>
// 				<div
// 					className="w-full h-full absolute overflow-hidden z-0
//                 after:h-full after:w-full after:absolute after:bg-gradient-to-tr after:from-gray-200 after:from-45%"
// 				>
// 					<img
// 						className="absolute -right-1/4 top-0 aspect-auto w-48 opacity-30 -z-10"
// 						src={props.data.icon}
// 						alt=""
// 					/>
// 				</div>
// 			</div>
// 			<div
// 				className={`${
// 					open ? "" : ""
// 				} absolute flex flex-col h-[95%] bg-gray-200 gap-2
//                 after:absolute after:right-0 after:w-28 after:h-full after:bg-gradient-to-l after:from-gray-200 after:from-10% after:pointer-events-none z-0 ml-56`}
// 			>
// 				<div className="flex w-full h-fit items-center">
// 					<h2 className="text-gray-500 text-3xl px-4 py-4">
// 						Modules
// 					</h2>
// 					<div
// 						className={`h-fit transition-all flex items-center gap-2 px-3 py-1 border-2 rounded-lg cursor-pointer hover:scale-95 border-gray-600`}
// 						onClick={() => setOverlay("module")}
// 					>
// 						<Icon.Plus
// 							className="fill-gray-600"
// 							width={24}
// 							height={24}
// 						/>
// 						<p className="text-gray-600">Add Module</p>
// 					</div>
// 				</div>

// 				<div
// 					ref={containerRef}
// 					className="flex h-full max-w-7xl items-center overflow-x-auto mb-2 mx-2"
// 					onWheel={handleWheel}
// 				>
// 					<div className="flex gap-8 h-fit mb-2 px-2">
// 						{props.data.modules.map((module, idx) => {
// 							return (
// 								<div
// 									key={idx}
// 									className="relative w-40 h-40 bg-gray-300 flex items-end rounded-sm overflow-hidden cursor-pointer transition-all hover:scale-95 hover:shadow-sm"
// 									onClick={() => {
// 										push(`/hub/${"orbite"}/${"ksprep"}`)
// 									}}
// 								>
// 									<div className="flex p-3 z-10">
// 										<h2 className="font-bold text-2xl text-gray-500">
// 											{module}
// 										</h2>
// 									</div>
// 									<div
// 										className="w-full h-full absolute overflow-hidden z-0
//                                         after:h-full after:w-full after:absolute after:bg-gradient-to-tr after:from-gray-300 after:from-30%"
// 									>
// 										<p className="absolute -right-2 -top-12  text-[8.5rem] text-white opacity-30 -z-10">
// 											{idx + 1}
// 										</p>
// 									</div>
// 								</div>
// 							)
// 						})}
// 					</div>
// 				</div>
// 			</div>
// 		</div>
// 	)
// }
