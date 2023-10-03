import { SignUp } from "@clerk/nextjs"

export default function Page() {
	return (
		<div className="flex h-screen w-screen">
			<div className="flex flex-1 w-2/3 justify-center items-center h-full">
				<SignUp
					appearance={{
						elements: {
							card: "shadow-none",
							formFieldLabel:
								"text-slate-900 text-base font-bold",

							formButtonPrimary: "mt-5 bg-violet-500",
							formFieldInput: "text-base",
							header: "mb-2",
							footerActionLink: "text-violet-600",
						},
					}}
					afterSignUpUrl={"/auth/setup"}
				/>
			</div>
			<div className="relative flex w-1/3 h-full border-l-2 border-l-slate-300 items-center">
				<img
					className="object-contain aspect-auto h-24 relative -left-7 bg-white py-7 z-100"
					src="/logo_new.png"
					alt=""
				/>
			</div>
		</div>
	)
}
