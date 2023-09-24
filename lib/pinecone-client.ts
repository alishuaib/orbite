import { PineconeClient } from "@pinecone-database/pinecone"
import chalk from "chalk"

if (!process.env.PINECONE_API_KEY) {
	throw new Error('Invalid/Missing environment variable: "PINECONE_API_KEY"')
}

if (!process.env.PINECONE_ENVIRONMENT) {
	throw new Error(
		'Invalid/Missing environment variable: "PINECONE_ENVIRONMENT"'
	)
}

let clientPromise: Promise<PineconeClient>
const connect = (
	client: PineconeClient,
	environment: string,
	apiKey: string
) => {
	return new Promise<PineconeClient>((resolve, reject) => {
		const tStart = performance.now()
		client
			.init({
				environment: environment,
				apiKey: apiKey,
			})
			.then(() => {
				console.log(
					chalk.cyan("[DEVELOPMENT]"),
					":: pinecone client initialized in",
					performance.now() - tStart
				)
				resolve(client)
			})
			.catch((error) => {
				reject(error)
			})
	})
}

declare global {
	var _pineconeClientPromise: Promise<PineconeClient>
}

if (process.env.NODE_ENV === "development") {
	// In development mode, use a global variable so that the value
	// is preserved across module reloads caused by HMR (Hot Module Replacement).
	if (!globalThis._pineconeClientPromise) {
		console.log(
			chalk.cyan("[DEVELOPMENT]"),
			":: initializing pinecone client"
		)
		globalThis._pineconeClientPromise = connect(
			new PineconeClient(),
			process.env.PINECONE_ENVIRONMENT,
			process.env.PINECONE_API_KEY
		)
	}
	clientPromise = globalThis._pineconeClientPromise
} else {
	// In production mode, it's best to not use a global variable.
	clientPromise = connect(
		new PineconeClient(),
		process.env.PINECONE_ENVIRONMENT,
		process.env.PINECONE_API_KEY
	)
}

// Export a module-scoped PineconeClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise
