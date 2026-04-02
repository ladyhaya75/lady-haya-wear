import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET est manquant dans les variables d'environnement");
// JWT_SECRET est garanti non-undefined après le throw ci-dessus
const JWT_SECRET_DEFINED = JWT_SECRET as string;

// POST - Connexion admin
export async function POST(request: NextRequest) {
	try {
		const { email, password } = await request.json();

		// Validation des champs
		if (!email || !password) {
			return NextResponse.json(
				{ error: "Email et mot de passe requis" },
				{ status: 400 }
			);
		}

		// Rechercher l'admin dans la base de données
		const admin = await prisma.admin.findUnique({
			where: { email: email.toLowerCase() },
		});

		if (!admin || !admin.isActive) {
			return NextResponse.json(
				{ error: "Identifiants incorrects" },
				{ status: 401 }
			);
		}

		// Vérifier le mot de passe
		const isPasswordValid = await bcrypt.compare(password, admin.password);

		if (!isPasswordValid) {
			return NextResponse.json(
				{ error: "Identifiants incorrects" },
				{ status: 401 }
			);
		}

		// Mettre à jour la dernière connexion
		await prisma.admin.update({
			where: { id: admin.id },
			data: { lastLoginAt: new Date() },
		});

		// Créer le token JWT
		const token = sign(
			{
				id: admin.id,
				email: admin.email,
				name: admin.name,
				role: admin.role,
			},
			JWT_SECRET_DEFINED,
			{ expiresIn: "24h" }
		);

		// Créer la réponse
		const response = NextResponse.json(
			{
				message: "Connexion réussie",
				user: {
					id: admin.id,
					email: admin.email,
					name: admin.name,
					role: admin.role,
				},
			},
			{ status: 200 }
		);

		// Définir le cookie
		response.cookies.set("admin-token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 24 * 60 * 60, // 24 heures
		});

		return response;
	} catch (error) {
		console.error("Erreur lors de la connexion admin:", error);
		return NextResponse.json(
			{ error: "Erreur lors de la connexion" },
			{ status: 500 }
		);
	}
}

// GET - Vérifier l'authentification
export async function GET(request: NextRequest) {
	try {
		const token = request.cookies.get("admin-token")?.value;

		if (!token) {
			return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
		}

		// Vérifier le token
		const decoded = verify(token, JWT_SECRET_DEFINED) as any;

		if (!decoded || !decoded.id) {
			return NextResponse.json({ error: "Token invalide" }, { status: 401 });
		}

		// Vérifier que l'admin existe toujours et est actif
		const admin = await prisma.admin.findUnique({
			where: { id: decoded.id },
		});

		if (!admin || !admin.isActive) {
			return NextResponse.json(
				{ error: "Compte administrateur non trouvé ou inactif" },
				{ status: 401 }
			);
		}

		return NextResponse.json({
			authenticated: true,
			user: {
				id: admin.id,
				email: admin.email,
				name: admin.name,
				role: admin.role,
			},
		});
	} catch (error) {
		console.error("Erreur lors de la vérification d'authentification:", error);
		return NextResponse.json(
			{ error: "Erreur lors de la vérification" },
			{ status: 500 }
		);
	}
}
