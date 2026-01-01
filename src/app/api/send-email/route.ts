import { NextRequest, NextResponse } from "next/server";

// Forcer le mode dynamique pour éviter l'évaluation de Brevo au build
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
	try {
		// Import dynamique de Brevo
		const { SendSmtpEmail, TransactionalEmailsApi } = await import("@getbrevo/brevo");
		
		const apiInstance = new TransactionalEmailsApi();
		apiInstance.setApiKey(0, process.env.BREVO_API_KEY || "");
		
		const { to, subject, html } = await request.json();

		if (!to || !subject || !html) {
			return NextResponse.json(
				{ error: "Paramètres manquants" },
				{ status: 400 }
			);
		}

		// Vérifier les variables d'environnement
		if (!process.env.BREVO_API_KEY) {
			console.error("BREVO_API_KEY manquante");
			return NextResponse.json(
				{ error: "Configuration email manquante" },
				{ status: 500 }
			);
		}

		if (!process.env.BREVO_FROM_EMAIL) {
			console.error("BREVO_FROM_EMAIL manquante");
			return NextResponse.json(
				{ error: "Configuration email manquante" },
				{ status: 500 }
			);
		}

		console.log("Envoi d'email à:", to);
		console.log("Email expéditeur:", process.env.BREVO_FROM_EMAIL);

		const sendSmtpEmail = new SendSmtpEmail();
		sendSmtpEmail.subject = subject;
		sendSmtpEmail.htmlContent = html;
		sendSmtpEmail.sender = {
			name: "Lady Haya Wear",
			email: process.env.BREVO_FROM_EMAIL,
		};
		sendSmtpEmail.to = [{ email: to }];

		const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

		return NextResponse.json(
			{
				message: "Email envoyé avec succès",
				messageId: response.body?.messageId || "sent",
			},
			{ status: 200 }
		);
	} catch (error: any) {
		console.error("Erreur lors de l'envoi de l'email:", error);

		// Détails de l'erreur pour le debug
		if (error.response) {
			console.error("Status:", error.statusCode);
			console.error("Response body:", error.body);
		}

		return NextResponse.json(
			{
				error: "Erreur lors de l'envoi de l'email",
				details: error.message || "Erreur inconnue",
			},
			{ status: 500 }
		);
	}
}
