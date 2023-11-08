import { Prisma } from "@prisma/client"

const authTYPE = Prisma.validator<Prisma.AuthDefaultArgs>()({
	include: { user: true },
})
type Auth = Prisma.AuthGetPayload<typeof authTYPE>
export type { Auth }

const userTYPE = Prisma.validator<Prisma.UserDefaultArgs>()({
	include: {
		config: {
			include: {
				chat_config: true,
			},
		},
		auth: true,
	},
})

type User = Prisma.UserGetPayload<typeof userTYPE>
export type { User }

const courseTYPE = Prisma.validator<Prisma.CourseDefaultArgs>()({
	include: {
		sections: { include: { modules: { include: { contents: true } } } },
		auth: true,
	},
})
type Course = Prisma.CourseGetPayload<typeof courseTYPE>
export type { Course }

const sectionTYPE = Prisma.validator<Prisma.SectionDefaultArgs>()({
	include: {
		modules: { include: { contents: true } },
		auth: true,
		parent: true,
	},
})
type Section = Prisma.SectionGetPayload<typeof sectionTYPE>
export type { Section }

const moduleTYPE = Prisma.validator<Prisma.ModuleDefaultArgs>()({
	include: {
		contents: true,
		auth: true,
		parent: { include: { parent: true } },
	},
})
type Module = Prisma.ModuleGetPayload<typeof moduleTYPE>
export type { Module }

const contentTYPE = Prisma.validator<Prisma.ContentDefaultArgs>()({
	include: {
		auth: true,
		parent: { include: { parent: { include: { parent: true } } } },
	},
})
type Content = Prisma.ContentGetPayload<typeof contentTYPE>
export type { Content }

type Preview = {
	content_id: number
	course_id: number
	module_id: number
	section_id: number
	text: string[]
}
export type { Preview }

type GenerativeAnswer = {
	data: {
		Get: {
			Content: [
				{
					_additional: {
						generate: {
							error: any | null
							singleResult: string
						}
					}
					content_id: number
					course_id: number
					module_id: number
					section_id: number
					slice_index: number
					text: string
				}
			]
		}
	}
}
export type { GenerativeAnswer }

type Session = {
	course_id?: string
	course_title?: string
	expiry: number
}

export type { Session }
