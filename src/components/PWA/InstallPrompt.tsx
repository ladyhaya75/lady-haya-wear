"use client";

import { useEffect, useState } from "react";
import { X, Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null);
	const [showPrompt, setShowPrompt] = useState(false);
	const [isIOS, setIsIOS] = useState(false);
	const [isStandalone, setIsStandalone] = useState(false);

	useEffect(() => {
		// Vérifier si on est sur iOS
		const userAgent = window.navigator.userAgent.toLowerCase();
		const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
		setIsIOS(isIOSDevice);

		// Vérifier si déjà installé
		const isInStandaloneMode =
			window.matchMedia("(display-mode: standalone)").matches ||
			(window.navigator as any).standalone === true;
		setIsStandalone(isInStandaloneMode);

		// Vérifier si l'utilisateur a déjà refusé
		const hasDeclined = localStorage.getItem("pwa-install-declined");
		const hasInstalled = localStorage.getItem("pwa-installed");

		if (hasDeclined || hasInstalled || isInStandaloneMode) {
			return;
		}

		// Écouter l'événement beforeinstallprompt (Android/Desktop)
		const handleBeforeInstallPrompt = (e: Event) => {
			e.preventDefault();
			setDeferredPrompt(e as BeforeInstallPromptEvent);

			// Attendre 30 secondes avant d'afficher le prompt
			// (laisse le temps à l'utilisateur de découvrir le site)
			setTimeout(() => {
				setShowPrompt(true);
			}, 30000); // 30 secondes
		};

		window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

		// Pour iOS, afficher le prompt après 30s
		if (isIOSDevice && !isInStandaloneMode) {
			setTimeout(() => {
				setShowPrompt(true);
			}, 30000);
		}

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
			// Android/Desktop: Déclencher le prompt natif
			deferredPrompt.prompt();
			const { outcome } = await deferredPrompt.userChoice;

			if (outcome === "accepted") {
				localStorage.setItem("pwa-installed", "true");
			} else {
				localStorage.setItem("pwa-install-declined", "true");
			}

			setDeferredPrompt(null);
			setShowPrompt(false);
		}
	};

	const handleDismiss = () => {
		setShowPrompt(false);
		// Enregistrer le refus mais permettre de réafficher après 7 jours
		const declineDate = new Date().getTime();
		localStorage.setItem("pwa-install-declined", declineDate.toString());
	};

	// Ne rien afficher si déjà installé ou pas de prompt disponible
	if (isStandalone || !showPrompt) {
		return null;
	}

	return (
		<>
			{/* Android/Desktop Prompt */}
			{!isIOS && deferredPrompt && (
				<div className="fixed bottom-6 left-4 right-4 z-50 mx-auto max-w-md animate-slide-up">
					<div className="relative rounded-2xl bg-nude-light p-6 shadow-2xl border border-rose-medium">
						{/* Close Button */}
						<button
							onClick={handleDismiss}
							className="absolute right-3 top-3 rounded-full p-1 text-nude-dark hover:bg-rose-light hover:text-logo transition-colors"
							aria-label="Fermer"
						>
							<X className="h-5 w-5" />
						</button>

						{/* Icon */}
						<div className="mb-4 flex items-center gap-4">
							<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-logo">
								<Smartphone className="h-7 w-7 text-white" />
							</div>
							<div className="flex-1">
								<h3 className="text-lg font-bold text-logo font-balqis">
									Installer Lady Haya
								</h3>
								<p className="text-sm text-nude-dark">
									Accès rapide depuis votre écran d'accueil
								</p>
							</div>
						</div>

						{/* Benefits */}
						<ul className="mb-5 space-y-2 text-sm text-nude-dark">
							<li className="flex items-center gap-2">
								<span className="text-rose-dark-2">✓</span>
								<span>Ouverture instantanée</span>
							</li>
							<li className="flex items-center gap-2">
								<span className="text-rose-dark-2">✓</span>
								<span>Fonctionne hors ligne</span>
							</li>
							<li className="flex items-center gap-2">
								<span className="text-rose-dark-2">✓</span>
								<span>Notifications des nouveautés</span>
							</li>
						</ul>

						{/* Install Button */}
						<button
							onClick={handleInstallClick}
							className="w-full rounded-xl bg-logo py-3 px-4 font-semibold text-white hover:bg-nude-dark transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
						>
							<Download className="h-5 w-5" />
							Installer l'application
						</button>

						<button
							onClick={handleDismiss}
							className="mt-2 w-full py-2 text-sm text-nude-dark hover:text-logo transition-colors"
						>
							Peut-être plus tard
						</button>
					</div>
				</div>
			)}

			{/* iOS Instructions Prompt */}
			{isIOS && (
				<div className="fixed bottom-6 left-4 right-4 z-50 mx-auto max-w-md animate-slide-up">
					<div className="relative rounded-2xl bg-nude-light p-6 shadow-2xl border border-rose-medium">
						{/* Close Button */}
						<button
							onClick={handleDismiss}
							className="absolute right-3 top-3 rounded-full p-1 text-nude-dark hover:bg-rose-light hover:text-logo transition-colors"
							aria-label="Fermer"
						>
							<X className="h-5 w-5" />
						</button>

						{/* Icon */}
						<div className="mb-4 flex items-center gap-4">
							<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-logo">
								<Smartphone className="h-7 w-7 text-white" />
							</div>
							<div className="flex-1">
								<h3 className="text-lg font-bold text-logo font-balqis">
									Installer Lady Haya
								</h3>
								<p className="text-sm text-nude-dark">
									Ajoutez l'app à votre écran d'accueil
								</p>
							</div>
						</div>

						{/* iOS Instructions */}
						<div className="mb-5 space-y-3">
							<div className="rounded-xl bg-rose-light p-4 border border-rose-medium">
								<p className="mb-3 text-sm font-semibold text-logo font-balqis">
									📱 Instructions iOS :
								</p>
								<ol className="space-y-2 text-sm text-nude-dark">
									<li className="flex items-start gap-2">
										<span className="font-bold text-logo">1.</span>
										<span>
											Tapez sur le bouton{" "}
											<span className="inline-flex items-center rounded bg-rose-dark px-2 py-0.5 text-xs font-semibold text-logo">
												Partager 📤
											</span>{" "}
											en bas
										</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="font-bold text-logo">2.</span>
										<span>
											Sélectionnez{" "}
											<span className="font-semibold text-logo">
												"Sur l'écran d'accueil"
											</span>
										</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="font-bold text-logo">3.</span>
										<span>Confirmez en tapant "Ajouter"</span>
									</li>
								</ol>
							</div>

							{/* Benefits */}
							<ul className="space-y-2 text-sm text-nude-dark">
								<li className="flex items-center gap-2">
									<span className="text-rose-dark-2">✓</span>
									<span>Accès direct depuis l'écran d'accueil</span>
								</li>
								<li className="flex items-center gap-2">
									<span className="text-rose-dark-2">✓</span>
									<span>Chargement ultra-rapide</span>
								</li>
								<li className="flex items-center gap-2">
									<span className="text-rose-dark-2">✓</span>
									<span>Expérience app native</span>
								</li>
							</ul>
						</div>

						<button
							onClick={handleDismiss}
							className="w-full rounded-xl bg-rose-light py-3 px-4 font-semibold text-logo hover:bg-rose-dark transition-all border border-rose-medium"
						>
							J'ai compris
						</button>
					</div>
				</div>
			)}

			{/* Animation CSS */}
			<style jsx>{`
				@keyframes slide-up {
					from {
						transform: translateY(100%);
						opacity: 0;
					}
					to {
						transform: translateY(0);
						opacity: 1;
					}
				}
				.animate-slide-up {
					animation: slide-up 0.4s ease-out;
				}
			`}</style>
		</>
	);
}

