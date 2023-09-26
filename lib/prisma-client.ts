import { PrismaClient } from "@prisma/client"

let prisma: PrismaClient

declare global {
	var _prismaClientPromise: PrismaClient
}

if (process.env.NODE_ENV === "development") {
	// In development mode, use a global variable so that the value
	// is preserved across module reloads caused by HMR (Hot Module Replacement).
	if (!globalThis._prismaClientPromise) {
		globalThis._prismaClientPromise = new PrismaClient()
	}
	prisma = globalThis._prismaClientPromise
} else {
	// In production mode, it's best to not use a global variable.
	prisma = new PrismaClient()
}

export default prisma
