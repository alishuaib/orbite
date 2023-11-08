import "@/app//globals.css"
import AdminContext from "@/app/adminContext"

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<AdminContext>
				<body>{children}</body>
			</AdminContext>
		</html>
	)
}
