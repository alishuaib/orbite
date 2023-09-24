import { supportedFormats } from "@/lib/parse-lib"
import path from "path"
import formidable from "formidable"

type ParserFunction = (file: string, array: boolean) => Promise<string> | null
type SupportedFormats = (fileExt: string) => ParserFunction | null

const formats = supportedFormats as SupportedFormats

export async function parseFile(file: formidable.File) {
	const parser = formats(file.originalFilename?.split(".").pop() as string)
	if (parser) {
		const content = await parser(file.filepath, false)
		return content
	}
	return null
}

export async function slicer(
	content: string,
	maxWords: number,
	usePeriod = true
) {
	const slices = []
	const words = content.split(" ").filter((word) => word !== "")

	//Loop over each word in the parsed content
	let holder: string[] = []
	let lastPeriod = undefined
	for (let index = 0; index < words.length; index++) {
		const word = words[index]
		//Push each word into holder
		holder.push(word)
		if (word.includes(".")) {
			lastPeriod = index
		}

		//Check if holder has reached maxWords counts and push to slices then reset
		if (holder.length >= maxWords) {
			if (usePeriod) {
				//If usePeriod is true, check if last period is within 15 words of maxWords
				if (lastPeriod && index - lastPeriod <= 15) {
					//If so, slice at last period and keep words after in holder
					let periodIdx = holder.lastIndexOf(words[lastPeriod])
					slices.push(holder.slice(0, periodIdx + 1).join(" "))
					holder = holder.slice(periodIdx + 1)
				} else if (
					words
						.slice(index, index + 15)
						.filter((w) => w.includes(".")).length > 0
				) {
					//Check if there is a period within the next 15 words
					//If so, do nothing and let loop continue till it finds a period
					continue
				} else {
					//Otherwise default to maxWords
					slices.push(holder.join(" "))
					holder = []
				}
			} else {
				slices.push(holder.join(" "))
				holder = []
			}
		}
	}
	//Push any remaining words to slices
	slices.push(holder.join(" "))

	//Return sliced content
	return slices
}
