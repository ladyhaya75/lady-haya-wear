import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
	dest: "public",
	register: true,
	skipWaiting: true,
	disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
	// ESLint 9 + @rushstack/eslint-patch : erreur "Failed to patch ESLint" connue avec `next lint` ;
	// le build ne lance pas ESLint ici ; lance `npm run lint` en local (ou l’IDE).
	eslint: {
		ignoreDuringBuilds: true,
	},
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
		formats: ["image/avif", "image/webp"],
		minimumCacheTTL: 86400,
		dangerouslyAllowSVG: true,
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
	},
	// Navigations client instantanées pendant 30s (Next.js 15+ met le cache dynamique à 0 par défaut)
	experimental: {
		staleTimes: {
			dynamic: 30,
		},
		// Tree-shaking des gros packages d'icônes et d'animations
		optimizePackageImports: ["lucide-react", "framer-motion", "@radix-ui/react-icons", "react-icons"],
	},
	// Configuration Turbopack pour spécifier le répertoire racine
	turbopack: {
		root: __dirname,
	},
	// Configuration pour les timeouts des API routes
	serverExternalPackages: ["@prisma/client", "@getbrevo/brevo"],
};

export default withPWA(nextConfig);
