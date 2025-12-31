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
	title: "Lady Haya Wear",
	description: "Vêtements pour femmes musulmanes",
	icons: {
		icon: "/icon.png",
		apple: "/apple-touch-icon.png",
	},
	manifest: "/manifest.json",
	appleWebApp: {
		capable: true,
		statusBarStyle: "black-translucent",
		title: "Lady Haya",
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
