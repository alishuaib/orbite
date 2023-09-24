import "@/app//globals.css"
import AdminContext from "@/app/adminContext"
import ChatPlugin from "@/app/(comp)/ChatPlugin"

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<AdminContext>
				<body>
					{children}
					<ChatPlugin />
				</body>
			</AdminContext>
		</html>
	)
}
