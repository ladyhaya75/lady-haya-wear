import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// DELETE - Annule une commande PayPal abandonnée (status PENDING)
// Appelé quand l'utilisateur revient sur /checkout après avoir abandonné sur PayPal
export async function DELETE(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const orderId = searchParams.get("orderId");

		if (!orderId) {
			return NextResponse.json(
				{ error: "orderId manquant" },
				{ status: 400 }
			);
		}

		// Auth : vérifier que l'ordre appartient bien à l'utilisateur
		const token = req.cookies.get("auth-token")?.value;
		if (!token) {
			return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
		}

		const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as any;

		// Récupérer la commande et vérifier qu'elle appartient à l'user et est bien PENDING
		const order = await prisma.order.findUnique({
			where: { id: orderId },
		});

		if (!order) {
			return NextResponse.json(
				{ error: "Commande introuvable" },
				{ status: 404 }
			);
		}

		// Sécurité : l'ordre doit appartenir à l'utilisateur connecté
		if (order.userId !== decoded.userId) {
			return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
		}

		// On ne supprime que les commandes PayPal encore en attente
		if (order.paymentMethod !== "paypal" || order.paymentStatus !== "PENDING") {
			return NextResponse.json(
				{ error: "Commande non éligible à l'annulation" },
				{ status: 400 }
			);
		}

		// Supprimer la commande et ses items (cascade via Prisma)
		await prisma.order.delete({ where: { id: orderId } });

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Erreur annulation commande PayPal:", error);
		return NextResponse.json(
			{ error: "Erreur lors de l'annulation" },
			{ status: 500 }
		);
	}
}
