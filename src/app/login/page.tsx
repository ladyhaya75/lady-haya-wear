import Loader from "@/components/Loader";
import LoginClient from "@/components/LoginClient/LoginClient";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
	robots: { index: false },
};

export default function Page() {
	return (
		<Suspense fallback={<Loader size={64} />}>
			<LoginClient />
		</Suspense>
	);
}
