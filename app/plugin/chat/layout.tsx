import ApiContext from "@/app/_context/api"
export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<ApiContext>
				<body className="bg-zinc-100 text-zinc-900 flex flex-col min-h-screen max-w-[430px]">
					<div className="flex-1 flex">{children}</div>
				</body>
			</ApiContext>
		</html>
	)
}
