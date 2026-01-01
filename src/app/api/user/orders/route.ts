import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		// Vérifier l'authentification via JWT
		const token = request.cookies.get("auth-token")?.value;

		if (!token) {
			return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
		}

		// Vérifier le token JWT
		const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as any;

		// Récupérer l'utilisateur
		const user = await prisma.user.findUnique({
			where: { id: decoded.userId },
			include: {
				profile: true,
			},
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Utilisateur non trouvé" },
				{ status: 404 }
			);
		}

		// Récupérer les commandes avec paiement validé
		const orders = await prisma.order.findMany({
			where: {
				userId: user.id,
				paymentStatus: "PAID", // Seulement les commandes payées
			},
			include: {
				items: true,
				shippingAddress: true,
				billingAddress: true,
				promoCode: true,
			},
			orderBy: {
				createdAt: "desc", // Plus récentes en premier
			},
		});

		// Formater les données pour le frontend
		const formattedOrders = orders.map((order) => ({
			id: order.id,
			orderNumber: order.orderNumber,
			status: order.status,
			customerEmail: order.customerEmail,
			customerName: order.customerName,
			customerPhone: order.customerPhone,
			subtotal: order.subtotal,
			shippingCost: order.shippingCost,
			taxAmount: order.taxAmount,
			total: order.total,
			promoDiscount: order.promoDiscount,
			paymentMethod: order.paymentMethod,
			paymentStatus: order.paymentStatus,
			notes: order.notes,
			createdAt: order.createdAt,

			shippedAt: order.shippedAt,
			deliveredAt: order.deliveredAt,
			trackingNumber: order.trackingNumber,
			carrier: order.carrier,
			items: order.items.map((item) => ({
				id: item.id,
				productId: item.productId,
				productName: item.productName,
				colorName: item.colorName,
				sizeName: item.sizeName,
				quantity: item.quantity,
				unitPrice: item.unitPrice,
				totalPrice: item.totalPrice,
			})),
			shippingAddress: order.shippingAddress
				? {
						id: order.shippingAddress.id,
						civility: order.shippingAddress.civility,
						firstName: order.shippingAddress.firstName,
						lastName: order.shippingAddress.lastName,
						company: order.shippingAddress.company,
						street: order.shippingAddress.street,
						city: order.shippingAddress.city,
						zipCode: order.shippingAddress.zipCode,
						country: order.shippingAddress.country,
						phone: order.shippingAddress.phone,
					}
				: null,
			billingAddress: order.billingAddress
				? {
						id: order.billingAddress.id,
						civility: order.billingAddress.civility,
						firstName: order.billingAddress.firstName,
						lastName: order.billingAddress.lastName,
						company: order.billingAddress.company,
						street: order.billingAddress.street,
						city: order.billingAddress.city,
						zipCode: order.billingAddress.zipCode,
						country: order.billingAddress.country,
						phone: order.billingAddress.phone,
					}
				: null,
			promoCode: order.promoCode
				? {
						id: order.promoCode.id,
						code: order.promoCode.code,
						type: order.promoCode.type,
						value: order.promoCode.value,
					}
				: null,
		}));

		// Séparer les commandes en cours et l'historique
		const currentOrders = formattedOrders.filter(
			(order) =>
				order.status === "PENDING" ||
				order.status === "PROCESSING" ||
				order.status === "SHIPPED"
		);

		const historicalOrders = formattedOrders.filter(
			(order) =>
				order.status === "DELIVERED" ||
				order.status === "CANCELLED" ||
				order.status === "REFUNDED"
		);

	return NextResponse.json({
		orders: formattedOrders, // Pour le hook useOrders
		currentOrders,
		historicalOrders,
		total: formattedOrders.length,
	});
	} catch (error) {
		console.error("Erreur lors de la récupération des commandes:", error);
		return NextResponse.json(
			{ error: "Erreur interne du serveur" },
			{ status: 500 }
		);
	}
}
