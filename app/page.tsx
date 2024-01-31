import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import NavBtn from "./(comp)/navbtn"
import Link from "next/link"

export default function Home() {
	return (
		<main className="h-screen w-screen flex justify-center">
			<div className="h-screen w-fit grid py-4 grid-rows-1 justify-items-center">
				<div className="flex flex-col items-center gap-6 flex-1 justify-center">
					<img
						className=" aspect-auto h-20"
						src="/logo_lg.png"
						alt=""
					/>
					<h2 className=" text-3xl text-gray-500">
						Your Personal LMS Assistant
					</h2>
					<div className="flex h-10 gap-4">
						<NavBtn
							href="/hub/moonlite"
							label="LMS Preview"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="32"
								height="32"
								fill="#7B7E88"
								viewBox="0 0 256 256"
							>
								<path d="M208,24H72A32,32,0,0,0,40,56V224a8,8,0,0,0,8,8H192a8,8,0,0,0,0-16H56a16,16,0,0,1,16-16H208a8,8,0,0,0,8-8V32A8,8,0,0,0,208,24Zm-24,96-25.61-19.2a4,4,0,0,0-4.8,0L128,120V40h56Z"></path>
							</svg>
						</NavBtn>
						<NavBtn
							href="/dashboard"
							label="Admin Preview"
						>
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

				<div className="flex flex-col flex-none gap-3 items-center w-full px-3">
					<p className=" text-lg text-gray-500">
						{" "}
						Join our waitlist for updates
					</p>
					<div className=" flex gap-3 w-full">
						<input
							className=" border-2 text-gray-500 border-gray-200 rounded w-full px-2 py-2 ring-indigo-400 transition-all focus:outline-none focus:ring focus:ring-indigo-300"
							placeholder="your@email.com"
							type="text"
						/>
						<button className="bg-gradient-to-br from-indigo-400 via-purple-400 to-fuchsia-400 text-white rounded-sm px-6 py-2 ring-indigo-300 transition-all hover:scale-95 shadow-sm hover:shadow-inner hover:shadow-indigo-600/40">
							Join
						</button>
					</div>
				</div>
			</div>
			<div className="absolute top-4 right-4 w-fit flex gap-4 items-center justify-center">
				<SignedIn>
					{/* Mount the UserButton component */}
					<Link
						className={`gap-2 w-fit  rounded p-2 hover:cursor-pointer transition-all hover:scale-105 active:scale-95 group flex items-center justify-center text-gray-500`}
						href={"/dashboard"}
					>
						<p>Go to Dashboard</p>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							fill="#7B7E88"
							viewBox="0 0 256 256"
						>
							<path d="M104,40H56A16,16,0,0,0,40,56v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,104,40Zm0,64H56V56h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,64H152V56h48v48Zm-96,32H56a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,104,136Zm0,64H56V152h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,200,136Zm0,64H152V152h48v48Z"></path>
						</svg>
					</Link>
				</SignedIn>
				<SignedOut>
					{/* Signed out users get sign in button */}
					<div
						className={`gap-2 w-fit  rounded p-2 hover:cursor-pointer transition-all hover:scale-105 active:scale-95 group flex items-center justify-center text-gray-500`}
					>
						<SignInButton />
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							fill="#7B7E88"
							viewBox="0 0 256 256"
						>
							<path d="M141.66,133.66l-40,40a8,8,0,0,1-11.32-11.32L116.69,136H24a8,8,0,0,1,0-16h92.69L90.34,93.66a8,8,0,0,1,11.32-11.32l40,40A8,8,0,0,1,141.66,133.66ZM192,32H136a8,8,0,0,0,0,16h56V208H136a8,8,0,0,0,0,16h56a16,16,0,0,0,16-16V48A16,16,0,0,0,192,32Z"></path>
						</svg>
					</div>
				</SignedOut>
			</div>
			<div className=" pointer-events-none h-screen w-screen absolute top-0 left-0">
				<img
					className="absolute top-0 right-0 rotate-180 w-1/2 h-1/2"
					src="/aurora_texture.png"
					alt=""
				/>
				<img
					className="absolute bottom-0 left-0  w-1/2 h-1/2"
					src="/aurora_texture.png"
					alt=""
				/>
			</div>
		</main>
	)
}
