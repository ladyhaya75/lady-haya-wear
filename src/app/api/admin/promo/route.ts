import { getAdminFromRequest } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - Récupérer tous les codes promo
export async function GET(request: NextRequest) {
	try {
		// Vérification authentification admin
		const admin = await getAdminFromRequest(request);
		if (!admin) {
			return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
		}

		const promoCodes = await prisma.promoCode.findMany({
			orderBy: {
				createdAt: "desc",
			},
		});

		// Transformer les données pour correspondre au format attendu par le frontend
		const formattedPromos = promoCodes.map((promo) => ({
			id: promo.id,
			code: promo.code,
			discount:
				promo.type === "PERCENTAGE" ? `${promo.value}%` : `€${promo.value}`,
			type: promo.type === "PERCENTAGE" ? "Pourcentage" : "Montant fixe",
			validFrom: promo.validFrom.toISOString().split("T")[0],
			validTo: promo.validUntil.toISOString().split("T")[0],
			usage: promo.usedCount,
			maxUsage: promo.maxUses,
			status: getPromoStatus(promo),
		}));

		return NextResponse.json(formattedPromos);
	} catch (error) {
		console.error("Erreur lors de la récupération des codes promo:", error);
		return NextResponse.json(
			{ error: "Erreur lors de la récupération des codes promo" },
			{ status: 500 }
		);
	}
}

// POST - Créer un nouveau code promo
export async function POST(request: NextRequest) {
	try {
		// Vérification authentification admin
		const admin = await getAdminFromRequest(request);
		if (!admin) {
			return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
		}

		const body = await request.json();
		const { code, discount, type, validFrom, validTo, maxUsage } = body;

		// Validation des données
		if (!code || !discount || !type || !validFrom || !validTo) {
			return NextResponse.json(
				{ error: "Tous les champs obligatoires doivent être remplis" },
				{ status: 400 }
			);
		}

		// Vérifier si le code existe déjà
		const existingCode = await prisma.promoCode.findUnique({
			where: { code: code.toUpperCase() },
		});

		if (existingCode) {
			return NextResponse.json(
				{ error: "Ce code de promotion existe déjà" },
				{ status: 400 }
			);
		}

		// Extraire la valeur numérique du discount
		let value: number;
		if (type === "Pourcentage") {
			value = parseFloat(discount.replace("%", ""));
		} else {
			value = parseFloat(discount.replace("€", ""));
		}

		// Créer le code promo
		const newPromoCode = await prisma.promoCode.create({
			data: {
				code: code.toUpperCase(),
				type: type === "Pourcentage" ? "PERCENTAGE" : "FIXED",
				value: value,
				validFrom: new Date(validFrom),
				validUntil: new Date(validTo),
				maxUses: maxUsage ? parseInt(maxUsage) : null,
				usedCount: 0,
				active: true,
			},
		});

		// Retourner le code promo formaté
		const formattedPromo = {
			id: newPromoCode.id,
			code: newPromoCode.code,
			discount:
				newPromoCode.type === "PERCENTAGE"
					? `${newPromoCode.value}%`
					: `€${newPromoCode.value}`,
			type: newPromoCode.type === "PERCENTAGE" ? "Pourcentage" : "Montant fixe",
			validFrom: newPromoCode.validFrom.toISOString().split("T")[0],
			validTo: newPromoCode.validUntil.toISOString().split("T")[0],
			usage: newPromoCode.usedCount,
			maxUsage: newPromoCode.maxUses,
			status: getPromoStatus(newPromoCode),
		};

		return NextResponse.json(formattedPromo, { status: 201 });
	} catch (error) {
		console.error("Erreur lors de la création du code promo:", error);
		return NextResponse.json(
			{ error: "Erreur lors de la création du code promo" },
			{ status: 500 }
		);
	}
}

// Fonction pour déterminer le statut d'un code promo
function getPromoStatus(promo: any) {
	const now = new Date();

	// Vérifier si le code est expiré
	if (promo.validUntil < now) {
		return "Expirée";
	}

	// Vérifier si le code a atteint sa limite d'utilisations
	if (promo.maxUses && promo.usedCount >= promo.maxUses) {
		return "Inactive";
	}

	// Vérifier si le code est actif
	if (!promo.active) {
		return "Inactive";
	}

	return "Active";
}
