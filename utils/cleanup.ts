import { PrismaClient } from "@prisma/client"
let prisma = new PrismaClient()
import * as weaviate from "@/lib/weaviate"

export async function ERASE_ALL_CONTENT_DATA() {
	await weaviate.eraseCollection("content")
	await prisma.user.deleteMany()
	await prisma.content.deleteMany()
	await prisma.module.deleteMany()
	await prisma.section.deleteMany()
	await prisma.course.deleteMany()
}
