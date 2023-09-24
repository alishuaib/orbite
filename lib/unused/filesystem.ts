import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import clientPromise from "../mongodb"

export function assignUUID(handle: string, course: string, module: string) {
	let renamed: object[] = []
	const dir = path.join("..", "filesystem", handle, course, module)
	fs.readdir(dir, async (err, files) => {
		if (err) {
			console.error("Error reading directory:", err)
			throw err
		}

		const client = await clientPromise
		const collection = client.db("Orbite").collection("file_reference")
		collection.deleteMany({})

		files.forEach(async (file) => {
			const UUID = uuidv4()
			const data = path.parse(path.join(dir, file))
			let result = await collection.insertOne({
				_ref: UUID,
				name: data.name,
				ext: data.ext,
				dir: data.dir,
				handle: handle,
				course: course,
				module: module,
			})

			if (result?.acknowledged) {
				fs.rename(path.join(dir, file), path.join(dir, UUID), (err) => {
					if (err) {
						console.error("Error renaming file:", err)
						throw err
					}

					console.log(`File "${file}" renamed to "${UUID}"`)
				})
			}

			renamed.push({
				success: result?.acknowledged,
				ref: UUID,
				name: file,
			})
		})
	})

	return renamed
}

export function parseFile(filePath: string, fileName: string, fileExt: string) {
	const dir = path.join(
		process.env.FILE_UPLOAD_DIR as string,
		filePath,
		fileName
	)
	const output = FilePlugin[".srt"](fs.readFileSync(dir, "utf8"))
	return output
}

const FilePlugin = {
	".srt": (doc: string) => {
		let Length = doc.length
		let FirstSumbol = true
		let CancelExit = false
		var strOut = ""

		for (let i = 0; i < Length; i++) {
			let ch = doc.substring(i, i + 1)
			if (FirstSumbol) {
				if (ch >= "0" && ch <= "9") {
					CancelExit = true
					FirstSumbol = false
				} else {
					CancelExit = false
					strOut += "\n"
					FirstSumbol = false
				}
			}
			if (ch == "\n") {
				FirstSumbol = true
			}

			if (!CancelExit && !FirstSumbol) {
				strOut += ch
			} else continue
		}
		return strOut
	},
}
