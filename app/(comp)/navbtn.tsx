"use client"
import { MouseEventHandler, ReactElement, cloneElement } from "react"
import { useRouter } from "next/navigation"
export default function NavBtn(props: {
	override?: string
	href?: string
	label?: string
	children?: ReactElement
}) {
	const { push } = useRouter()
	const handleClick: MouseEventHandler<HTMLDivElement> = (event) => {
		console.log(props.href)
		push(props.href || "")
	}
	return (
		<div
			className={` gap-2 aspect-square w-fit bg-gray-200 rounded p-2 hover:bg-gray-300 hover:cursor-pointer transition-all hover:scale-105 active:scale-95 group flex shadow-sm hover:shadow-inner items-center justify-center ${props.override}`}
			onClick={handleClick}
		>
			{props.label && <p className="text-gray-500">{props.label}</p>}
			{props.children
				? cloneElement(props.children, {
						width: "24",
						height: "24",
				  })
				: null}
		</div>
	)
}
