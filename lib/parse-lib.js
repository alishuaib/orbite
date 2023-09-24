import { readFile, writeFile } from "fs/promises"
import { dirname, basename, extname } from "path"
import { XMLParser } from "fast-xml-parser"
import pdfjs from "pdfjs-dist"
import admZip from "adm-zip"

export const getTxtText = async (file, options = {}) => {
	let { array = false, joinStr = "\n" } = options
	let txt = await readFile(file, "utf-8")
	txt = txt.replace(/\r\n/g, "\n").split("\n")
	if (!array) {
		txt = txt.join(joinStr)
	}
	return txt
}

export const getSubtitlesText = async (file, options = {}) => {
	let {
		array = false,
		json = false,
		paragraph = true,
		interval = 90,
		joinStr = "\n",
	} = options

	let subs = await readFile(file, "utf-8")
	let subsArray = []

	subs = subs
		.replace(/\r\n/g, "\n")
		.split("\n")
		.map((sub) => {
			return sub.trim()
		})
		.filter((sub) => {
			return sub !== "" && isNaN(sub)
		})

	subs.forEach((sub, i) => {
		if (!sub.includes(" --> ")) {
			return
		}
		let subObj = { startTime: null, endTime: null, subs: [] }

		;[subObj.startTime, subObj.endTime] = sub.split(" --> ").map((time) => {
			time = time
				.split(",")[0]
				.split(":")
				.map((t) => {
					return Number(t)
				})
			return time[0] * 3600 + time[1] * 60 + time[2]
		})

		for (let j = i + 1; j < subs.length; j++) {
			if (subs[j].includes(" --> ")) {
				break
			}
			subObj.subs.push(subs[j])
		}

		subsArray.push(subObj)
	})

	if (json) {
		return subsArray
	}

	if (!interval) {
		subs = subsArray
			.map((sub) => {
				return sub.subs
			})
			.flat()
	} else {
		subs = []
		let [splitTime, intervalArr] = [subsArray[0].endTime + interval, []]

		subsArray.forEach((sub) => {
			intervalArr = intervalArr.concat(sub.subs)
			if (sub.endTime > splitTime) {
				subs.push(intervalArr)
				intervalArr = []
				splitTime += interval
			}
		})

		subs.push(intervalArr)
		joinStr += joinStr
	}

	if (paragraph && interval) {
		subs = subs.map((sub) => {
			return sub.join(" ")
		})
	} else if (paragraph) {
		subs = [subs.join(" ")]
	}

	if (!array && !paragraph && interval) {
		subs = subs
			.map((sub) => {
				return sub.join("\n")
			})
			.join(joinStr)
	} else if (!array) {
		subs = subs.join(joinStr)
	}

	return subs
}

export const getPdfText = async (file, options = {}) => {
	let { array = false, joinStr = "\n" } = options
	try {
		let pdf = await pdfjs.getDocument(file).promise
		let pdfArray = []

		for (let i = 1; i <= pdf.numPages; i++) {
			let page = await pdf.getPage(i)
			let content = await page.getTextContent()
			content = content.items.map((item) => {
				return item.str
			})
			pdfArray.push(content)
		}

		if (!array) {
			pdfArray = pdfArray.flat().join(joinStr)
		}

		return pdfArray
	} catch (err) {
		console.error(err)
	}
}

const parseMarkup = (markup, array) => {
	const [markupRegex, entitiesRegex, unicodeRegex, textRegex] = [
		new RegExp("<[^>]+>((?:[^<]+|<(?!\\/[^>]+>))*)(?=<\\/[^>]+>)", "g"),
		new RegExp("&(\\w+);", "g"),
		new RegExp("&#(\\d+);|&#[xX]([a-fA-F0-9]+);", "g"),
		new RegExp("<[^>]+>", "g"),
	]

	let text = markup.match(markupRegex)
	if (text == null) {
		return markup
	}

	text = text
		.map((txt) => {
			return txt
				.replace(entitiesRegex, (entity) => {
					return ""
				})
				.replace(unicodeRegex, (entity) => {
					return ""
				})
				.replace(textRegex, "")
				.trim()
		})
		.filter((txt) => {
			return txt !== ""
		})

	if (!array) {
		text = text.join(" ")
	}

	return text
}

