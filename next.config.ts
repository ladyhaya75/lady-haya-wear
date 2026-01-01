import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
	dest: "public",
	register: true,
	skipWaiting: true,
	disable: process.env.NODE_ENV === "development",
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
	serverExternalPackages: ["@prisma/client", "@getbrevo/brevo"],
};

export default withPWA(nextConfig);
