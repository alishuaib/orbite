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

type SourceCard = {
	name: string
	logo: string
	description: string
	status: "unreleased" | "released" | "beta" | "deprecated"
	onClick: MouseEventHandler<HTMLDivElement>
}
export default function SourcesPage() {
	const lms_sources: SourceCard[] = [
		{
			name: "Moodle Plugin",
			description: "Integrate Orbite with Moodle",
			logo: "/sources/moodle.png",
			status: "released",
			onClick: () => {},
		},
		{
			name: "Totara  Plugin",
			description: "Coming Soon",
			logo: "/sources/totara.png",
			status: "unreleased",
			onClick: () => {},
		},
	]

	const embed_sources: SourceCard[] = [
		{
			name: "HTML Embed",
			description: "Add Orbite to website",
			logo: "/sources/html.svg",
			status: "released",
			onClick: () => {},
		},
	]

	const status_icon = {
		released: <Icon.ArrowRight className="h-10 w-10" />,
		unreleased: <Icon.Clock className="h-10 w-10" />,
		beta: <Icon.ArrowRight className="h-10 w-10" />,
		deprecated: <Icon.ArrowRight className="h-10 w-10" />,
	}
	return (
		<div className="flex flex-col border-2 border-gray-300 flex-1 rounded-md bg-gray-100 p-5 gap-6">
			<div className="flex flex-col gap-4">
				<div className="flex flex-col border-l-4 border-gray-600 pl-2">
					<h2 className="text-xl font-bold">
						Learning Management System Plugins
					</h2>
					<p className="text-gray-500">
						Plugins for integrating Orbite directly with your LMS
					</p>
				</div>
				<div className="flex gap-4 flex-wrap">
					{lms_sources.map((source) => (
						<div
							className="flex flex-col border-2 border-gray-300 w-56 h-56 p-5 rounded-xl hover:scale-105 transition-all cursor-pointer"
							onClick={source.onClick}
						>
							<div className="flex-1">
								<div className="flex flex-col">
									<h2 className="text-xl font-bold">
										{source.name}
									</h2>
									<p className="text-gray-500">
										{source.description}
									</p>
								</div>
							</div>
							<div className="flex justify-between items-end">
								<img
									className="h-12"
									src={source.logo}
									alt=""
								/>

								<div className="flex-1 flex justify-end">
									{status_icon[source.status]}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
			<div className="flex flex-col gap-4">
				<div className="flex flex-col border-l-4 border-gray-600 pl-2">
					<h2 className="text-xl font-bold">Embed Plugins</h2>
					<p className="text-gray-500">
						Add Orbite chat onto your website
					</p>
				</div>
				<div className="flex gap-4 flex-wrap">
					{embed_sources.map((source) => (
						<div
							className="flex flex-col border-2 border-gray-300 w-56 h-56 p-5 rounded-xl hover:scale-105 transition-all cursor-pointer"
							onClick={source.onClick}
						>
							<div className="flex-1">
								<div className="flex flex-col">
									<h2 className="text-xl font-bold">
										{source.name}
									</h2>
									<p className="text-gray-500">
										{source.description}
									</p>
								</div>
							</div>
							<div className="flex justify-between items-end">
								<img
									className="h-12"
									src={source.logo}
									alt=""
								/>

								<div className="flex-1 flex justify-end">
									{status_icon[source.status]}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
