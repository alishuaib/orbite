"use client"
import NavBtn from "@/app/(comp)/navbtn"
import CourseList from "./CourseList"
import Overlay from "./Overlay"
import { useEffect } from "react"
import { writeAdminContext } from "@/app/adminContext"

export default function Page({ params }: { params: { handle: string } }) {
	const setHandle = writeAdminContext()!.setHandle
	useEffect(() => {
		setHandle(params.handle)
	}, [])
	return (
		<main className="flex h-screen v-screen bg-gray-100">
			<Overlay type="module" />
			<div className=" flex flex-col flex-initial w-20 h-screen border-r-2 border-r-gray-200 py-2 gap-8">
				<div className="relative flex flex-col items-center justify-center px-4 py-4 gap-2">
					<img
						className="z-10 aspect-square"
						src="/logo_sm.png"
						alt=""
					/>
				</div>
				<div className="flex flex-col items-center flex-1 px-4 py-4 gap-2">
					<NavBtn>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="32"
							height="32"
							fill="#7B7E88"
							viewBox="0 0 256 256"
						>
							<path d="M104,42H56A14,14,0,0,0,42,56v48a14,14,0,0,0,14,14h48a14,14,0,0,0,14-14V56A14,14,0,0,0,104,42Zm2,62a2,2,0,0,1-2,2H56a2,2,0,0,1-2-2V56a2,2,0,0,1,2-2h48a2,2,0,0,1,2,2Zm94-62H152a14,14,0,0,0-14,14v48a14,14,0,0,0,14,14h48a14,14,0,0,0,14-14V56A14,14,0,0,0,200,42Zm2,62a2,2,0,0,1-2,2H152a2,2,0,0,1-2-2V56a2,2,0,0,1,2-2h48a2,2,0,0,1,2,2Zm-98,34H56a14,14,0,0,0-14,14v48a14,14,0,0,0,14,14h48a14,14,0,0,0,14-14V152A14,14,0,0,0,104,138Zm2,62a2,2,0,0,1-2,2H56a2,2,0,0,1-2-2V152a2,2,0,0,1,2-2h48a2,2,0,0,1,2,2Zm94-62H152a14,14,0,0,0-14,14v48a14,14,0,0,0,14,14h48a14,14,0,0,0,14-14V152A14,14,0,0,0,200,138Zm2,62a2,2,0,0,1-2,2H152a2,2,0,0,1-2-2V152a2,2,0,0,1,2-2h48a2,2,0,0,1,2,2Z"></path>
						</svg>
					</NavBtn>
					<NavBtn>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="32"
							height="32"
							fill="#7B7E88"
							viewBox="0 0 256 256"
						>
							<path d="M26,168V56A14,14,0,0,1,40,42H216a14,14,0,0,1,14,14V168a6,6,0,0,1-12,0V56a2,2,0,0,0-2-2H40a2,2,0,0,0-2,2V168a6,6,0,0,1-12,0Zm220,32a6,6,0,0,1-6,6H16a6,6,0,0,1,0-12h98V168a6,6,0,0,1,6-6h64a6,6,0,0,1,6,6v26h50A6,6,0,0,1,246,200Zm-120-6h52V174H126Z"></path>
						</svg>
					</NavBtn>
					<NavBtn>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="32"
							height="32"
							fill="#7B7E88"
							viewBox="0 0 256 256"
						>
							<path d="M200,170a30.05,30.05,0,0,0-29.4,24H72a34,34,0,0,1,0-68h96a38,38,0,0,0,0-76H72a6,6,0,0,0,0,12h96a26,26,0,0,1,0,52H72a46,46,0,0,0,0,92h98.6A30,30,0,1,0,200,170Zm0,48a18,18,0,1,1,18-18A18,18,0,0,1,200,218Z"></path>
						</svg>
					</NavBtn>
				</div>
				<div className="flex flex-col items-center px-4 py-4 gap-2 border-t-2 border-t-gray-200">
					<NavBtn>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="32"
							height="32"
							fill="#7B7E88"
							viewBox="0 0 256 256"
						>
							<path d="M229.19,213c-15.81-27.32-40.63-46.49-69.47-54.62a70,70,0,1,0-63.44,0C67.44,166.5,42.62,185.67,26.81,213a6,6,0,1,0,10.38,6C56.4,185.81,90.34,166,128,166s71.6,19.81,90.81,53a6,6,0,1,0,10.38-6ZM70,96a58,58,0,1,1,58,58A58.07,58.07,0,0,1,70,96Z"></path>
						</svg>
					</NavBtn>
					<NavBtn href={`/admin/${params.handle}`}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="32"
							height="32"
							fill="#7B7E88"
							viewBox="0 0 256 256"
						>
							<path d="M220,169.09l-92,53.65L36,169.09A8,8,0,0,0,28,182.91l96,56a8,8,0,0,0,8.06,0l96-56A8,8,0,1,0,220,169.09Z"></path>
							<path d="M220,121.09l-92,53.65L36,121.09A8,8,0,0,0,28,134.91l96,56a8,8,0,0,0,8.06,0l96-56A8,8,0,1,0,220,121.09Z"></path>
							<path d="M28,86.91l96,56a8,8,0,0,0,8.06,0l96-56a8,8,0,0,0,0-13.82l-96-56a8,8,0,0,0-8.06,0l-96,56a8,8,0,0,0,0,13.82Z"></path>
						</svg>
					</NavBtn>
				</div>
			</div>
			<div className="flex flex-col flex-1 h-screen">
				<div className="flex justify-center h-[30vh] flex-none bg-[url('/banner.png')] bg-cover">
					{/* Organization Header/Banner */}
					<div className=" w-4/5 border-gray-700 border-2 bg-white/0 backdrop-blur-sm flex flex-col items-center justify-center">
						<h1 className="text-white text-4xl text-center">
							Welcome to{" "}
							{params.handle.charAt(0).toUpperCase() +
								params.handle.slice(1)}{" "}
						</h1>
						<h1 className="text-white text-6xl text-center">
							Learning Hub
						</h1>
					</div>
				</div>
				<CourseList _handle={params.handle}></CourseList>
			</div>
		</main>
	)
}
