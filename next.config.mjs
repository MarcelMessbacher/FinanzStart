/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	experimental: {
		typedRoutes: true
	},
	// Static export for GitHub Pages
	output: 'export',
	trailingSlash: true,
	images: { unoptimized: true },
	// Use repo name as basePath and assetPrefix in production so routes and /_next assets resolve on GitHub Pages
	// Adjust 'FinanzStart' below if your repository name differs
	basePath: process.env.NODE_ENV === 'production' ? '/FinanzStart' : undefined,
	assetPrefix: process.env.NODE_ENV === 'production' ? '/FinanzStart' : undefined
};

export default nextConfig;

