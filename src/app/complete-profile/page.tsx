"use client";

import { useAuthStore } from "@/stores/authStore";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function CompleteProfileContent() {
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		email: "",
		firstName: "",
		lastName: "",
		phone: "",
	});
	const [tempAuthData, setTempAuthData] = useState<any>(null);
	const router = useRouter();
	const searchParams = useSearchParams();
	const provider = searchParams.get("provider");
	const checkAuth = useAuthStore((state) => state.checkAuth);

	useEffect(() => {
		// Récupérer les données temporaires du cookie
		const getTempAuthData = async () => {
			try {
				const response = await fetch("/api/auth/temp-data");
				if (response.ok) {
					const data = await response.json();
					setTempAuthData(data);

					// Pré-remplir le formulaire avec les données Instagram
					if (data.instagramUsername) {
						const formattedName = data.instagramUsername
							.replace(/[._]/g, " ")
							.split(" ")
							.map(
								(word: string) =>
									word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
							)
							.join(" ");

						setFormData((prev) => ({
							...prev,
							firstName: formattedName,
						}));
					}
				} else {
					toast.error("Session expirée. Veuillez vous reconnecter.");
					router.push("/login");
				}
			} catch (error) {
				console.error("Erreur lors de la récupération des données:", error);
				router.push("/login");
			}
		};

		getTempAuthData();
	}, [router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		// Validation du numéro de téléphone - format français
		if (
			formData.phone &&
			!/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/.test(formData.phone)
		) {
			toast.error(
				"Veuillez entrer un numéro de téléphone français valide (ex: 06 12 34 56 78)"
			);
			setIsLoading(false);
			return;
		}

		try {
			const response = await fetch("/api/auth/complete-profile", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					...formData,
					provider,
					tempAuthData,
				}),
			});

			const data = await response.json();

			if (response.ok) {
				if (data.updated) {
					toast.success("Profil mis à jour avec succès !");
				} else {
					toast.success("Profil complété avec succès !");
				}

				// Mettre à jour l'AuthContext avec les données utilisateur
				if (data.user) {
					console.log("Utilisateur connecté:", data.user);
					// Forcer la vérification d'authentification
					await checkAuth();

					// Vérification supplémentaire après 1 seconde
					setTimeout(async () => {
						console.log("Vérification finale de l'authentification...");
						await checkAuth();
					}, 1000);
				}

				// Redirection vers l'accueil avec un délai pour laisser le toast s'afficher
				console.log("Redirection vers l'accueil dans 2 secondes...");
				setTimeout(() => {
					console.log("Redirection vers l'accueil maintenant...");
					router.push("/");
				}, 2000);
			} else {
				// Gestion spécifique des erreurs
				if (response.status === 409) {
					toast.error(
						"Cet email est déjà utilisé. Veuillez utiliser un autre email ou vous connecter avec ce compte."
					);
				} else if (response.status === 401) {
					toast.error("Session expirée. Veuillez vous reconnecter.");
					router.push("/login");
				} else {
					toast.error(data.error || "Erreur lors de la complétion du profil");
				}
			}
		} catch (error) {
			console.error("Erreur lors de la soumission:", error);
			toast.error("Erreur de connexion. Veuillez réessayer.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;

		// Validation spéciale pour le téléphone
		if (name === "phone") {
			// Permettre le format téléphone français
			if (value === "" || /^[0-9\s.\-+()]*$/.test(value)) {
				setFormData((prev) => ({ ...prev, [name]: value }));
			}
		} else {
			setFormData((prev) => ({ ...prev, [name]: value }));
		}
	};

	if (!tempAuthData) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-[#fae4e4]/75">
				<div className="bg-white p-8 rounded-lg shadow-lg">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-medium mx-auto"></div>
					<p className="text-center mt-4 text-gray-600">Chargement...</p>
				</div>
			</div>
		);
	}

	return (
		<>
			<ToastContainer position="top-center" autoClose={3000} />
			<div className="min-h-screen flex items-center justify-center bg-beige-light px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-48 py-12 animate-fade-in-up">
				<div className="w-full max-w-xl bg-nude-light rounded-[30px] shadow-lg border border-nude-dark/30 p-8 md:p-12 mt-8">
					<div className="text-center mb-8">
						<h1 className="text-5xl md:text-6xl font-alex-brush text-logo mb-4">
							Compléter mon profil
						</h1>
						<p className="text-nude-dark text-lg">
							{provider === "instagram"
								? "Finalisez votre inscription avec vos informations personnelles"
								: "Finalisez votre inscription avec vos informations personnelles"}
						</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Email */}
						<div>
							<label className="block text-lg font-semibold text-logo mb-2">
								Email
							</label>
							<input
								type="email"
								name="email"
								required
								value={formData.email}
								onChange={handleInputChange}
								className="w-full border border-nude-dark/40 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#d9c4b5] bg-beige-light text-logo placeholder-nude-dark"
								placeholder="votre@email.com"
							/>
						</div>

						{/* Prénom */}
						<div>
							<label className="block text-lg font-semibold text-logo mb-2">
								Prénom
							</label>
							<input
								type="text"
								name="firstName"
								required
								value={formData.firstName}
								onChange={handleInputChange}
								className="w-full border border-nude-dark/40 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#d9c4b5] bg-beige-light text-logo placeholder-nude-dark"
								placeholder="Votre prénom"
							/>
						</div>

						{/* Nom */}
						<div>
							<label className="block text-lg font-semibold text-logo mb-2">
								Nom
							</label>
							<input
								type="text"
								name="lastName"
								required
								value={formData.lastName}
								onChange={handleInputChange}
								className="w-full border border-nude-dark/40 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#d9c4b5] bg-beige-light text-logo placeholder-nude-dark"
								placeholder="Votre nom"
							/>
						</div>

						{/* Téléphone */}
						<div>
							<label className="block text-lg font-semibold text-logo mb-2">
								Téléphone
							</label>
							<input
								type="tel"
								name="phone"
								value={formData.phone}
								onChange={handleInputChange}
								className="w-full border border-nude-dark/40 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#d9c4b5] bg-beige-light text-logo placeholder-nude-dark"
								placeholder="06 12 34 56 78"
							/>
							<p className="text-xs text-nude-dark mt-1">
								Format français : 06 12 34 56 78
							</p>
						</div>

						{/* Bouton de soumission */}
						<div className="pt-4 text-center">
							<button
								type="submit"
								disabled={isLoading}
								className="bg-logo hover:bg-nude-dark text-white font-semibold px-10 py-3 rounded-full shadow btn-hover transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isLoading ? "Création du profil..." : "Créer mon profil"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</>
	);
}

export default function CompleteProfile() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center bg-[#fae4e4]/75">
					<div className="bg-white p-8 rounded-lg shadow-lg">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-medium mx-auto"></div>
						<p className="text-center mt-4 text-gray-600">Chargement...</p>
					</div>
				</div>
			}
		>
			<CompleteProfileContent />
		</Suspense>
	);
}
