import { SignIn } from "@clerk/nextjs"

export default function Page() {
	return (
		<div className="flex h-screen w-screen">
			<div className="relative flex flex-1 h-full justify-center items-center">
				<img
					className="h-full w-full object-cover"
					src="mesh.png"
					alt=""
				/>
				<div className="flex flex-col absolute bg-white/30 border-white/50 border w-1/2 h-[50%] p-8 items-end">
					<h1 className="text-7xl text-white font-bold w-full">
						Your Personal LMS AI Assistant
					</h1>
					<h2 className="text-5xl text-white w-full self-end">
						<ul>
							<li>Answer Questions</li>
							<li>Guide Learners</li>
							<li>Context aware</li>
						</ul>
					</h2>
				</div>
			</div>
			<div className="flex flex-1 justify-center items-center h-full">
				<SignIn />
			</div>
		</div>
	)
}
