export default function MentionsLegalesPage() {
	return (
		<div className="min-h-screen bg-beige-light py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-4xl mx-auto">
				{/* En-tête */}
				<div className="text-center mb-12">
					<h1 className="text-4xl sm:text-5xl font-alex-brush text-logo mb-4 mt-8">
						Mentions Légales
					</h1>
					<p className="text-nude-dark text-base lg:text-lg">
						Informations légales de Lady Haya Wear
					</p>
				</div>

				{/* Contenu */}
				<div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-8">
					{/* Éditeur */}
					<section>
						<h2 className="text-2xl font-balqis font-semibold text-logo mb-4">Éditeur</h2>
						<div className="space-y-3 text-nude-dark">
							<p>
								<strong>Raison sociale :</strong> Lady Haya Wear
							</p>
							<p>
								<strong>Forme juridique :</strong> Société par actions
								simplifiée (SAS)
							</p>
							<p>
								<strong>Capital social :</strong> 50 000 €
							</p>
							<p>
								<strong>SIRET :</strong> 102 769 643 000 10
							</p>
							<p>
								<strong>RCS :</strong> Paris B 123 456 789
							</p>
							<p>
								<strong>Siège social :</strong> 12 rue de l&apos;Ermitage, 93600
								Aulnay-sous-Bois, France
							</p>
							<p>
								<strong>Téléphone :</strong> 06 32 51 61 53
							</p>
							<p>
								<strong>Email :</strong> contact@ladyhaya-wear.fr
							</p>
							<p>
								<strong>Directeur de publication :</strong> Madame Haya
								Al-Mansouri
							</p>
						</div>
					</section>

					{/* Hébergement */}
					<section>
						<h2 className="text-2xl font-balqis font-semibold text-logo mb-4">Hébergement</h2>
						<div className="space-y-3 text-nude-dark">
							<p>
								<strong>Hébergeur :</strong> Vercel Inc.
							</p>
							<p>
								<strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA
								91789, États-Unis
							</p>
							<p>
								<strong>Site web :</strong> https://vercel.com
							</p>
						</div>
					</section>

					{/* Propriété intellectuelle */}
					<section>
						<h2 className="text-2xl font-balqis font-semibold text-logo mb-4">
							Propriété Intellectuelle
						</h2>
						<div className="space-y-3 text-nude-dark">
							<p>
								L'ensemble de ce site relève de la législation française et
								internationale sur le droit d'auteur et la propriété
								intellectuelle. Tous les droits de reproduction sont réservés, y
								compris pour les documents téléchargeables et les
								représentations iconographiques et photographiques.
							</p>
							<p>
								La reproduction de tout ou partie de ce site sur un support
								électronique quel qu'il soit est formellement interdite sauf
								autorisation expresse du directeur de la publication.
							</p>
						</div>
					</section>

					{/* Responsabilité */}
					<section>
						<h2 className="text-2xl font-balqis font-semibold text-logo mb-4">
							Responsabilité
						</h2>
						<div className="space-y-3 text-nude-dark">
							<p>
								Les informations contenues sur ce site sont aussi précises que
								possible et le site est périodiquement remis à jour, mais peut
								toutefois contenir des inexactitudes, des omissions ou des
								lacunes.
							</p>
							<p>
								Si vous constatez une lacune, erreur ou ce qui parait être un
								dysfonctionnement, merci de bien vouloir le signaler par email à
								l'adresse contact@ladyhaya-wear.fr.
							</p>
						</div>
					</section>

					{/* Liens hypertextes */}
					<section>
						<h2 className="text-2xl font-balqis font-semibold text-logo mb-4">
							Liens Hypertextes
						</h2>
						<div className="space-y-3 text-nude-dark">
							<p>
								Les liens hypertextes mis en place dans le cadre du présent site
								web en direction d'autres ressources présentes sur le réseau
								Internet ne sauraient engager la responsabilité de Lady Haya
								Wear.
							</p>
						</div>
					</section>

					{/* Cookies */}
					<section>
						<h2 className="text-2xl font-balqis font-semibold text-logo mb-4">Cookies</h2>
						<div className="space-y-3 text-nude-dark">
							<p>
								Le site peut-être amené à vous demander l'acceptation des
								cookies pour des besoins de statistiques et d'affichage. Un
								cookie ne nous permet pas de vous identifier ; il sert
								uniquement à enregistrer des informations relatives à la
								navigation de votre ordinateur sur notre site.
							</p>
						</div>
					</section>

					{/* Droit applicable */}
					<section>
						<h2 className="text-2xl font-balqis font-semibold text-logo mb-4">
							Droit Applicable
						</h2>
						<div className="space-y-3 text-nude-dark">
							<p>
								Tout litige en relation avec l'utilisation du site
								ladyhaya-wear.fr est soumis au droit français. En dehors des cas
								où la loi ne le permet pas, il est fait attribution exclusive de
								juridiction aux tribunaux compétents de Paris.
							</p>
						</div>
					</section>
				</div>

				{/* Date de mise à jour */}
				<div className="text-center mt-8">
					<p className="text-sm text-nude-dark">
						Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
					</p>
				</div>
			</div>
		</div>
	);
}
