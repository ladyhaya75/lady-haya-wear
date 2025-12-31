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

		// Si l'app était installée mais ne l'est plus (désinstallée)
		if (hasInstalled && !isStandalone) {
			// L'app a été désinstallée, nettoyer le localStorage
			localStorage.removeItem("pwa-installed");
			localStorage.removeItem("pwa-install-declined");
		}

		// Ne pas afficher si déjà en mode standalone
		if (isStandalone) {
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
			className="flex items-center gap-2 rounded-full bg-rose-dark-2 border border-logo px-4 py-2 text-sm font-medium text-logo hover:scale-105 transition-all shadow-md hover:shadow-lg cursor-pointer"
			title="Installer l'application"
		>
			<Download className="h-4 w-4 text-logo" />
			<span className="hidden sm:inline">Installer l'app</span>
		</button>
	);
}

