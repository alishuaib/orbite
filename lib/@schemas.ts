import { ObjectId } from "mongodb"

export type Auth = {
	_handle: string
	_id: string
	domain: string
	name: string
	api_key: string
	icon: string
	platform: "moodle" | "html" | "orbite"
	expire: string
}

export type Course = {
	_id: ObjectId | string
	title: string
	summary?: string
	icon: string
	label: string
	category: string
	slug: string
	version: string
	visible: boolean
	_ref: string
	meta?: any
}

export type Section = {
	_id: ObjectId | string
	title: string
	summary?: string
	duration?: number
	order: string
	slug: string
	visible: boolean
	version: string
	_course: string
	_ref: string
	_scorm?: string
	meta?: any
}

export type Activity = {
	_id: ObjectId | string
	title: string
	summary?: string
	duration?: number
	order: string
	slug: string
	visible: boolean
	version: string
	_course: string
	_section: string
	_ref: string
	_scorm?: string
	meta?: any
}

export type Content = {
	_id: ObjectId | string
	name: string
	ext: string
	dir: string
	metadata: {
		size: number | null
		mimetype: string | null
		mtime: Date | null | undefined
	}
	url: string
	visible: boolean
	version: string
	hash: string
	_course: string
	_section: string
	_activity: string
	_slices: string[]
	_resource?: string // Use for moodle resources
	_scorm?: string
	_scorm_ref?: string
	meta?: any
}
