export default function ConditionsVentePage() {
	return (
		<div className="min-h-screen bg-beige-light py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-4xl mx-auto">
				{/* En-tête */}
				<div className="text-center mb-12">
					<h1 className="text-4xl sm:text-5xl font-alex-brush text-logo mb-4 mt-8">
						Conditions Générales de Vente
					</h1>
					<p className="text-nude-dark text-base lg:text-lg">
						Les conditions de vente de Lady Haya Wear
					</p>
				</div>

				{/* Contenu */}
				<div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-8">
					{/* Préambule */}
					<section>
						<h2 className="text-2xl font-balqis font-semibold text-logo mb-4">Préambule</h2>
						<div className="space-y-3 text-nude-dark">
							<p>
								Les présentes Conditions Générales de Vente (CGV) s'appliquent à
								toutes les ventes conclues sur le site ladyhaya-wear.fr de la
								société Lady Haya Wear.
							</p>
							<p>
								<strong>Éditeur :</strong> Lady Haya Wear
								<br />
								<strong>Adresse :</strong> 123 Rue de la Mode, 75001 Paris,
								France
								<br />
								<strong>SIRET :</strong> 102 769 643 000 10
								<br />
								<strong>Email :</strong> contact@ladyhaya-wear.fr
							</p>
						</div>
					</section>

					{/* Produits */}
					<section>
						<h2 className="text-2xl font-balqis font-semibold text-logo mb-4">Produits</h2>
						<div className="space-y-3 text-nude-dark">
							<p>
								Lady Haya Wear propose une collection de vêtements élégants pour
								femmes musulmanes, incluant des abayas, kimonos, robes et
								accessoires.
							</p>
							<p>
								Les produits sont décrits avec le plus de précision possible.
								Les photographies illustrant les produits n'entrent pas dans le
								champ contractuel.
							</p>
						</div>
					</section>

					{/* Commandes */}
					<section>
						<h2 className="text-2xl font-balqis font-semibold text-logo mb-4">Commandes</h2>
						<div className="space-y-4 text-nude-dark">
							<div>
								<h3 className="text-lg font-semibold text-logo mb-2">
									Passation de commande
								</h3>
								<p>
									Pour passer une commande, vous devez créer un compte ou vous
									connecter. La commande est confirmée par l'envoi d'un email de
									confirmation.
								</p>
							</div>
							<div>
								<h3 className="text-lg font-semibold text-logo mb-2">
									Validation
								</h3>
								<p>
									La commande ne sera validée qu'après vérification du paiement
									et de la disponibilité des articles.
								</p>
							</div>
							<div>
								<h3 className="text-lg font-semibold text-logo mb-2">Prix</h3>
								<p>
									Les prix sont exprimés en euros TTC. Ils peuvent être modifiés
									à tout moment sans préavis, les prix applicables étant ceux en
									vigueur au jour de la commande.
								</p>
							</div>
						</div>
					</section>

					{/* Paiement */}
					<section>
						<h2 className="text-2xl font-balqis font-semibold text-logo mb-4">Paiement</h2>
						<div className="space-y-4 text-nude-dark">
							<div>
								<h3 className="text-lg font-semibold text-logo mb-2">
									Moyens de paiement acceptés
								</h3>
								<ul className="list-disc list-inside space-y-1 ml-4">
									<li>Cartes bancaires (Visa, Mastercard, American Express)</li>
									<li>PayPal</li>
									<li>Apple Pay</li>
									<li>Google Pay</li>
								</ul>
							</div>
							<div>
								<h3 className="text-lg font-semibold text-logo mb-2">
									Sécurité
								</h3>
								<p>
									Les paiements sont sécurisés par nos prestataires de paiement.
									Aucune information bancaire n'est stockée sur nos serveurs.
								</p>
							</div>
							<div>
								<h3 className="text-lg font-semibold text-logo mb-2">
									Facturation
								</h3>
								<p>
									Une facture électronique sera générée automatiquement et
									envoyée par email après validation de la commande.
								</p>
							</div>
						</div>
					</section>

					{/* Livraison */}
					<section>
						<h2 className="text-2xl font-balqis font-semibold text-logo mb-4">Livraison</h2>
						<div className="space-y-4 text-nude-dark">
							<div>
								<h3 className="text-lg font-semibold text-logo mb-2">
									Zones de livraison
								</h3>
								<p>
									Nous livrons en France métropolitaine, dans les DOM-TOM et en
									Europe.
								</p>
							</div>
							<div>
								<h3 className="text-lg font-semibold text-logo mb-2">
									Délais de livraison
								</h3>
								<ul className="list-disc list-inside space-y-1 ml-4">
									<li>
										<strong>France métropolitaine :</strong> 2-4 jours ouvrés
									</li>
									<li>
										<strong>Europe :</strong> 5-8 jours ouvrés
									</li>
									<li>
										<strong>DOM-TOM :</strong> 8-12 jours ouvrés
									</li>
								</ul>
							</div>
							<div>
								<h3 className="text-lg font-semibold text-logo mb-2">
									Frais de livraison
								</h3>
								<ul className="list-disc list-inside space-y-1 ml-4">
									<li>
										<strong>Livraison gratuite :</strong> À partir de 50€
										d'achat
									</li>
									<li>
										<strong>Livraison standard :</strong> 5,90€
									</li>
									<li>
										<strong>Livraison express :</strong> 9,90€
									</li>
								</ul>
							</div>
							<div>
								<h3 className="text-lg font-semibold text-logo mb-2">
									Suivi de commande
								</h3>
								<p>
									Un numéro de suivi vous sera communiqué par email dès
									l'expédition de votre commande.
								</p>
							</div>
						</div>
					</section>

					{/* Retours et remboursements */}
					<section>
						<h2 className="text-2xl font-balqis font-semibold text-logo mb-4">
							Retours et Remboursements
						</h2>
						<div className="space-y-4 text-nude-dark">
							<div>
								<h3 className="text-lg font-semibold text-logo mb-2">
									Droit de rétractation
								</h3>
								<p>
									Vous disposez d'un délai de 14 jours à compter de la réception
									de votre commande pour exercer votre droit de rétractation.
								</p>
							</div>
							<div>
								<h3 className="text-lg font-semibold text-logo mb-2">
									Conditions de retour
								</h3>
								<ul className="list-disc list-inside space-y-1 ml-4">
									<li>Articles non utilisés et dans leur état d'origine</li>
									<li>Étiquettes et emballages d'origine préservés</li>
									<li>Formulaire de retour complété</li>
								</ul>
							</div>
							<div>
								<h3 className="text-lg font-semibold text-logo mb-2">
									Remboursement
								</h3>
								<p>
									Le remboursement sera effectué dans un délai maximum de 14
									jours à compter de la réception du retour.
								</p>
							</div>
							<div>
								<h3 className="text-lg font-semibold text-logo mb-2">
									Frais de retour
								</h3>
								<p>
									Les frais de retour sont à la charge du client, sauf en cas de
									produit défectueux.
								</p>
							</div>
						</div>
					</section>

					{/* Garanties */}
					<section>
						<h2 className="text-2xl font-balqis font-semibold text-logo mb-4">Garanties</h2>
						<div className="space-y-4 text-nude-dark">
							<div>
								<h3 className="text-lg font-semibold text-logo mb-2">
									Garantie légale
								</h3>
								<p>
									Tous nos produits bénéficient de la garantie légale de
									conformité et de la garantie des vices cachés.
								</p>
							</div>
							<div>
								<h3 className="text-lg font-semibold text-logo mb-2">
									Garantie commerciale
								</h3>
								<p>
									Nous offrons une garantie de 2 ans sur tous nos produits en
									cas de défaut de fabrication.
								</p>
							</div>
						</div>
					</section>

					{/* Protection des données */}
					<section>
						<h2 className="text-2xl font-balqis font-semibold text-logo mb-4">
							Protection des Données
						</h2>
						<div className="space-y-3 text-nude-dark">
							<p>
								Vos données personnelles sont collectées et traitées
								conformément à notre Politique de Confidentialité, accessible
								sur notre site.
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
								Les présentes CGV sont soumises au droit français. En cas de
								litige, les tribunaux français seront seuls compétents.
							</p>
						</div>
					</section>

					{/* Contact */}
					<section>
						<h2 className="text-2xl font-balqis font-semibold text-logo mb-4">Contact</h2>
						<div className="space-y-3 text-nude-dark">
							<p>Pour toute question concernant ces conditions de vente :</p>
							<p>
								<strong>Email :</strong> contact@ladyhaya-wear.fr
							</p>
							<p>
								<strong>Téléphone :</strong> +33 1 23 45 67 89
							</p>
							<p>
								<strong>Adresse :</strong> 123 Rue de la Mode, 75001 Paris,
								France
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
