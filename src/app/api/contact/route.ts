import {
	checkRateLimit as checkRateLimitMemory,
	logSecurityEvent,
	sanitizeObject,
	secureEmailSchema,
	secureMessageSchema,
	secureNameSchema,
} from "@/lib/security";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Forcer le mode dynamique pour éviter l'évaluation de Brevo au build
export const dynamic = 'force-dynamic';

const contactSchema = z.object({
	nom: secureNameSchema,
	email: secureEmailSchema,
	message: secureMessageSchema,
	commande: z
		.string()
		.optional()
		.transform((val) => (val ? val.replace(/[<>]/g, "") : "")),
});

export async function POST(req: NextRequest) {
	let ip = "unknown";
	try {
		// ===== RATE LIMITING AVEC REDIS =====
		ip =
			req.headers.get("x-forwarded-for") ||
			req.headers.get("x-real-ip") ||
			"unknown";
		const identifier = `contact:${ip}`;

		const rateLimitResult = await checkRateLimit(
			identifier,
			RATE_LIMITS.CONTACT_FORM.limit,
			RATE_LIMITS.CONTACT_FORM.window
		);

		if (!rateLimitResult.success) {
			logSecurityEvent("CONTACT_RATE_LIMIT", { ip, ...rateLimitResult }, ip);
			return NextResponse.json(
				{
					success: false,
					error: "Trop de messages envoyés. Réessayez dans 1 heure.",
					retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
				},
				{ status: 429 }
			);
		}

		const rawData = await req.json();
		const sanitizedData = sanitizeObject(rawData);

		const parsed = contactSchema.safeParse(sanitizedData);
		if (!parsed.success) {
			logSecurityEvent(
				"CONTACT_VALIDATION_ERROR",
				{
					errors: parsed.error.flatten(),
					ip,
				},
				ip
			);

			return NextResponse.json(
				{ success: false, errors: parsed.error.flatten() },
				{ status: 400 }
			);
		}

		// ===== ENVOI SÉCURISÉ =====
		const { sendContactEmail } = await import("@/lib/brevo");
		await sendContactEmail({
			name: parsed.data.nom,
			email: parsed.data.email,
			message: parsed.data.message,
		});

		logSecurityEvent(
			"CONTACT_SUCCESS",
			{
				email: parsed.data.email,
				hasCommande: !!parsed.data.commande,
			},
			ip
		);

		return NextResponse.json({ success: true });
	} catch (error: any) {
		logSecurityEvent(
			"CONTACT_ERROR",
			{
				error: error.message,
				ip,
			},
			ip
		);

		return NextResponse.json(
			{ success: false, error: "Erreur serveur" },
			{ status: 500 }
		);
	}
}
