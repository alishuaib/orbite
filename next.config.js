/** @type {import('next').NextConfig} */
const nextConfig = {
	rewrites: async () => {
		return [
			{
				source: "/lms/:id/viewer",
				destination: "/lms/:id/viewer/index.html",
			},
			{
				source: "/lms/:id/lib/:path*",
				destination: "/lms/:id/lib/:path*",
			},
			{
				source: "/lms/:id/assets/:path*",
				destination: "/lms/:id/assets/:path*",
			},
			{
				source: "/moodle",
				destination: "http://localhost:8000/my/",
			},
			{
				source: "/sandbox",
				destination: "/sandbox.html",
			},
			{
				source: "/:path*",
				has: [
					{
						type: "header",
						key: "x-orbite-api-key",
					},
				],
				destination: "/:path*",
			},
			// {
			// 	source: "/:path*",
			// 	destination: "/",
			// },
		]
	},
}

module.exports = nextConfig
