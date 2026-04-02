import { CSRFProtection } from "@/components/Security/CSRFProtection";
import InstallPrompt from "@/components/PWA/InstallPrompt";
import StudioWrapper from "@/components/StudioWrapper";
import LightImageProtection from "@/components/ui/LightImageProtection";
import { QueryProvider } from "@/providers/QueryProvider";
import { StoreProvider } from "@/stores/StoreProvider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

export const metadata: Metadata = {
	metadataBase: new URL("https://ladyhaya-wear.fr"),
	title: {
		default: "Lady Haya Wear — La Modestie Sublimée",
		template: "%s | Lady Haya Wear",
	},
	description: "Découvrez Lady Haya Wear, votre boutique de vêtements élégants pour femmes musulmanes. Abayas, robes et tenues modestes alliant style et confort.",
	keywords: ["vêtements femmes musulmanes", "abaya", "hijab", "mode modeste", "lady haya wear", "tenue islamique"],
	authors: [{ name: "Lady Haya Wear" }],
	robots: {
		index: true,
		follow: true,
	},
	openGraph: {
		type: "website",
		locale: "fr_FR",
		url: "https://ladyhaya-wear.fr",
		siteName: "Lady Haya Wear",
		title: "Lady Haya Wear — La Modestie Sublimée",
		description: "Découvrez Lady Haya Wear, votre boutique de vêtements élégants pour femmes musulmanes. Abayas, robes et tenues modestes alliant style et confort.",
		images: [
			{
				url: "/assets/logo-haya.png",
				width: 512,
				height: 512,
				alt: "Lady Haya Wear",
			},
		],
	},
	twitter: {
		card: "summary",
		title: "Lady Haya Wear — La Modestie Sublimée",
		description: "Découvrez Lady Haya Wear, votre boutique de vêtements élégants pour femmes musulmanes.",
		images: ["/assets/logo-haya.png"],
	},
	icons: {
		icon: "/icon.png",
		apple: "/apple-touch-icon.png",
	},
	manifest: "/manifest.json",
	appleWebApp: {
		capable: true,
		statusBarStyle: "black-translucent",
		title: "Lady Haya Wear",
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	viewportFit: "cover",
	themeColor: "#8a5f3d",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="fr">
			<head>
				{/* Meta tags PWA */}
				<meta name="application-name" content="Lady Haya Wear" />
				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
				<meta name="apple-mobile-web-app-title" content="Lady Haya" />
				<meta name="format-detection" content="telephone=no" />
				
				{/* Icons PWA */}
				<link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
				<link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
			</head>
			<body className="antialiased">
				<CSRFProtection>
					<LightImageProtection />
					<QueryProvider>
						<StoreProvider>
							<StudioWrapper>{children}</StudioWrapper>

							<ToastContainer
								position="top-center"
								autoClose={4000}
								hideProgressBar={false}
								newestOnTop={true}
								closeOnClick
								rtl={false}
								pauseOnFocusLoss
								draggable
								pauseOnHover
								theme="light"
								limit={3}
								style={{
									zIndex: 99999,
								}}
								toastStyle={{
									zIndex: 99999,
								}}
							/>
							
							{/* PWA Install Prompt */}
							<InstallPrompt />
							
							<Analytics />
							<SpeedInsights />
						</StoreProvider>
					</QueryProvider>
				</CSRFProtection>
			</body>
		</html>
	);
}
