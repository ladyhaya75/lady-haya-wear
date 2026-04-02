import { getAdminFromRequest } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - Récupérer tous les reviews pour l'admin (avec filtres)
export async function GET(request: NextRequest) {
	try {
		// Vérification authentification admin
		const admin = await getAdminFromRequest(request);
		if (!admin) {
			return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const status = searchParams.get("status");
		const submitted = searchParams.get("submitted");
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "20");
		const search = searchParams.get("search");

		// Construire les filtres
		const where: any = {};

		if (status && status !== "all") {
			where.status = status;
		}

		// Filtrer par soumission client
		if (submitted === "true") {
			where.submittedAt = {
				not: null, // Seulement les reviews soumis par le client
			};
		} else if (submitted === "false") {
			where.submittedAt = null; // Seulement les reviews non soumis
		}

		if (search) {
			where.OR = [
				{ customerName: { contains: search, mode: "insensitive" } },
				{ customerEmail: { contains: search, mode: "insensitive" } },
				{ productName: { contains: search, mode: "insensitive" } },
				{ comment: { contains: search, mode: "insensitive" } },
				{
					order: {
						orderNumber: { contains: search, mode: "insensitive" },
					},
				},
			];
		}

		// Calculer l'offset pour la pagination
		const offset = (page - 1) * limit;

		// Récupérer les reviews avec pagination
		const [reviews, totalCount] = await Promise.all([
			prisma.review.findMany({
				where,
				include: {
					order: {
						select: {
							orderNumber: true,
							createdAt: true,
						},
					},
					user: {
						select: {
							id: true,
							email: true,
						},
					},
				},
				orderBy: { createdAt: "desc" },
				skip: offset,
				take: limit,
			}),
			prisma.review.count({ where }),
		]);

		// Calculer les statistiques (seulement pour les reviews soumis par les clients)
		const statsWhere = {
			...where,
			// Pour les stats, on ne compte que les reviews soumis par les clients
			submittedAt: {
				not: null,
			},
		};

		const stats = await prisma.review.groupBy({
			by: ["status"],
			where: statsWhere,
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

		// Calculer les statistiques des notes (seulement pour les reviews soumis)
		const ratingStats = await prisma.review.groupBy({
			by: ["rating"],
			where: {
				rating: {
					gte: 1,
				},
				submittedAt: {
					not: null,
				},
			},
			_count: {
				rating: true,
			},
		});

		const ratingDistribution = ratingStats.reduce(
			(acc, stat) => {
				acc[stat.rating] = stat._count.rating;
				return acc;
			},
			{} as Record<number, number>
		);

		return NextResponse.json({
			reviews,
			pagination: {
				page,
				limit,
				total: totalCount,
				totalPages: Math.ceil(totalCount / limit),
			},
			stats: {
				status: statusStats,
				ratings: ratingDistribution,
			},
		});
	} catch (error) {
		console.error("Erreur lors de la récupération des reviews admin:", error);
		return NextResponse.json(
			{
				error: "Erreur lors de la récupération des avis",
				details: error instanceof Error ? error.message : "Erreur inconnue",
			},
			{ status: 500 }
		);
	}
}
