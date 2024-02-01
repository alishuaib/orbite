"use client"
import {
	MouseEventHandler,
	ReactElement,
	cloneElement,
	useEffect,
	useState,
} from "react"
import { useRouter } from "next/navigation"
import { readApi, writeApi } from "@/app/_context/api"
import * as Icon from "@phosphor-icons/react"
import Editor from "./Editor"
import Preview from "./Preview"
import FileIcon from "../_c/FileIcon"
import { set } from "zod"
type NavigationSelected = {
	course?: number
	section?: number
	module?: number
	content?: number
}
export default function DashboardHeader() {
	const { getCourses } = writeApi()!
	const [editor, showEditor] = useState(false)
	const courses = readApi()?.courses
	const [selected, setSelected] = useState<NavigationSelected>({})
	const [error, setError] = useState<string | null>(null)
	useEffect(() => {
		let isCancelled = false

		const fetchCourses = async () => {
			const response = await getCourses()
			if (!isCancelled && !response) {
				console.error("Server Response Error - /courses API")
				setError("Server Response Error")
			}
		}

		fetchCourses()

		// if (!courses || courses?.length == 0) {
		// 	setError("No Content Synched")
		// }

		return () => {
			isCancelled = true
		}
	}, [])

	return (
		<div className="flex border-2 border-gray-300 flex-1 rounded-md bg-gray-100">
			{courses ? (
				courses.length == 0 ? (
					<div className="flex-1 items-center justify-center flex text-gray-300 flex-col">
						<Icon.Folders
							weight="light"
							width={80}
							height={80}
						/>
						<h3 className="text-3xl">No Content Synched</h3>
					</div>
				) : (
					<>
						<CourseList
							selected={selected}
							setSelected={setSelected}
						/>
						<SectionList
							selected={selected}
							setSelected={setSelected}
						/>
						<ModuleList
							selected={selected}
							setSelected={setSelected}
						/>
						<ContentList
							selected={selected}
							setSelected={setSelected}
						/>
					</>
				)
			) : (
				<div className="flex-1 items-center justify-center flex flex-col text-violet-500">
					{!error ? (
						<>
							<Icon.CircleNotch
								width={60}
								height={60}
								className="animate-spin"
							/>
							<p className="text-3xl animate-pulse">
								Loading Content
							</p>
						</>
					) : (
						<>
							<Icon.CloudX
								width={60}
								height={60}
								className=" text-red-300"
							/>
							<p className="text-3xl text-red-300">{error}</p>
						</>
					)}
				</div>
			)}
			{selected.content && (
				<Preview
					selected={selected}
					setSelected={setSelected}
				/>
			)}
			{/* {editor && <Editor id={selectedCourse} />} */}
		</div>
	)
}

function CourseList({
	selected,
	setSelected,
}: {
	selected: NavigationSelected
	setSelected: React.Dispatch<React.SetStateAction<NavigationSelected>>
}) {
	const courses = readApi()?.courses
	return (
		<div className="flex-1 border-r-2 border-gray-300 p-3 flex-col flex">
			<h2 className="font-bold text-lg pb-2">Courses</h2>
			{courses &&
				courses.map((course) => (
					<div
						key={course.id}
						className={`rounded flex items-center justify-between p-2 hover:bg-gray-200 cursor-pointer ${
							selected.course == course.id
								? "bg-violet-200 font-bold text-violet-800 hover:bg-violet-200"
								: ""
						}`}
						onClick={() => {
							setSelected({ course: course.id })
						}}
					>
						<div className="flex gap-3 items-center">
							<Icon.Folders
								weight="light"
								width={40}
								height={40}
							/>
							<p>{course.title}</p>
						</div>
						<div className="flex items-center">
							<Icon.DotsThreeVertical
								width={24}
								height={24}
							/>
						</div>
					</div>
				))}
			{/* <div
				className="flex mt-auto items-center justify-between p-3 rounded bg-violet-200 hover:bg-violet-300 cursor-pointer"
				onClick={() => showEditor(true)}
			>
				<div className="flex gap-3 items-center text-violet-800">
					<Icon.FolderSimplePlus
						className=""
						weight="light"
						width={40}
						height={40}
					/>
					<p>Add a new course</p>
				</div>
			</div> */}
		</div>
	)
}

