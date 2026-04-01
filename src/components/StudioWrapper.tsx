"use client";
import { usePathname } from "next/navigation";
import Footer from "./Footer/Footer";
import Menu from "./Menu/Menu";
import Navbar from "./Navbar/Navbar";

interface StudioWrapperProps {
	children: React.ReactNode;
}

export default function StudioWrapper({ children }: StudioWrapperProps) {
	const pathname = usePathname();
	const isStudio = pathname.startsWith("/studio");
	const isCheckout = pathname.startsWith("/checkout");
	const isDashboard = pathname.startsWith("/dashboard");
	const isAdminLogin = pathname.startsWith("/admin-login");
	const isComingSoon = pathname.startsWith("/coming-soon");

	if (isStudio || isCheckout || isDashboard || isAdminLogin || isComingSoon) {
		return <>{children}</>;
	}

	return (
		<>
			<Navbar />
			<Menu />
			{children}
			<Footer />
		</>
	);
}
