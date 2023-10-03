import "./globals.css"
import { Lato } from "next/font/google"
import MainContext from "./context"
import { ClerkProvider } from "@clerk/nextjs"

const lato = Lato({
	subsets: ["latin"],
	weight: ["100", "300", "400", "700", "900"],
	style: ["normal", "italic"],
})

export const metadata = {
	title: "Orbite Prototype",
	description: "Orbite LMS AI",
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<ClerkProvider
			localization={{
				// formButtonPrimary: "Sign In",
				signIn: {
					start: {
						actionText: "New to Orbite?",
					},
				},
			}}
		>
			<html
				lang="en"
				className={lato.className}
			>
				<MainContext>
					<body>{children}</body>
				</MainContext>
			</html>
		</ClerkProvider>
	)
}
