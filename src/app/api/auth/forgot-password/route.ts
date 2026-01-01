import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Forcer le mode dynamique pour éviter l'évaluation de Brevo au build
export const dynamic = 'force-dynamic';
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
	try {
		const { email } = await request.json();
		if (!email || typeof email !== "string") {
			return NextResponse.json({ success: true }); // Toujours succès pour la sécurité
		}
		// Chercher l'utilisateur
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) {
			return NextResponse.json({ success: true }); // Toujours succès
		}
		// Générer un token sécurisé et une date d'expiration (1h)
		const resetToken = uuidv4();
		const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1h
		// Stocker le token et l'expiration
		await prisma.user.update({
			where: { email },
			data: { resetToken, resetTokenExpiry },
		});
		// Envoyer l'email via Brevo
		const { sendPasswordResetEmail } = await import("@/lib/brevo");
		await sendPasswordResetEmail(email, resetToken);
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Erreur forgot-password:", error);
		// Toujours succès pour ne pas révéler l'existence de l'email
		return NextResponse.json({ success: true });
	}
}
