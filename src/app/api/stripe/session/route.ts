import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const sessionId = searchParams.get("session_id");

		if (!sessionId) {
			return NextResponse.json(
				{ error: "Session ID manquant" },
				{ status: 400 }
			);
		}

		// Récupérer la session Stripe
		const session = await stripe.checkout.sessions.retrieve(sessionId);

		// Récupérer la commande depuis la BDD
		const order = await prisma.order.findFirst({
			where: { stripeSessionId: sessionId },
		});

		return NextResponse.json({
			orderNumber: order?.orderNumber,
			email: session.customer_details?.email,
			amount: session.amount_total,
			status: session.payment_status,
		});
	} catch (error) {
		console.error("Erreur récupération session:", error);
		return NextResponse.json(
			{ error: "Erreur récupération session" },
			{ status: 500 }
		);
	}
}

