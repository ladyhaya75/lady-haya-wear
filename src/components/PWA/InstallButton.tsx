"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallButton() {
	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null);
	const [showButton, setShowButton] = useState(false);

	useEffect(() => {
		// Vérifier si déjà installé
		const isStandalone =
			window.matchMedia("(display-mode: standalone)").matches ||
			(window.navigator as any).standalone === true;

		const hasInstalled = localStorage.getItem("pwa-installed");

		if (isStandalone || hasInstalled) {
			return;
		}

		// Écouter l'événement beforeinstallprompt
		const handleBeforeInstallPrompt = (e: Event) => {
			e.preventDefault();
			setDeferredPrompt(e as BeforeInstallPromptEvent);
			setShowButton(true);
		};

		window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

		return () => {
			window.removeEventListener(
				"beforeinstallprompt",
				handleBeforeInstallPrompt,
			);
		};
	}, []);

	const handleInstallClick = async () => {
		if (!deferredPrompt) {
			return;
		}

		deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;

		if (outcome === "accepted") {
			localStorage.setItem("pwa-installed", "true");
			setShowButton(false);
		}

		setDeferredPrompt(null);
	};

	if (!showButton) {
		return null;
	}

	return (
		<button
			onClick={handleInstallClick}
			className="flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-all shadow-md hover:shadow-lg"
			title="Installer l'application"
		>
			<Download className="h-4 w-4" />
			<span className="hidden sm:inline">Installer l'app</span>
		</button>
	);
}

