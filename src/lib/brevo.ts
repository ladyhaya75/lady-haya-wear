import * as SibApiV3Sdk from "@getbrevo/brevo";

// Configuration lazy de l'API Brevo (initialisé uniquement quand nécessaire)
let apiInstance: SibApiV3Sdk.TransactionalEmailsApi | null = null;

function getBrevoApiInstance() {
	if (!apiInstance) {
		apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
		apiInstance.setApiKey(
			SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
			process.env.BREVO_API_KEY || ""
		);
	}
	return apiInstance;
}

// Types pour les emails
interface EmailData {
	to: string;
	subject: string;
	htmlContent: string;
	textContent?: string;
	from?: string;
}

interface OrderConfirmationData {
	customerName: string;
	orderNumber: string;
	orderDate: string;
	totalAmount: string;
	items: Array<{
		name: string;
		quantity: number;
		price: string;
	}>;
}

interface OrderStatusUpdateData {
	customerName: string;
	orderNumber: string;
	status: string;
	trackingNumber?: string;
	carrier?: string;
	trackingUrl?: string;
}

// Fonction pour envoyer un email de confirmation de commande
export async function sendOrderConfirmationEmail(
	email: string,
	orderData: OrderConfirmationData,
	pdfBuffer?: Buffer
) {
	const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

	sendSmtpEmail.to = [{ email }];
	sendSmtpEmail.subject = `Confirmation de commande #${orderData.orderNumber} - Lady Haya Wear`;
	sendSmtpEmail.htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .banner { background: linear-gradient(135deg, #f8ede4 0%, #e8d5c5 100%); padding: 30px; text-align: center; }
          .logo { font-family: 'Brush Script MT', 'Alex Brush', cursive; font-size: 36px; color: #8a5f3d; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.1); }
          .container { max-width: 600px; margin: 0 auto; background: #fff; }
          .content { padding: 30px; }
          .order-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .item { border-bottom: 1px solid #eee; padding: 10px 0; }
          .item:last-child { border-bottom: none; }
          .total { font-size: 1.2em; font-weight: bold; color: #8a5f3d; margin-top: 20px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; }
          .button { display: inline-block; background: #8a5f3d; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="banner">
            <h1 class="logo">Lady Haya</h1>
            <p style="color: #8a5f3d; margin: 10px 0 0 0; font-size: 16px;">Votre boutique de vêtements et accessoires</p>
          </div>
          
          <div class="content">
            <h2>Bonjour ${orderData.customerName},</h2>
            <p>Nous vous remercions pour votre commande et sommes ravis de vous compter parmi nos clients !</p>
            
            <div class="order-details">
              <h3>📋 Détails de votre commande</h3>
              <p><strong>Numéro de commande :</strong> #${orderData.orderNumber}</p>
              <p><strong>Date de commande :</strong> ${orderData.orderDate}</p>
              <p><strong>Montant total :</strong> ${orderData.totalAmount}</p>
            </div>
            
            <h3>🛍️ Articles commandés</h3>
            ${orderData.items
							.map(
								(item) => `
              <div class="item">
                <strong>${item.name}</strong><br>
                Quantité: ${item.quantity} - Prix: ${item.price}
              </div>
            `
							)
							.join("")}
            
            <div class="total">
              Total de votre commande: ${orderData.totalAmount}
            </div>
            
            ${
							pdfBuffer
								? `
            <div style="background: #e8f5e8; border: 1px solid #4caf50; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <h4 style="color: #2e7d32; margin: 0 0 10px 0;">📄 Facture jointe</h4>
              <p style="color: #2e7d32; margin: 0;">Votre facture PDF est jointe à cet email pour vos archives.</p>
            </div>
            `
								: ""
						}
            
            <p>📧 Vous recevrez prochainement un email avec le numéro de suivi de votre colis.</p>
            <p>📞 Notre équipe est disponible pour toute question au 01 23 45 67 89 ou par email à contact@ladyhaya-wear.fr</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://ladyhaya-wear.fr"}/orders" class="button">Voir mes commandes</a>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://ladyhaya-wear.fr"}/collections" class="button" style="margin-left: 10px;">Découvrir nos collections</a>
          </div>
          
          <div class="footer">
            <p><strong>Lady Haya Wear</strong></p>
            <p>Votre boutique de vêtements et accessoires</p>
            <p>📧 contact@ladyhaya-wear.fr | 📞 01 23 45 67 89</p>
          </div>
        </div>
      </body>
    </html>
  `;
	sendSmtpEmail.sender = {
		name: "Lady Haya Wear",
		email: process.env.BREVO_FROM_EMAIL || "contact@ladyhaya-wear.fr",
	};

	// Ajouter la facture PDF en pièce jointe si fournie
	if (pdfBuffer) {
		sendSmtpEmail.attachment = [
			{
				name: `facture-${orderData.orderNumber}.pdf`,
				content: pdfBuffer.toString("base64"),
			},
		];
	}

	try {
		const apiInstance = getBrevoApiInstance();
		const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
		console.log("Email de confirmation envoyé avec succès:", response);
		return { success: true, messageId: response.body?.messageId || "sent" };
	} catch (error: any) {
		console.error("Erreur lors de l'envoi de l'email de confirmation:", error);

		// Gestion spécifique des erreurs 401
		if (error.response?.status === 401) {
			console.error("Erreur d'authentification Brevo - Vérifiez votre API key");
			throw new Error(
				"Erreur d'authentification avec Brevo. Vérifiez la configuration."
			);
		}

		throw error;
	}
}

// Fonction pour envoyer un email de bienvenue
export async function sendWelcomeEmail(email: string, customerName: string) {
	const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

	sendSmtpEmail.to = [{ email }];
	sendSmtpEmail.subject = "Bienvenue chez Lady Haya Wear !";
	sendSmtpEmail.htmlContent = `
    <html>
      <body>
        <h1>Bienvenue ${customerName} !</h1>
        <p>Nous sommes ravis de vous accueillir chez Lady Haya Wear.</p>
        <p>Découvrez notre collection exclusive de vêtements et accessoires.</p>
        <p>Merci de nous faire confiance !</p>
        <p>Cordialement,<br>L'équipe Lady Haya Wear</p>
      </body>
    </html>
  `;
	sendSmtpEmail.sender = {
		name: "Lady Haya Wear",
		email: process.env.BREVO_FROM_EMAIL || "contact@ladyhaya-wear.fr",
	};

	try {
		const apiInstance = getBrevoApiInstance();
		const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
		console.log("Email de bienvenue envoyé:", response);
		return { success: true, messageId: response.body?.messageId || "sent" };
	} catch (error) {
		console.error("Erreur lors de l'envoi de l'email de bienvenue:", error);
		throw error;
	}
}

// Fonction pour envoyer un email de récupération de mot de passe
export async function sendPasswordResetEmail(
	email: string,
	resetToken: string
) {
	const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

	sendSmtpEmail.to = [{ email }];
	sendSmtpEmail.subject =
		"Réinitialisation de votre mot de passe - Lady Haya Wear";
	sendSmtpEmail.htmlContent = `
    <html>
      <body>
        <h1>Réinitialisation de mot de passe</h1>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p>Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}">
          Réinitialiser mon mot de passe
        </a>
        <p>Ce lien expirera dans 1 heure.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        <p>Cordialement,<br>L'équipe Lady Haya Wear</p>
      </body>
    </html>
  `;
	sendSmtpEmail.sender = {
		name: "Lady Haya Wear",
		email: process.env.BREVO_FROM_EMAIL || "contact@ladyhaya-wear.fr",
	};

	try {
		const apiInstance = getBrevoApiInstance();
		const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
		console.log("Email de récupération envoyé:", response);
		return { success: true, messageId: response.body?.messageId || "sent" };
	} catch (error) {
		console.error("Erreur lors de l'envoi de l'email de récupération:", error);
		throw error;
	}
}

// Fonction générique pour envoyer un email personnalisé
export async function sendCustomEmail(emailData: EmailData) {
	const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

	sendSmtpEmail.to = [{ email: emailData.to }];
	sendSmtpEmail.subject = emailData.subject;
	sendSmtpEmail.htmlContent = emailData.htmlContent;
	if (emailData.textContent) {
		sendSmtpEmail.textContent = emailData.textContent;
	}
	sendSmtpEmail.sender = {
		name: "Lady Haya Wear",
		email:
			emailData.from || process.env.BREVO_FROM_EMAIL || "contact@ladyhaya.com",
	};

	try {
		const apiInstance = getBrevoApiInstance();
		const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
		console.log("Email personnalisé envoyé:", response);
		return { success: true, messageId: response.body?.messageId || "sent" };
	} catch (error) {
		console.error("Erreur lors de l'envoi de l'email personnalisé:", error);
		throw error;
	}
}

// Fonction pour envoyer un email de contact
export async function sendContactEmail(contactData: {
	name: string;
	email: string;
	message: string;
}) {
	const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

	sendSmtpEmail.to = [
		{ email: process.env.BREVO_TO_EMAIL || "contact@ladyhaya-wear.fr" },
	];
	sendSmtpEmail.subject = `Nouveau message de contact - ${contactData.name}`;
	sendSmtpEmail.htmlContent = `
    <html>
      <body>
        <h1>Nouveau message de contact</h1>
        <p><strong>Nom/Société :</strong> ${contactData.name}</p>
        <p><strong>Email :</strong> ${contactData.email}</p>
        <h2>Message :</h2>
        <p>${contactData.message.replace(/\n/g, "<br>")}</p>
        <hr>
        <p><em>Ce message a été envoyé depuis le formulaire de contact de Lady Haya Wear</em></p>
      </body>
    </html>
  `;
	sendSmtpEmail.sender = {
		name: "Lady Haya Wear - Contact",
		email: process.env.BREVO_FROM_EMAIL || "contact@ladyhaya-wear.fr",
	};

	try {
		const apiInstance = getBrevoApiInstance();
		const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
		console.log("Email de contact envoyé:", response);
		return { success: true, messageId: response.body?.messageId || "sent" };
	} catch (error) {
		console.error("Erreur lors de l'envoi de l'email de contact:", error);
		throw error;
	}
}

// Fonction pour envoyer un email de mise à jour de statut
export async function sendOrderStatusUpdateEmail(
	email: string,
	orderData: OrderStatusUpdateData
) {
	const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

	// Déterminer le sujet et le contenu selon le statut
	let subject = "";
	let htmlContent = "";

	switch (orderData.status) {
		case "PENDING":
			subject = `Votre commande #${orderData.orderNumber} est en cours de préparation - Lady Haya Wear`;
			htmlContent = `
					<html>
						<head>
							<style>
								body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
								.banner { background: linear-gradient(135deg, #f8ede4 0%, #e8d5c5 100%); padding: 30px; text-align: center; }
								.logo { font-family: 'Brush Script MT', 'Alex Brush', cursive; font-size: 36px; color: #8a5f3d; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.1); }
								.container { max-width: 600px; margin: 0 auto; background: #fff; }
								.content { padding: 30px; }
								.status-card { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0; }
								.footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; }
							</style>
						</head>
						<body>
							<div class="container">
								<div class="banner">
									<h1 class="logo">Lady Haya</h1>
									<p style="color: #8a5f3d; margin: 10px 0 0 0; font-size: 16px;">Votre boutique de vêtements et accessoires</p>
								</div>
								
								<div class="content">
									<h2>Bonjour ${orderData.customerName},</h2>
									<p>Nous vous informons que votre commande est actuellement en cours de préparation dans nos entrepôts.</p>
									
									<div class="status-card">
										<h3>📋 Détails de votre commande</h3>
										<p><strong>Numéro de commande :</strong> #${orderData.orderNumber}</p>
										<p><strong>Statut actuel :</strong> En cours de préparation</p>
									</div>
									
									<p>Notre équipe s'occupe de préparer votre commande avec soin. Vous recevrez un email dès que votre colis sera expédié avec le numéro de suivi.</p>
									
									<p>Merci de votre patience !</p>
									
									<p>Cordialement,<br>L'équipe Lady Haya Wear</p>
								</div>
								
								<div class="footer">
									<p>Lady Haya Wear - Votre boutique de mode en ligne</p>
								</div>
							</div>
						</body>
					</html>
				`;
			break;

		case "SHIPPED":
			subject = `Votre commande #${orderData.orderNumber} a été expédiée - Lady Haya Wear`;
			htmlContent = `
					<html>
						<head>
							<style>
								body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
								.banner { background: linear-gradient(135deg, #f8ede4 0%, #e8d5c5 100%); padding: 30px; text-align: center; }
								.logo { font-family: 'Brush Script MT', 'Alex Brush', cursive; font-size: 36px; color: #8a5f3d; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.1); }
								.container { max-width: 600px; margin: 0 auto; background: #fff; }
								.content { padding: 30px; }
								.tracking-card { background: #e8f5e8; border: 1px solid #4caf50; border-radius: 8px; padding: 20px; margin: 20px 0; }
								.tracking-button { display: inline-block; background: #4caf50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
								.footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; }
							</style>
						</head>
						<body>
							<div class="container">
								<div class="banner">
									<h1 class="logo">Lady Haya</h1>
									<p style="color: #8a5f3d; margin: 10px 0 0 0; font-size: 16px;">Votre boutique de vêtements et accessoires</p>
								</div>
								
								<div class="content">
									<h2>Bonjour ${orderData.customerName},</h2>
									<p>Excellente nouvelle ! Votre commande a été expédiée et est maintenant en route vers vous.</p>
									
									<div class="tracking-card">
										<h3>📦 Informations de suivi</h3>
										<p><strong>Numéro de commande :</strong> #${orderData.orderNumber}</p>
										${orderData.trackingNumber ? `<p><strong>Numéro de suivi :</strong> ${orderData.trackingNumber}</p>` : ""}
										${orderData.carrier ? `<p><strong>Transporteur :</strong> ${orderData.carrier.replace("-", " ").toUpperCase()}</p>` : ""}
										${
											orderData.trackingUrl
												? `
										<p><strong>Suivre votre colis :</strong></p>
										<a href="${orderData.trackingUrl}" class="tracking-button" target="_blank">
											🔍 Suivre mon colis
										</a>
										`
												: ""
										}
									</div>
									
									<p><strong>Livraison estimée :</strong> 2-5 jours ouvrés</p>
									
									<p>Vous pouvez suivre l'évolution de votre colis en utilisant le lien ci-dessus ou en vous connectant à votre espace client.</p>
									
									<p>Merci de votre confiance !</p>
									
									<p>Cordialement,<br>L'équipe Lady Haya Wear</p>
								</div>
								
								<div class="footer">
									<p>Lady Haya Wear - Votre boutique de mode en ligne</p>
								</div>
							</div>
						</body>
					</html>
				`;
			break;

		case "DELIVERED":
			subject = `Votre commande #${orderData.orderNumber} a été livrée - Lady Haya Wear`;
			htmlContent = `
					<html>
						<head>
							<style>
								body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
								.banner { background: linear-gradient(135deg, #f8ede4 0%, #e8d5c5 100%); padding: 30px; text-align: center; }
								.logo { font-family: 'Brush Script MT', 'Alex Brush', cursive; font-size: 36px; color: #8a5f3d; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.1); }
								.container { max-width: 600px; margin: 0 auto; background: #fff; }
								.content { padding: 30px; }
								.delivery-card { background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin: 20px 0; }
								.review-button { display: inline-block; background: #d9c4b5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
								.footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; }
							</style>
						</head>
						<body>
							<div class="container">
								<div class="banner">
									<h1 class="logo">Lady Haya</h1>
									<p style="color: #8a5f3d; margin: 10px 0 0 0; font-size: 16px;">Votre boutique de vêtements et accessoires</p>
								</div>
								
								<div class="content">
									<h2>Bonjour ${orderData.customerName},</h2>
									<p>Parfait ! Votre commande a été livrée avec succès.</p>
									
									<div class="delivery-card">
										<h3>✅ Confirmation de livraison</h3>
										<p><strong>Numéro de commande :</strong> #${orderData.orderNumber}</p>
										<p><strong>Statut :</strong> Livrée</p>
									</div>
									
									<p>Nous espérons que vous êtes satisfait(e) de votre achat !</p>
									
									<p>N'hésitez pas à nous faire part de votre expérience en nous contactant si vous avez des questions ou des suggestions.</p>
									
									<p>Merci de votre confiance et à bientôt !</p>
									
									<p>Cordialement,<br>L'équipe Lady Haya Wear</p>
								</div>
								
								<div class="footer">
									<p>Lady Haya Wear - Votre boutique de mode en ligne</p>
								</div>
							</div>
						</body>
					</html>
				`;
			break;

		default:
			subject = `Mise à jour de votre commande #${orderData.orderNumber} - Lady Haya Wear`;
			htmlContent = `
				<html>
					<body>
						<h1>Mise à jour de commande</h1>
						<p>Bonjour ${orderData.customerName},</p>
						<p>Le statut de votre commande #${orderData.orderNumber} a été mis à jour.</p>
						<p>Nouveau statut : ${orderData.status}</p>
						<p>Cordialement,<br>L'équipe Lady Haya Wear</p>
					</body>
				</html>
			`;
	}

	sendSmtpEmail.to = [{ email }];
	sendSmtpEmail.subject = subject;
	sendSmtpEmail.htmlContent = htmlContent;
	sendSmtpEmail.sender = {
		name: "Lady Haya Wear",
		email: process.env.BREVO_FROM_EMAIL || "contact@ladyhaya-wear.fr",
	};

	try {
		const apiInstance = getBrevoApiInstance();
		const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
		console.log(
			`Email de mise à jour de statut (${orderData.status}) envoyé:`,
			response
		);
		return { success: true, messageId: response.body?.messageId || "sent" };
	} catch (error) {
		console.error(
			"Erreur lors de l'envoi de l'email de mise à jour de statut:",
			error
		);
		throw error;
	}
}

// Fonction pour envoyer un email de demande d'avis client
export async function sendReviewRequestEmail(
	email: string,
	reviewData: {
		customerName: string;
		orderNumber: string;
		orderDate: string;
		items: Array<{
			id: string;
			name: string;
			quantity: number;
		}>;
		reviewToken: string;
	}
) {
	const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

	sendSmtpEmail.to = [{ email }];
	sendSmtpEmail.subject = `Votre avis nous intéresse ! Commande #${reviewData.orderNumber} - Lady Haya Wear`;
	sendSmtpEmail.htmlContent = `
		<html>
			<head>
				<style>
					body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
					.banner { background: linear-gradient(135deg, #f8ede4 0%, #e8d5c5 100%); padding: 30px; text-align: center; }
					.logo { font-family: 'Brush Script MT', 'Alex Brush', cursive; font-size: 36px; color: #8a5f3d; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.1); }
					.container { max-width: 600px; margin: 0 auto; background: #fff; }
					.content { padding: 30px; }
					.review-card { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0; }
					.review-button { display: inline-block; background: #8a5f3d; color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 15px 0; font-weight: bold; }
					.stars { font-size: 24px; margin: 10px 0; }
					.product-item { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #8a5f3d; }
					.footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; }
				</style>
			</head>
			<body>
				<div class="container">
					<div class="banner">
						<h1 class="logo">Lady Haya</h1>
						<p style="color: #8a5f3d; margin: 10px 0 0 0; font-size: 16px;">Votre boutique de vêtements et accessoires</p>
					</div>
					
					<div class="content">
						<h2>Bonjour ${reviewData.customerName},</h2>
						<p>Nous espérons que vous avez bien reçu votre commande et qu'elle vous donne entière satisfaction !</p>
						
						<div class="review-card">
							<h3>⭐ Votre avis compte pour nous</h3>
							<p><strong>Commande #${reviewData.orderNumber}</strong> - ${reviewData.orderDate}</p>
							<p>Votre expérience nous aide à nous améliorer et guide nos futurs clients dans leurs choix.</p>
							
							<div class="stars">
								⭐⭐⭐⭐⭐
							</div>
							<p><em>Donnez-nous une note de 1 à 5 étoiles</em></p>
						</div>
						
						<h3>📦 Articles de votre commande :</h3>
						${reviewData.items
							.map(
								(item) => `
							<div class="product-item">
								<strong>${item.name}</strong><br>
								<small>Quantité: ${item.quantity}</small>
							</div>
						`
							)
							.join("")}
						
						<div style="text-align: center; margin: 30px 0;">
							<a href="${process.env.NEXT_PUBLIC_APP_URL || "https://ladyhaya-wear.fr"}/review?token=${reviewData.reviewToken}" class="review-button">
								✍️ Laisser mon avis
							</a>
						</div>
						
						<p><small><em>Ce lien est sécurisé et personnel. Il expire dans 30 jours.</em></small></p>
						
						<p>Merci de nous accorder quelques minutes pour partager votre expérience !</p>
						
						<p>Avec toute notre gratitude,<br>L'équipe Lady Haya Wear</p>
					</div>
					
					<div class="footer">
						<p><strong>Lady Haya Wear</strong></p>
						<p>Votre boutique de vêtements et accessoires</p>
						<p>📧 contact@ladyhaya-wear.fr | 📞 01 23 45 67 89</p>
						<p><small>Si vous ne souhaitez plus recevoir ce type d'email, contactez-nous.</small></p>
					</div>
				</div>
			</body>
		</html>
	`;
	sendSmtpEmail.sender = {
		name: "Lady Haya Wear",
		email: process.env.BREVO_FROM_EMAIL || "contact@ladyhaya-wear.fr",
	};

	try {
		const apiInstance = getBrevoApiInstance();
		const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
		console.log("Email de demande d'avis envoyé:", response);
		return { success: true, messageId: response.body?.messageId || "sent" };
	} catch (error) {
		console.error(
			"Erreur lors de l'envoi de l'email de demande d'avis:",
			error
		);
		throw error;
	}
}
