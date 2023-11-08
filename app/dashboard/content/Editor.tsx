"use client"
import {
	MouseEventHandler,
	ReactElement,
	cloneElement,
	useEffect,
	useState,
} from "react"
import { useRouter } from "next/navigation"
import { readApi } from "@/app/_context/api"
import * as Icon from "@phosphor-icons/react"
import * as T from "@/lib/@schemas"
import { Prisma } from "@prisma/client"

type mPrisma = Omit<T.Module, "contents" | "auth" | "parent">

export default function Editor({ id }: { id: number | null }) {
	const courses = readApi()?.courses

	const [batchEdit, setBatchEdit] = useState<
		| {
				course: Omit<
					Prisma.CourseCreateArgs["data"],
					"auth" | "sections"
				> & {
					sections: (Omit<
						Prisma.SectionCreateArgs["data"],
						"auth" | "modules"
					> & {
						modules: Omit<Prisma.ModuleCreateArgs["data"], "auth">[]
					})[]
				}
		  }
		| {
				course: T.Course
		  }
	>({
		course: {
			id: courses ? courses.length + 1 : 0,
			title: "",
			label: null,
			summary: null,
			icon: null,
			visible: true,
			url: null,
			namespace: null,
			category: null,
			tags: null,
			version: Math.floor(Date.now() / 1000).toString(),
			meta: {
				creator: "orbite_dashboard",
			},
			sections: [
				{
					id: 0,
					title: "",
					summary: null,
					order: "1",
					visible: true,
					url: null,
					version: Math.floor(Date.now() / 1000).toString(),
					meta: {
						creator: "orbite_dashboard",
					},
					modules: [
						{
							id: 0,
							title: "Test Module",
							summary: null,
							order: "1",
							visible: true,
							url: null,
							version: Math.floor(Date.now() / 1000).toString(),
							meta: {
								creator: "orbite_dashboard",
							},
						},
					],
				},
			],
		},
	})
	useEffect(() => {
		if (id && courses) {
			const selectedCourse = courses.find((course) => course.id === id)

			if (!selectedCourse) return

			setBatchEdit({
				course: {
					...selectedCourse,
				},
			})
		}
	}, [id])
	return (
		<div className="absolute top-0 left-0 backdrop-blur-sm w-screen h-screen p-20 flex">
			<div className="flex flex-col border-2 bg-gray-100 border-gray-300 flex-1 rounded-md p-4 gap-6">
				<div className="flex justify-between items-center">
					<h1 className="text-2xl">Course Structure Editor</h1>
					<Icon.X
						width={24}
						height={24}
					/>
				</div>

				{/* General Details*/}
				<div className="flex flex-col gap-4">
					<h2 className="text-xl">General Details</h2>
					<div className="flex flex-wrap gap-4">
						<div className="flex flex-col">
							<label htmlFor="">*Course Title</label>
							<input
								type="text"
								className="border border-gray-300 rounded w-64 p-1"
							/>
						</div>
						<div className="flex flex-col">
							<label htmlFor="">Course Short Name/Label</label>
							<input
								type="text"
								className="border border-gray-300 rounded w-64 p-1"
							/>
						</div>
						<div className="flex flex-col">
							<label htmlFor="">Course Homepage URL</label>
							<input
								type="text"
								className="border border-gray-300 rounded w-96 p-1"
							/>
						</div>
						<div className="flex flex-col">
							<label htmlFor="">Visibility</label>
							<input
								type="checkbox"
								id="toggle"
								defaultChecked
								className="form-checkbox h-5 w-5 text-blue-600 p-1"
							/>
						</div>
						<div className="flex flex-col">
							<label htmlFor="">Course Summary</label>
							<textarea
								rows={3}
								className="border border-gray-300 rounded w-96 p-1"
							/>
						</div>

						<div className="flex flex-col">
							<label htmlFor="">Icon</label>
							<input
								type="file"
								id="icon-upload"
								accept="image/*"
								className="border border-gray-300 rounded w-64"
							/>
						</div>
					</div>
				</div>
				{/* Sorting Details*/}
				<div className="flex flex-col gap-4">
					<h2 className="text-xl">Sorting Details</h2>
					<div className="flex flex-wrap gap-4">
						<div className="flex flex-col">
							<label htmlFor="">*Namespace</label>
							<input
								type="text"
								className="border border-gray-300 rounded w-64 p-1"
							/>
						</div>
						<div className="flex flex-col">
							<label htmlFor="">Category</label>
							<input
								type="text"
								className="border border-gray-300 rounded w-64 p-1"
							/>
						</div>
						<div className="flex flex-col w-full">
							<label htmlFor="">Tags</label>
							<input
								type="text"
								placeholder="Enter new tag"
								className="border border-gray-300 rounded w-48 p-1"
							/>
							<div className="flex flex-wrap w-full gap-4 pt-2">
								<div className="flex gap-2 items-center bg-gray-200 rounded p-1 px-2">
									<p>Tag 1</p>
									<Icon.X
										width={18}
										height={18}
									/>
								</div>
								<div className="flex gap-2 items-center bg-gray-200 rounded p-1 px-2">
									<p>Tag 2</p>
									<Icon.X
										width={18}
										height={18}
									/>
								</div>
								<div className="flex gap-2 items-center bg-gray-200 rounded p-1 px-2">
									<p>Tag 3</p>
									<Icon.X
										width={18}
										height={18}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
