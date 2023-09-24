// middleware.ts
import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { Auth } from "@/lib/@schemas"
import { Collection } from "mongodb"

import { authMiddleware } from "@clerk/nextjs"

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default authMiddleware({
	publicRoutes: ["/", "/(api|trpc)(.*)"],
})

export const config = {
	matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}

// This function can be marked `async` if using `await` inside
// export async function middleware(request: NextRequest) {
// 	//middleware for content-type for POST requests
// 	// if (
// 	// 	request.method == "POST" &&
// 	// 	request.headers.get("content-type") !== "application/json"
// 	// ) {
// 	// 	return new NextResponse(
// 	// 		JSON.stringify({
// 	// 			success: false,
// 	// 			message:
// 	// 				"Invalid Request Content Type :: Expected [application/json]",
// 	// 		}),
// 	// 		{ status: 401, headers: { "content-type": "application/json" } }
// 	// 	)
// 	// }

// 	return NextResponse.next()
// }

// // See "Matching Paths" below to learn more
// export const config = {
// 	matcher: "/api/:path*",
// }
