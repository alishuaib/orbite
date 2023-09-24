import { supportedFormats, getScormView } from "@/lib/viewer-lib"
import { File } from "@/lib/@schemas"
import path from "path"

type ViewerFunction = (file: string) => Promise<string> | null
type SupportedFormats = (fileExt: string) => ViewerFunction | null

const formats = supportedFormats as SupportedFormats

export async function getViewer(f: File) {
	const viewer = formats(f.ext)
	if (viewer) {
		const content = await viewer(
			path.join(f.dir, f._ref).replace(/\\/g, "/")
		)
		return content
	}
	return null
}

export async function getViewerSCORM(fpath: string, id: string) {
	const content = await getScormView(fpath, { id: id })
	if (!content) return null
	return content
}