const getJsonValues = (obj, textKeys) => {
	const excludeValues = [null, "", " "]
	let values = []

	Object.entries(obj).forEach(([key, value]) => {
		if (excludeValues.includes(value)) {
			return
		}

		if (textKeys.includes(key)) {
			values.push(value)
		} else if (typeof value == "object") {
			values = values.concat(getJsonValues(value, textKeys))
		}
	})

	return values
}

export const getDocxText = async (file, options = {}) => {
	let { array = false, joinStr = "\n\n" } = options
	try {
		const unzip = new admZip(file)
		const entry = unzip.getEntry("word/document.xml")

		let xml = await new Promise((res, rej) => {
			unzip.readAsTextAsync(entry, (txt) => {
				res(txt)
			})
		})

		const xmlParser = new XMLParser({
			trimValues: false,
			processEntities: true,
		})

		let text = xmlParser.parse(xml)["w:document"]["w:body"]["w:p"]

		text = text
			.map((txt) => {
				return getJsonValues(txt, ["w:t"]).join("")
			})
			.filter((txt) => {
				return txt !== ""
			})

		if (!array) {
			text = text.join(joinStr)
		}

		return text
	} catch (err) {
		console.error(err)
	}
}

export const getPptxText = async (file, options = {}) => {
	let { array = false, joinStr = "\n\n" } = options
	try {
		let slides = []
		const unzip = new admZip(file)
		const entries = unzip.getEntries()

		for (let i = 0; i < entries.length; i++) {
			const entry = entries[i]

			if (
				dirname(entry.entryName) !== "ppt/slides" ||
				extname(entry.entryName) !== ".xml"
			) {
				continue
			}

			const xml = await new Promise((res, rej) => {
				unzip.readAsTextAsync(entry, (txt) => {
					res(txt)
				})
			})

			const xmlParser = new XMLParser({
				trimValues: false,
				processEntities: true,
			})

			let text = xmlParser.parse(xml)

			text = getJsonValues(text, ["p:txBody", "a:txBody"])
				.map((txt) => {
					return getJsonValues(txt, ["a:t"]).join("")
				})
				.filter((txt) => {
					return txt !== ""
				})

			slides.push(text)
		}

		if (!array) {
			slides = slides
				.map((slide) => {
					return slide.join("\n")
				})
				.join(joinStr)
		}

		return slides
	} catch (err) {
		console.error(err)
	}
}

export const verifyScorm = (file) => {
	try {
		let verify = null
		const unzip = new admZip(file)
		const manifestEntry = unzip.getEntry("imsmanifest.xml")
		const metaEntry = unzip.getEntry("meta.xml")

		if (manifestEntry && metaEntry) {
			verify = "storyline"
		} else if (manifestEntry) {
			verify = "rise"
		}

		return verify
	} catch (err) {
		console.error(err)
	}
}

const decodeRiseJson = (html) => {
	const startIdx = html.indexOf('"', html.indexOf("window.courseData")) + 1
	const endIdx = html.indexOf('";')
	const encodedData = html.substring(startIdx, endIdx)
	return JSON.parse(Buffer.from(encodedData, "base64").toString("utf-8"))
}

const decodeStorylineJson = (js) => {
	js = js.replace("window.globalProvideData", "new Array")
	js = eval(js)
	return JSON.parse(js[1])
}

const getScormTitle = (manifest) => {
	const xmlParser = new XMLParser()
	const text = xmlParser.parse(manifest)
	return text.manifest.organizations.organization.title
}

