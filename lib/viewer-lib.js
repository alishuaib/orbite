import { readFile, stat, writeFile, mkdir } from "fs/promises"
import { promisify } from "util"
import { createRequire } from "module"
import { exec } from "child_process"
import { convert } from "libreoffice-convert"
import admZip from "adm-zip"
import path from "path"
// import dotenv from "dotenv"
import { getSubtitlesText } from "./parse-lib"

// dotenv.config()

const execAsync = promisify(exec)
const convertAsync = promisify(convert)

const libreConvert = async (file) => {
	try {
		const data = await readFile(file)
		return await convertAsync(data, ".pdf", undefined)
	} catch (err) {
		console.error("Error:", err)
	}
}

const convertToPdf = async (file, [proc, bufferSize]) => {
	try {
		const processes = {
			unoconv: `docker exec converter unoconv --stdout --format pdf "/filesystem/${file}"`,
			unoconvert: `docker exec converter unoconvert --convert-to pdf "/filesystem/${file}" -`,
			"libreoffice-convert": async () =>
				await libreConvert(
					path.join(process.env.FILE_UPLOAD_DIR, file)
				),
		}

		const processList = Object.keys(processes)

		let command = processes["unoconv"]
		if (!processList.includes(proc)) {
			console.log(
				"Note:",
				"Provided process is not available, using: unoconv"
			)
		} else if (typeof processes[proc] === "function") {
			return await processes[proc]()
		} else {
			command = processes[proc]
		}

		let bufferSizeLimit = await stat(
			path.join(process.env.FILE_UPLOAD_DIR, file)
		).size
		if (bufferSize && bufferSize < bufferSizeLimit) {
			console.log("Warning:", "Provided buffer size may be too small.")
			bufferSizeLimit = bufferSize
		} else if (bufferSize) {
			bufferSizeLimit = bufferSize
		}

		const commandOptions = {
			encoding: "buffer",
			maxBuffer: bufferSizeLimit,
		}

		const { stdout, stderr } = await execAsync(command, commandOptions)
		if (stderr) {
			console.error(stderr.toString("utf-8"))
		}
		if (stdout) {
			return stdout
		}
	} catch (err) {
		console.error("Error:", err)
	}
}

const createframe = async (data, file) => {
	if (!file) {
		data = Buffer.from(data, "utf-8").toString("base64")
		data = `data:application/pdf;base64,${data}`
	}
	return `<iframe\n\tsrc="${data}"\n\twidth="100%"\n\theight="100%"\n</iframe>>`
}

export const getMimeType = async (file) => {
	try {
		const command = `mimetype ${file}`
		const { stdout, stderr } = await execAsync(command)
		if (stderr) {
			console.error(stderr)
		}
		if (stdout) {
			return stdout.split(":")[1].trim()
		}
	} catch (err) {
		console.error("Error:", err)
	}
}

export const getPdfView = async (file) => {
	try {
		let data = await readFile(file)
		return await createframe(data)
	} catch (err) {
		console.error("Error:", err)
	}
}

export const getDocxView = async (file) => {
	try {
		let data = await convertToPdf(file, ["unoconv"])
		let frame = await createframe(data)
		return frame
	} catch (err) {
		console.error("Error:", err)
	}
}

export const getPptxView = async (file) => {
	return await getDocxView(file)
}

export const verifyScorm = async (file) => {
	try {
		const manifest = admZip(file).getEntry("imsmasnifest.xml")
		if (!manifest) {
			return null
		}
	} catch (err) {
		console.error("Error:", err)
	}
}

// /moonlite/:handle/:course/:module/:file
export const getScormView = async (file, options = {}) => {
	let { id = null } = options
	try {
		const tmp = path.join(process.env.LMS_DIR, path.basename(file))
		let index
		const unzip = admZip(path.join(process.env.FILE_UPLOAD_DIR, file))
		const entries = unzip.getEntries()

		entries.forEach((entry) => {
			if (
				!entry.entryName.includes("scormcontent/") ||
				entry.isDirectory
			) {
				return
			}

			let target = entry.entryName
				.replace("scormcontent/", "")
				.replace(entry.name, "")
			target = path.join(tmp, target)

			if (entry.name == "index.html") {
				target = path.join(tmp, "viewer")

				index =
					`/lms/${path.basename(file)}/viewer` +
					(id ? `#/lessons/${id}` : "")
			}

			mkdir(target, { recursive: true })
			unzip.extractEntryTo(entry.entryName, target, false, true)
		})

		return createframe(index, true)
	} catch (err) {
		console.error("Error:", err)
	}
}

export const getSubtitlesView = async (file) => {
	function formatSeconds(seconds) {
		const hours = Math.floor(seconds / 3600)
		const minutes = Math.floor((seconds % 3600) / 60)
		const remainingSeconds = seconds % 60
		return `${hours.toString().padStart(2, "0")}:${minutes
			.toString()
			.padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
	}
	try {
		const content = await getSubtitlesText(file, { json: true })
		return `<div class="overflow-y-auto h-screen"><div class="flex flex-col py-10 px-28 bg-gray-300 h-fit w-full">${content
			.map((slice, idx) => {
				return `<div class="flex w-full bg-zinc-900 hover:bg-zinc-700 transition-all px-6 py-2 gap-8 border-t-2 border-t-zinc-700">
								<div class="flex text-zinc-400  gap-3">
									<p class="w-6">${idx + 1}.</p>
									<div class="flex flex-col justify-between">
										<p>${formatSeconds(slice.startTime)}</p>
										<p>${formatSeconds(slice.endTime)}</p>
									</div>
								</div>
								<p class="text-zinc-200  whitespace-pre-wrap leading-relaxed">${slice.subs
									.join("\n")
									.trim()}</p></div>`
			})
			.join(" ")}</div></div>`
	} catch (err) {
		console.error("Error:", err)
	}
}

export const supportedFormats = (fileExt) => {
	const formats = {
		srt: (f) => getSubtitlesView(process.env.FILE_UPLOAD_DIR + f),
		pdf: (f) => getPdfView(process.env.FILE_UPLOAD_DIR + f),
		docx: getDocxView,
		doc: getDocxView,
		pptx: getPptxView,
		zip: getScormView,
		scorm: getScormView,
	}

	const ext = fileExt.replace(".", "")

	if (Object.keys(formats).includes(ext)) {
		return formats[ext]
	} else {
		return null
	}
}
