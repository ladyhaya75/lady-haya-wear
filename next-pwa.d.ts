declare module "next-pwa" {
	import { NextConfig } from "next";

	interface PWAConfig {
		dest?: string;
		register?: boolean;
		skipWaiting?: boolean;
		disable?: boolean;
		runtimeCaching?: Array<{
			urlPattern: RegExp | string;
			handler:
				| "CacheFirst"
				| "CacheOnly"
				| "NetworkFirst"
				| "NetworkOnly"
				| "StaleWhileRevalidate";
			options?: {
				cacheName?: string;
				expiration?: {
					maxEntries?: number;
					maxAgeSeconds?: number;
				};
			};
		}>;
	}

	export default function withPWA(
		config: PWAConfig,
	): (nextConfig: NextConfig) => NextConfig;
}

