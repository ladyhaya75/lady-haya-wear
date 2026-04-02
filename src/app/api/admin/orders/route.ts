import { getAdminFromRequest } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - Récupérer toutes les commandes avec filtres
export async function GET(request: NextRequest) {
	try {
		// Vérification authentification admin
		const admin = await getAdminFromRequest(request);
		if (!admin) {
			return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const status = searchParams.get("status");
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "10");
		const search = searchParams.get("search");

		// Construire les filtres
		const where: any = {};

		if (status && status !== "all") {
			where.status = status;
		}

		if (search) {
			where.OR = [
				{ orderNumber: { contains: search, mode: "insensitive" } },
				{ customerName: { contains: search, mode: "insensitive" } },
				{ customerEmail: { contains: search, mode: "insensitive" } },
			];
		}

		// Calculer l'offset pour la pagination
		const offset = (page - 1) * limit;

		// Récupérer les commandes avec pagination
		const [orders, totalCount] = await Promise.all([
			prisma.order.findMany({
				where,
				include: {
					items: true,
					user: {
						select: {
							id: true,
							email: true,
						},
					},
					shippingAddress: true,
					billingAddress: true,
					promoCode: {
						select: {
							id: true,
							code: true,
						},
					},
				},
				orderBy: { createdAt: "desc" },
				skip: offset,
				take: limit,
			}),
			prisma.order.count({ where }),
		]);

		// Calculer les statistiques
		const stats = await prisma.order.groupBy({
			by: ["status"],
			_count: {
				status: true,
			},
		});

		const statusStats = stats.reduce(
			(acc, stat) => {
				acc[stat.status] = stat._count.status;
				return acc;
			},
			{} as Record<string, number>
		);

		return NextResponse.json({
			orders,
			pagination: {
				page,
				limit,
				total: totalCount,
				totalPages: Math.ceil(totalCount / limit),
			},
			stats: statusStats,
		});
	} catch (error) {
		console.error("Erreur lors de la récupération des commandes:", error);
		return NextResponse.json(
			{ error: "Erreur lors de la récupération des commandes" },
			{ status: 500 }
		);
	}
}
