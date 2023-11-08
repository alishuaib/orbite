"use client"
import {
	DefaultExtensionType,
	FileIcon as FI,
	defaultStyles,
} from "react-file-icon"
export default function FileIcon({
	ext,
	width = "auto",
	height = "120px",
}: {
	ext: string
	width?: string
	height?: string
}) {
	return (
		<div id="fileDisplay">
			<style>
				{`#fileDisplay svg {width: ${width} !important; height: ${height} ;flex:none}`}
			</style>
			<FI
				extension={ext}
				{...defaultStyles[ext as DefaultExtensionType]}
			/>
		</div>
	)
}
