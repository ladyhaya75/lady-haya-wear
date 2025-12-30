import { CSRFProtection } from "@/components/Security/CSRFProtection";
import StudioWrapper from "@/components/StudioWrapper";
import LightImageProtection from "@/components/ui/LightImageProtection";
import { QueryProvider } from "@/providers/QueryProvider";
import { StoreProvider } from "@/stores/StoreProvider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
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
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="fr">
			<head>
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1"
				/>
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
							<Analytics />
							<SpeedInsights />
						</StoreProvider>
					</QueryProvider>
				</CSRFProtection>
			</body>
		</html>
	);
}
