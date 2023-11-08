"use client"
type params = {
	isActive?: boolean
	setOpen?: Function
	warning?: boolean
}

export default function PluginBtn({ isActive, setOpen, warning }: params) {
	return (
		<div
			id="orbite-plugin-btn"
			className={
				"absolute bottom-7 -left-12 bg-zinc-800 border-2 border-zinc-500 border-r-0 p-2 rounded-l-md w-12 h-20 items-center flex hover:bg-zinc-700 " +
				(!isActive ? "hover:bg-zinc-800" : "")
			}
			onClick={() => {
				setOpen ? setOpen((l: boolean) => !l) : null
			}}
			style={{
				cursor: isActive ? "pointer" : "not-allowed",
				position: "absolute",
				bottom: "1.75rem",
				left: "-3rem",
				backgroundColor: "#27272a",
				border: "2px solid #71717a",
				borderRightWidth: "0",
				padding: "0.5rem",
				borderTopLeftRadius: "0.375rem",
				borderBottomLeftRadius: "0.375rem",
				width: "3rem",
				height: "5rem",
				alignItems: "center",
				display: "flex",
			}}
		>
			{warning ? (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="32"
					height="32"
					fill="#fbbf24"
					viewBox="0 0 256 256"
				>
					<path d="M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM120,104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm8,88a12,12,0,1,1,12-12A12,12,0,0,1,128,192Z"></path>
				</svg>
			) : (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="32"
					height="32"
					viewBox="0 0 256 256"
				>
					<defs>
						<linearGradient
							id="0"
							x1="0.25"
							y1="0.07"
							x2="0.75"
							y2="0.93"
						>
							<stop
								offset="0%"
								stopColor="#a1d0ec"
							/>
							<stop
								offset="3.14%"
								stopColor="#9dcaed"
							/>
							<stop
								offset="6.29%"
								stopColor="#9bc4ee"
							/>
							<stop
								offset="9.43%"
								stopColor="#99beef"
							/>
							<stop
								offset="12.57%"
								stopColor="#9ab7f1"
							/>
							<stop
								offset="15.71%"
								stopColor="#9cb0f3"
							/>
							<stop
								offset="22%"
								stopColor="#a79ef9"
							/>
							<stop
								offset="26.29%"
								stopColor="#a99bf9"
							/>
							<stop
								offset="30.57%"
								stopColor="#ab97f8"
							/>
							<stop
								offset="34.86%"
								stopColor="#ad94f8"
							/>
							<stop
								offset="39.14%"
								stopColor="#af90f8"
							/>
							<stop
								offset="43.43%"
								stopColor="#b18cf8"
							/>
							<stop
								offset="52%"
								stopColor="#b684f7"
							/>
							<stop
								offset="56.29%"
								stopColor="#c983f5"
							/>
							<stop
								offset="60.57%"
								stopColor="#da83f4"
							/>
							<stop
								offset="64.86%"
								stopColor="#ea83f3"
							/>
							<stop
								offset="69.14%"
								stopColor="#f288eb"
							/>
							<stop
								offset="73.43%"
								stopColor="#f293de"
							/>
							<stop
								offset="82%"
								stopColor="#f1a6cf"
							/>
							<stop
								offset="84.57%"
								stopColor="#f1aad1"
							/>
							<stop
								offset="87.14%"
								stopColor="#f1afd3"
							/>
							<stop
								offset="89.71%"
								stopColor="#f1b3d5"
							/>
							<stop
								offset="92.29%"
								stopColor="#f1b7d8"
							/>
							<stop
								offset="94.86%"
								stopColor="#f1bcda"
							/>
							<stop
								offset="100%"
								stopColor="#f2c4de"
							/>
						</linearGradient>
					</defs>
					<path
						fill={"url(#0)"}
						d="M216,48H40A16,16,0,0,0,24,64V224a15.84,15.84,0,0,0,9.25,14.5A16.05,16.05,0,0,0,40,240a15.89,15.89,0,0,0,10.25-3.78.69.69,0,0,0,.13-.11L82.5,208H216a16,16,0,0,0,16-16V64A16,16,0,0,0,216,48ZM84,140a12,12,0,1,1,12-12A12,12,0,0,1,84,140Zm44,0a12,12,0,1,1,12-12A12,12,0,0,1,128,140Zm44,0a12,12,0,1,1,12-12A12,12,0,0,1,172,140Z"
					></path>
				</svg>
			)}
		</div>
	)
}