function SectionList({
	selected,
	setSelected,
}: {
	selected: NavigationSelected
	setSelected: React.Dispatch<React.SetStateAction<NavigationSelected>>
}) {
	const courses = readApi()?.courses
	return (
		<div className="flex-1 border-r-2 border-gray-300 p-3 flex-col flex">
			<h2 className="font-bold text-lg pb-2">Sections</h2>
			{selected.course && courses ? (
				courses
					.find((course) => course.id === selected.course)
					?.sections.map((section) => (
						<div
							key={section.id}
							className={`rounded flex items-center justify-between p-2 hover:bg-gray-200 cursor-pointer ${
								selected.section == section.id
									? "bg-violet-200 font-bold text-violet-800 hover:bg-violet-200"
									: ""
							}`}
							onClick={() => {
								setSelected({
									...selected,
									section: section.id,
								})
							}}
						>
							<div className="flex gap-3 items-center">
								<Icon.Folders
									weight="light"
									width={40}
									height={40}
								/>
								<p>{section.title}</p>
							</div>
							<div className="flex items-center">
								<Icon.DotsThreeVertical
									width={24}
									height={24}
								/>
							</div>
						</div>
					))
			) : (
				<div className="flex-1 items-center justify-center flex text-gray-300 flex-col">
					<Icon.ArrowLeft
						weight="light"
						width={80}
						height={80}
					/>
					<h3 className="text-3xl">Select a Course</h3>
				</div>
			)}
		</div>
	)
}

function ModuleList({
	selected,
	setSelected,
}: {
	selected: NavigationSelected
	setSelected: React.Dispatch<React.SetStateAction<NavigationSelected>>
}) {
	const courses = readApi()?.courses
	return (
		<div className="flex-1 border-r-2 border-gray-300 p-3 flex-col flex">
			<h2 className="font-bold text-lg pb-2">Modules</h2>
			{selected.section && courses ? (
				courses
					.find((course) => course.id === selected.course)
					?.sections.find(
						(section) => section.id === selected.section
					)
					?.modules.map((module) => (
						<div
							key={module.id}
							className={`rounded flex items-center justify-between p-2 hover:bg-gray-200 cursor-pointer ${
								selected.module == module.id
									? "bg-violet-200 font-bold text-violet-800 hover:bg-violet-200"
									: ""
							}`}
							onClick={() => {
								setSelected({
									...selected,
									module: module.id,
								})
							}}
						>
							<div className="flex gap-3 items-center">
								<Icon.Folders
									weight="light"
									width={40}
									height={40}
								/>
								<p>{module.title}</p>
							</div>
							<div className="flex items-center">
								<Icon.DotsThreeVertical
									width={24}
									height={24}
								/>
							</div>
						</div>
					))
			) : (
				<div className="flex-1 items-center justify-center flex text-gray-300 flex-col">
					<Icon.ArrowLeft
						weight="light"
						width={80}
						height={80}
					/>
					<h3 className="text-3xl">Select a Section</h3>
				</div>
			)}
		</div>
	)
}

function ContentList({
	selected,
	setSelected,
}: {
	selected: NavigationSelected
	setSelected: React.Dispatch<React.SetStateAction<NavigationSelected>>
}) {
	const courses = readApi()?.courses
	return (
		<div className="flex-[2] border-r-2 border-gray-300 p-3 flex-col flex">
			<h2 className="font-bold text-lg pb-2">Content</h2>

			{selected.module && courses ? (
				<div className="grid grid-cols-3 gap-3">
					{courses
						.find((course) => course.id === selected.course)
						?.sections.find(
							(section) => section.id === selected.section
						)
						?.modules.find(
							(module) => module.id === selected.module
						)
						?.contents.map((content) => (
							<div
								key={module.id}
								className={`rounded flex items-center aspect-square justify-center p-2 hover:bg-gray-200 cursor-pointer ${
									selected.content == content.id
										? "bg-violet-200 font-bold text-violet-800 hover:bg-violet-200"
										: ""
								}`}
								onClick={() => {
									setSelected({
										...selected,
										content: content.id,
									})
								}}
							>
								<div className="flex gap-3 items-center flex-col justify-center ">
									<FileIcon ext={content.ext} />
									<p>{content.name + "." + content.ext}</p>
								</div>
							</div>
						))}
				</div>
			) : (
				<div className="flex-1 items-center justify-center flex text-gray-300 flex-col">
					<Icon.ArrowLeft
						weight="light"
						width={80}
						height={80}
					/>
					<h3 className="text-3xl">Select a Module</h3>
				</div>
			)}
		</div>
	)
}
