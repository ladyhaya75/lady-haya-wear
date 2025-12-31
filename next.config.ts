import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
	dest: "public",
	register: true,
	skipWaiting: true,
	disable: process.env.NODE_ENV === "development",
	// Configuration avancée du cache
	runtimeCaching: [
		{
			urlPattern: /^https:\/\/cdn\.sanity\.io\/.*/i,
			handler: "CacheFirst",
			options: {
				cacheName: "sanity-images",
				expiration: {
					maxEntries: 100,
					maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours
				},
			},
		},
		{
			urlPattern: /^https:\/\/.*\.apicdn\.sanity\.io\/.*/i,
			handler: "CacheFirst",
			options: {
				cacheName: "sanity-api-images",
				expiration: {
					maxEntries: 100,
					maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours
				},
			},
		},
		{
			urlPattern: /\/api\/.*/i,
			handler: "NetworkFirst",
			options: {
				cacheName: "api-cache",
				expiration: {
					maxEntries: 50,
					maxAgeSeconds: 5 * 60, // 5 minutes
				},
			},
		},
	],
});

const nextConfig: NextConfig = {
	// Configuration pour les images
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "cdn.sanity.io",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "*.apicdn.sanity.io",
				port: "",
				pathname: "/**",
			},
		],
		// Configuration pour améliorer la fiabilité des images
		formats: ["image/webp", "image/avif"],
		minimumCacheTTL: 60,
		dangerouslyAllowSVG: true,
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
	},
	// Configuration Turbopack pour spécifier le répertoire racine
	turbopack: {
		root: __dirname,
	},
	// Configuration pour les timeouts des API routes
	serverExternalPackages: ["@prisma/client"],
};

export default withPWA(nextConfig);
