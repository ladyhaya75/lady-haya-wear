"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallButtonMenu() {
	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null);
	const [isStandalone, setIsStandalone] = useState(false);
	const [isIOS, setIsIOS] = useState(false);

	useEffect(() => {
		// Vérifier si déjà installé
		const standalone =
			window.matchMedia("(display-mode: standalone)").matches ||
			(window.navigator as any).standalone === true;
		setIsStandalone(standalone);

		// Vérifier si iOS
		const userAgent = window.navigator.userAgent.toLowerCase();
		const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
		setIsIOS(isIOSDevice);

		const hasInstalled = localStorage.getItem("pwa-installed");

		// Si l'app était installée mais ne l'est plus (désinstallée)
		if (hasInstalled && !standalone) {
			localStorage.removeItem("pwa-installed");
			localStorage.removeItem("pwa-install-declined");
		}

		// Ne rien faire si déjà installé
		if (standalone) {
			return;
		}

		// Écouter l'événement beforeinstallprompt
		const handleBeforeInstallPrompt = (e: Event) => {
			e.preventDefault();
			setDeferredPrompt(e as BeforeInstallPromptEvent);
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
		if (!deferredPrompt && !isIOS) {
			return;
		}

		if (deferredPrompt) {
			// Android/Desktop
			deferredPrompt.prompt();
			const { outcome } = await deferredPrompt.userChoice;

			if (outcome === "accepted") {
				localStorage.setItem("pwa-installed", "true");
			}

			setDeferredPrompt(null);
		}
	};

	// Ne rien afficher si déjà installé
	if (isStandalone) {
		return null;
	}

	// Pour iOS, afficher un message d'instruction
	if (isIOS && !deferredPrompt) {
		return (
			<div className="flex flex-col items-center gap-2 px-4">
				<div className="flex items-center gap-2 text-logo">
					<Smartphone className="h-5 w-5" />
					<p className="text-sm text-center">
						Appuyez sur <span className="font-bold">Partager 📤</span> puis{" "}
						<span className="font-bold">"Sur l'écran d'accueil"</span>
					</p>
				</div>
			</div>
		);
	}

	// Si pas de prompt disponible (pas encore déclenché ou navigateur incompatible)
	if (!deferredPrompt && !isIOS) {
		return (
			<div className="flex items-center gap-2 text-nude-dark text-sm">
				<Smartphone className="h-4 w-4" />
				<span>Installation disponible prochainement</span>
			</div>
		);
	}

	// Bouton d'installation (Android/Desktop)
	return (
		<button
			onClick={handleInstallClick}
			className="flex items-center gap-2 rounded-full bg-logo px-6 py-3 text-sm font-medium text-white hover:bg-nude-dark-2 transition-all shadow-md hover:shadow-lg"
			title="Installer l'application"
		>
			<Download className="h-5 w-5" />
			<span>Installer l'app</span>
		</button>
	);
}

