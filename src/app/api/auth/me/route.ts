import { prisma } from "@/lib/prisma";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

function isJwtShape(token: string): boolean {
	const parts = token.split(".");
	return parts.length === 3 && parts.every((p) => p.length > 0);
}

function clearAuthCookieResponse(base: NextResponse) {
	base.cookies.set("auth-token", "", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: 0,
		path: "/",
	});
	return base;
}

export async function GET(request: NextRequest) {
	try {
		const token = request.cookies.get("auth-token")?.value;

		if (!token) {
			return NextResponse.json({ user: null }, { status: 401 });
		}

		const secret = process.env.NEXTAUTH_SECRET;
		if (!secret) {
			console.error("NEXTAUTH_SECRET manquant — impossible de vérifier le JWT");
			return NextResponse.json({ user: null }, { status: 500 });
		}

		// Token Facebook : JSON en base64 (sans structure JWT à 3 segments)
		if (!isJwtShape(token)) {
			try {
				const decodedData = JSON.parse(
					Buffer.from(token, "base64").toString()
				);

				if (decodedData.provider === "facebook" && decodedData.userId) {
					const dbUser = await prisma.user.findUnique({
						where: { id: decodedData.userId },
						include: { profile: true },
					});

					if (dbUser) {
						return NextResponse.json({
							user: {
								id: dbUser.id,
								email: dbUser.email,
								profile: {
									firstName: dbUser.profile?.firstName || "",
									lastName: dbUser.profile?.lastName || "",
								},
							},
						});
					}
				}
			} catch {
				// ni Facebook valide ni JWT — traité plus bas
			}
		}

		// JWT (login email, Google, complétion de profil, etc.)
		try {
			const decoded = jwt.verify(token, secret) as { userId?: string };
			const user = await prisma.user.findUnique({
				where: { id: decoded.userId },
				include: { profile: true },
			});
			if (!user) {
				return clearAuthCookieResponse(
					NextResponse.json({ user: null }, { status: 401 })
				);
			}
			return NextResponse.json({
				user: {
					id: user.id,
					email: user.email,
					profile: {
						firstName: user.profile?.firstName || "",
						lastName: user.profile?.lastName || "",
					},
				},
			});
		} catch (verifyErr) {
			// Signature invalide = secret changé ou cookie d’un autre env : retirer le cookie
			if (verifyErr instanceof JsonWebTokenError) {
				console.error("Erreur lors de la vérification du token:", verifyErr);
				return clearAuthCookieResponse(
					NextResponse.json({ user: null }, { status: 401 })
				);
			}
			throw verifyErr;
		}
	} catch (error) {
		console.error("Erreur lors de la vérification du token:", error);
		return NextResponse.json({ user: null }, { status: 401 });
	}
}
