import { time } from "console"
import { NextApiRequest, NextApiResponse } from "next/types"

import fs from "fs/promises"
const path = require("path")

import formidable from "formidable"
interface FormidableResult {
	err: any | null
	fields: formidable.Fields
	files: formidable.Files
}
export const config = {
	api: {
		bodyParser: false,
	},
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const { headers, query } = req

	let data: FormidableResult | null = null
	try {
		data = await new Promise((resolve, reject) => {
			const form = formidable()
			console.log("Downloading files")
			form.parse(req, (err, fields, files) => {
				if (err) reject({ err })
				resolve({ err, fields, files })
			})
		})
	} catch (error) {
		console.error(error)
		res.status(400).json({
			status: "failed",
			message: "Unable to parse form data",
		})
		return
	}

	if (!data || data.err) {
		res.status(400).json({
			status: "failed",
			message: "Unable to parse form data",
		})
		return
	}
	console.log("Download complete")
	const body = JSON.parse(data.fields.body as string)
	const files = Object.values(data.files).flat() as formidable.File[]

	// console.info("api/form", new Date().toLocaleTimeString(), data)
	//Move File to target directory
	for (const file of files) {
		console.info(file.filepath, file.newFilename)
		const oldPath = path.join(file.filepath)
		const newPath = path.join(
			process.env.FILE_UPLOAD_DIR as string,
			"temp",
			"test",
			file.newFilename
		)

		const newDir = path.dirname(newPath)
		try {
			await fs.mkdir(newDir, { recursive: true })
			await fs.copyFile(oldPath, newPath)
			await fs.unlink(oldPath)
			console.log("File moved successfully")
		} catch (error) {
			console.error(error)
			res.status(400).json({
				status: "failed",
				message: "Unable to move file",
			})
		}
	}

	//Print request recieved time
	console.info(
		"api/form",
		new Date().toLocaleTimeString(),
		JSON.stringify(body, null, 4)
	)

	return res.status(200).json({
		status: "success",
		message: "Files uploaded successfully",
	})
}
