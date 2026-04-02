import { getAdminFromRequest } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

// GET - Récupérer tous les admins
export async function GET(request: NextRequest) {
	try {
		// Vérification authentification admin
		const admin = await getAdminFromRequest(request);
		if (!admin) {
			return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
		}

		const admins = await prisma.admin.findMany({
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				isActive: true,
				lastLoginAt: true,
				createdAt: true,
			},
			orderBy: { createdAt: "desc" },
		});

		return NextResponse.json(admins);
	} catch (error) {
		console.error("Erreur lors de la récupération des admins:", error);
		return NextResponse.json(
			{ error: "Erreur lors de la récupération des admins" },
			{ status: 500 }
		);
	}
}

// POST - Créer un nouvel admin
export async function POST(request: NextRequest) {
	try {
		// Vérification authentification admin
		const currentAdmin = await getAdminFromRequest(request);
		if (!currentAdmin) {
			return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
		}

		const { email, password, name, role } = await request.json();

		// Validation des champs
		if (!email || !password || !name || !role) {
			return NextResponse.json(
				{ error: "Tous les champs sont requis" },
				{ status: 400 }
			);
		}

		// Vérifier la limite de 3 admins
		const adminCount = await prisma.admin.count();
		if (adminCount >= 3) {
			return NextResponse.json(
				{ error: "Nombre maximum d'administrateurs atteint (3)" },
				{ status: 400 }
			);
		}

		// Vérifier si l'email existe déjà
		const existingAdmin = await prisma.admin.findUnique({
			where: { email: email.toLowerCase() },
		});

		if (existingAdmin) {
			return NextResponse.json(
				{ error: "Un administrateur avec cet email existe déjà" },
				{ status: 400 }
			);
		}

		// Hasher le mot de passe
		const hashedPassword = await bcrypt.hash(password, 12);

		// Créer l'admin
		const admin = await prisma.admin.create({
			data: {
				email: email.toLowerCase(),
				password: hashedPassword,
				name,
				role,
				isActive: true,
			},
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				isActive: true,
				lastLoginAt: true,
				createdAt: true,
			},
		});

		return NextResponse.json(
			{ message: "Administrateur créé avec succès", admin },
			{ status: 201 }
		);
	} catch (error) {
		console.error("Erreur lors de la création de l'admin:", error);
		return NextResponse.json(
			{ error: "Erreur lors de la création de l'administrateur" },
			{ status: 500 }
		);
	}
}
