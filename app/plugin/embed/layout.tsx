import ApiContext from "@/app/_context/api"
export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<ApiContext>
				<body>{children}</body>
			</ApiContext>
		</html>
	)
}
