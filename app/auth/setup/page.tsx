import Link from "next/link"

export default function Page() {
	return (
		<div className="flex h-screen w-screen">
			<div className="flex flex-1 justify-center items-center h-full flex-col gap-2">
				<h1>Welcome to Orbite</h1>
				<h2>Please wait while we get everything ready for you</h2>
				<p>[Placeholder Setup Screen]</p>
				<Link
					className={`border-2 gap-2 w-fit  rounded p-2 hover:cursor-pointer transition-all hover:scale-105 active:scale-95 group flex items-center justify-center text-gray-500`}
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
			</div>
		</div>
	)
}
