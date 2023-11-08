import ApiContext from "@/app/_context/api"
import DashboardHeader from "./_c/Header"
import DashboardTabs from "./_c/Tabs"
import Overlay from "./_c/Overlay"

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<ApiContext>
				<body className="bg-zinc-100 text-zinc-900 flex flex-col min-h-screen">
					<DashboardHeader />
					<DashboardTabs />
					<Overlay />
					<div className="px-10 py-10 flex-1 flex">{children}</div>
				</body>
			</ApiContext>
		</html>
	)
}
