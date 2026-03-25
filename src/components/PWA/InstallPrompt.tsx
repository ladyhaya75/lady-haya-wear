"use client";

import { useEffect, useState } from "react";
import { X, Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Clés localStorage
const KEY_FIRST_VISIT = "pwa-first-visit";    // Timestamp de la 1ère visite
const KEY_DISMISSED   = "pwa-dismissed";       // Modale fermée → jamais réafficher
const KEY_INSTALLED   = "pwa-installed";       // App installée
const KEY_HINT_CLOSED = "pwa-hint-closed";     // Petite bannière fermée

const DELAY_DAYS = 2; // Afficher la modale 2 jours après la 1ère visite

export default function InstallPrompt() {
	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null);
	const [showModal, setShowModal] = useState(false);
	const [showHint, setShowHint]   = useState(false);
	const [isIOS, setIsIOS]         = useState(false);
	const [isStandalone, setIsStandalone] = useState(false);

	useEffect(() => {
		const ua = window.navigator.userAgent.toLowerCase();
		const ios = /iphone|ipad|ipod/.test(ua);
		setIsIOS(ios);

		const standalone =
			window.matchMedia("(display-mode: standalone)").matches ||
			(window.navigator as any).standalone === true;
		setIsStandalone(standalone);

		// Si déjà installée, rien à faire
		if (standalone) return;

		// Nettoyage si l'app a été désinstallée
		const installed = localStorage.getItem(KEY_INSTALLED);
		if (installed && !standalone) {
			localStorage.removeItem(KEY_INSTALLED);
		}

		// ── Petite bannière ──
		// On la montre si la modale a déjà été fermée ET que la bannière n'a pas été fermée
		const wasDismissed  = localStorage.getItem(KEY_DISMISSED);
		const hintClosed    = localStorage.getItem(KEY_HINT_CLOSED);
		if (wasDismissed && !hintClosed) {
			setShowHint(true);
			return; // Plus besoin de continuer pour la modale
		}

		// ── Modale principale ──
		// On ne réaffiche jamais si déjà fermée une fois
		if (wasDismissed) return;

		// Enregistrer la 1ère visite si pas encore fait
		if (!localStorage.getItem(KEY_FIRST_VISIT)) {
			localStorage.setItem(KEY_FIRST_VISIT, Date.now().toString());
		}

		// Calculer les jours depuis la 1ère visite
		const firstVisit = parseInt(localStorage.getItem(KEY_FIRST_VISIT)!);
		const daysSince = (Date.now() - firstVisit) / (1000 * 60 * 60 * 24);

		if (daysSince < DELAY_DAYS) return; // Pas encore 2 jours

		// Android / Desktop : attendre l'event beforeinstallprompt
		const handleBeforeInstallPrompt = (e: Event) => {
			e.preventDefault();
			setDeferredPrompt(e as BeforeInstallPromptEvent);
			// Petit délai UX pour ne pas surgir immédiatement
			setTimeout(() => setShowModal(true), 3000);
		};

		window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

		// iOS : afficher directement les instructions après 3s
		if (ios) {
			setTimeout(() => setShowModal(true), 3000);
		}

		return () => {
			window.removeEventListener(
				"beforeinstallprompt",
				handleBeforeInstallPrompt
			);
		};
	}, []);

	// Fermeture définitive de la modale → on bascule sur la petite bannière
	const handleDismiss = () => {
		localStorage.setItem(KEY_DISMISSED, "true");
		setShowModal(false);
		setShowHint(true);
	};

	// Installation acceptée
	const handleInstall = async () => {
		if (!deferredPrompt) return;
		deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;
		if (outcome === "accepted") {
			localStorage.setItem(KEY_INSTALLED, "true");
		} else {
			// Refus du prompt natif = même chose que fermer la modale
			localStorage.setItem(KEY_DISMISSED, "true");
			setShowHint(true);
		}
		setDeferredPrompt(null);
		setShowModal(false);
	};

	// Fermeture de la petite bannière (définitive)
	const handleCloseHint = () => {
		localStorage.setItem(KEY_HINT_CLOSED, "true");
		setShowHint(false);
	};

	if (isStandalone) return null;

	return (
		<>
			{/* ───────── Modale principale (1 seule fois après 2 jours) ───────── */}
			{showModal && (
				<div className="fixed bottom-6 left-4 right-4 z-50 mx-auto max-w-md animate-slide-up">
					<div className="relative rounded-2xl bg-nude-light p-6 shadow-2xl border border-rose-medium">
						<button
							onClick={handleDismiss}
							className="absolute right-3 top-3 rounded-full p-1 text-nude-dark hover:bg-rose-light hover:text-logo transition-colors"
							aria-label="Fermer"
						>
							<X className="h-5 w-5" />
						</button>

						<div className="mb-4 flex items-center gap-4">
							<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-logo">
								<Smartphone className="h-7 w-7 text-white" />
							</div>
							<div className="flex-1">
								<h3 className="text-lg font-bold text-logo font-balqis">
									Installer Lady Haya
								</h3>
								<p className="text-sm text-nude-dark">
									{isIOS
										? "Ajoutez l'app à votre écran d'accueil"
										: "Accès rapide depuis votre écran d'accueil"}
								</p>
							</div>
						</div>

						{/* Android / Desktop */}
						{!isIOS && (
							<>
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
								<button
									onClick={handleInstall}
									className="w-full rounded-xl bg-logo py-3 px-4 font-semibold text-beige-light hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
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
							</>
						)}

						{/* iOS */}
						{isIOS && (
							<>
								<div className="rounded-xl bg-rose-light p-4 border border-rose-medium mb-4">
									<p className="mb-3 text-sm font-semibold text-logo font-balqis">
										📱 Instructions iOS :
									</p>
									<ol className="space-y-2 text-sm text-nude-dark">
										<li className="flex items-start gap-2">
											<span className="font-bold text-logo">1.</span>
											<span>
												Tapez sur{" "}
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
								<button
									onClick={handleDismiss}
									className="w-full rounded-xl bg-rose-light py-3 px-4 font-semibold text-logo hover:bg-rose-dark transition-all border border-rose-medium"
								>
									J'ai compris
								</button>
							</>
						)}
					</div>
				</div>
			)}

			{/* ───────── Petite bannière persistante après fermeture ───────── */}
			{showHint && !showModal && (
				<div className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-sm">
					<div className="flex items-center gap-3 rounded-2xl bg-nude-light border border-rose-medium shadow-lg px-4 py-3">
						<Download className="h-4 w-4 text-logo shrink-0" />
						<p className="flex-1 text-xs text-nude-dark leading-snug">
							Vous pouvez télécharger l'app depuis la navigation de votre navigateur.
						</p>
						<button
							onClick={handleCloseHint}
							className="rounded-full p-1 text-nude-dark hover:text-logo transition-colors shrink-0"
							aria-label="Fermer"
						>
							<X className="h-3.5 w-3.5" />
						</button>
					</div>
				</div>
			)}

			<style jsx>{`
				@keyframes slide-up {
					from { transform: translateY(100%); opacity: 0; }
					to   { transform: translateY(0);    opacity: 1; }
				}
				.animate-slide-up { animation: slide-up 0.4s ease-out; }
			`}</style>
		</>
	);
}