const getScormRiseText = async (file, options = {}) => {
	let { json = false, joinStr = "\n\n" } = options
	try {
		const [textKeys, exclusions] = [
			["title", "description", "heading", "caption", "paragraph"],
			["quiz"],
		]

		const unzip = admZip(file)
		const manifestEntry = unzip.getEntry("imsmanifest.xml")
		const indexEntry = unzip.getEntry("scormcontent/index.html")

		const manifestXml = await new Promise((res, rej) => {
			unzip.readAsTextAsync(manifestEntry, (txt) => {
				res(txt)
			})
		})

		const indexHtml = await new Promise((res, rej) => {
			unzip.readAsTextAsync(indexEntry, (txt) => {
				res(txt)
			})
		})

		const course = decodeRiseJson(indexHtml)
		const lessons = course.course.lessons

		let courseObj = {
			title: getScormTitle(manifestXml),
			id: course.course.id,
			description: parseMarkup(course.course.description),
			lessons: [],
		}

		lessons.forEach((lesson, i) => {
			if (lesson.type !== "section") {
				return
			}

			let lessonObj = {
				title: lesson.title,
				id: lesson.id,
				blocks: [],
			}

			for (let j = i + 1; j < lessons.length; j++) {
				lesson = lessons[j]

				if (lesson.type == "section") {
					break
				} else if (exclusions.includes(lesson.type)) {
					continue
				}

				let blockObj = {
					title: lesson.title,
					id: lesson.id,
					items: getJsonValues(lesson, textKeys),
				}

				if (!blockObj.items.length) {
					continue
				}

				blockObj.items = blockObj.items.map((item) => {
					return parseMarkup(item)
				})

				if (blockObj.items[0] == blockObj.title) {
					blockObj.items.shift()
				}

				lessonObj.blocks.push(blockObj)
			}

			if (lessonObj.blocks.length) {
				courseObj.lessons.push(lessonObj)
			}
		})

		if (json) {
			return courseObj
		}

		let courseStr = getJsonValues(courseObj, [
			"title",
			"description",
			"items",
		])
		courseStr = courseStr.flat().join(joinStr)

		return courseStr
	} catch (err) {
		console.error(err)
	}
}

const getScormStorylineText = async (file, options = {}) => {
	let { json = false, joinStr = "\n\n" } = options
	try {
		const textKeys = ["altText"]

		const unzip = new admZip(file)
		const manifestEntry = unzip.getEntry("imsmanifest.xml")
		const dataEntry = unzip.getEntry("html5/data/js/frame.js")

		const manifestXml = await new Promise((res, rej) => {
			unzip.readAsTextAsync(manifestEntry, (txt) => {
				res(txt)
			})
		})

		const frameJs = await new Promise((res, rej) => {
			unzip.readAsTextAsync(dataEntry, (txt) => {
				res(txt)
			})
		})

		const frame = decodeStorylineJson(frameJs)
		const lessons = frame.navData.outline.links

		let courseObj = {
			title: getScormTitle(manifestXml),
			lessons: [],
		}

		for (let i = 0; i < lessons.length; i++) {
			let lessonObj = {
				title: lessons[i].displaytext,
				blocks: [],
			}

			const blocks = lessons[i].links

			for (let j = 0; j < blocks.length; j++) {
				let blockObj = {
					title: blocks[j].displaytext,
					items: [],
				}

				const blockId = blocks[j].slideid.split(".").pop()
				const blockEntry = unzip.getEntry(`html5/data/js/${blockId}.js`)

				const blockJs = await new Promise((res, rej) => {
					unzip.readAsTextAsync(blockEntry, (txt) => {
						res(txt)
					})
				})

				const block = decodeStorylineJson(blockJs)

				block.slideLayers.forEach((layer) => {
					layer.objects.forEach((obj) => {
						if (obj.hasOwnProperty("textLib")) {
							blockObj.items = blockObj.items.concat(
								getJsonValues(obj, textKeys)
							)
						}
					})
				})

				lessonObj.blocks.push(blockObj)
			}

			courseObj.lessons.push(lessonObj)
		}

		if (json) {
			return courseObj
		}

		let courseStr = getJsonValues(courseObj, [
			"title",
			"description",
			"items",
		])
		courseStr = courseStr.flat().join(joinStr)

		return courseStr
	} catch (err) {
		console.error(err)
	}
}

export const getScormCourseText = async (file, options = {}) => {
	let { json = false, joinStr = "\n\n" } = options
	const verify = verifyScorm(file)
	let text = null

	if (verify == "rise") {
		return await getScormRiseText(file, options)
	} else if (verify == "storyline") {
		return await getScormStorylineText(file, options)
	}

	return text
}

export const supportedFormats = (fileExt) => {
	const formats = {
		srt: getSubtitlesText,
		pdf: getPdfText,
		docx: getDocxText,
		doc: getDocxText,
		pptx: getPptxText,
		zip: getScormCourseText,
		txt: getTxtText,
		scorm: getTxtText,
	}

	const ext = fileExt.replace(".", "")

	if (Object.keys(formats).includes(ext)) {
		return formats[ext]
	} else {
		return null
	}
}
