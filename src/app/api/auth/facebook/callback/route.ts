import { prisma } from "@/lib/prisma";
import { sign } from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const code = searchParams.get("code");
		const state = searchParams.get("state");
		const error = searchParams.get("error");

		// Vérifier s'il y a une erreur
		if (error) {
			console.error("Erreur Facebook OAuth:", error);
			return NextResponse.redirect(
				process.env.NODE_ENV === "production"
					? "https://lady-haya-wear.vercel.app/login?error=facebook_auth_failed"
					: "http://localhost:3000/login?error=facebook_auth_failed"
			);
		}

		// Vérifier le code d'autorisation
		if (!code) {
			console.error("Code d'autorisation manquant");
			return NextResponse.redirect(
				process.env.NODE_ENV === "production"
					? "https://lady-haya-wear.vercel.app/login?error=facebook_code_missing"
					: "http://localhost:3000/login?error=facebook_code_missing"
			);
		}

		// Vérifier le state pour la sécurité
		const cookieStore = await cookies();
		const storedState = cookieStore.get("fb_state")?.value;

		if (!storedState || state !== storedState) {
			console.error("State invalide");
			return NextResponse.redirect(
				process.env.NODE_ENV === "production"
					? "https://lady-haya-wear.vercel.app/login?error=facebook_state_invalid"
					: "http://localhost:3000/login?error=facebook_state_invalid"
			);
		}

		// Échanger le code contre un token d'accès
		const tokenResponse = await fetch(
			"https://graph.facebook.com/v18.0/oauth/access_token",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: new URLSearchParams({
					client_id: FACEBOOK_APP_ID!,
					client_secret: FACEBOOK_APP_SECRET!,
					code: code,
					redirect_uri:
						process.env.NODE_ENV === "production"
							? "https://lady-haya-wear.vercel.app/api/auth/facebook/callback"
							: "http://localhost:3000/api/auth/facebook/callback",
				}),
			}
		);

		if (!tokenResponse.ok) {
			console.error(
				"Erreur lors de l'échange du token:",
				await tokenResponse.text()
			);
			return NextResponse.redirect(
				process.env.NODE_ENV === "production"
					? "https://lady-haya-wear.vercel.app/login?error=facebook_token_failed"
					: "http://localhost:3000/login?error=facebook_token_failed"
			);
		}

		const tokenData = await tokenResponse.json();
		const accessToken = tokenData.access_token;

		// Récupérer les informations de l'utilisateur Facebook
		const userResponse = await fetch(
			`https://graph.facebook.com/v18.0/me?fields=id,name,email,picture&access_token=${accessToken}`
		);

		if (!userResponse.ok) {
			console.error(
				"Erreur lors de la récupération des données utilisateur:",
				await userResponse.text()
			);
			return NextResponse.redirect(
				process.env.NODE_ENV === "production"
					? "https://lady-haya-wear.vercel.app/login?error=facebook_user_data_failed"
					: "http://localhost:3000/login?error=facebook_user_data_failed"
			);
		}

		const userData = await userResponse.json();

		// Vérifier que l'email est présent
		if (!userData.email) {
			console.error("Email non fourni par Facebook");
			return NextResponse.redirect(
				process.env.NODE_ENV === "production"
					? "https://lady-haya-wear.vercel.app/login?error=facebook_email_missing"
					: "http://localhost:3000/login?error=facebook_email_missing"
			);
		}

		// Récupérer les informations Instagram si disponibles
		let instagramData = null;
		try {
			// Essayer de récupérer les pages Facebook liées à Instagram
			const pagesResponse = await fetch(
				`https://graph.facebook.com/v18.0/me/accounts?fields=instagram_business_account&access_token=${accessToken}`
			);

			if (pagesResponse.ok) {
				const pagesResult = await pagesResponse.json();
				if (pagesResult.data && pagesResult.data.length > 0) {
					for (const page of pagesResult.data) {
						if (page.instagram_business_account) {
							const instagramUserResponse = await fetch(
								`https://graph.facebook.com/v18.0/${page.instagram_business_account.id}?fields=id,username,account_type&access_token=${accessToken}`
							);
							if (instagramUserResponse.ok) {
								instagramData = await instagramUserResponse.json();
								break;
							}
						}
					}
				}
			}
		} catch (error) {
			console.log("Instagram non connecté ou non disponible");
		}

		// Créer ou mettre à jour l'utilisateur dans votre base de données
		const user = {
			id: userData.id,
			name: userData.name,
			email: userData.email,
			picture: userData.picture?.data?.url,
			provider: "facebook",
			instagram: instagramData
				? {
						id: instagramData.id,
						username: instagramData.username,
						accountType: instagramData.account_type,
					}
				: null,
		};

		console.log("Utilisateur Facebook connecté:", user);

		// Sauvegarder ou mettre à jour l'utilisateur en BDD
		try {
			// Vérifier si l'utilisateur existe déjà
			let dbUser = await prisma.user.findUnique({
				where: { email: user.email },
				include: { profile: true, accounts: true },
			});

			if (!dbUser) {
				// Créer un nouvel utilisateur
				dbUser = await prisma.user.create({
					data: {
						email: user.email,
						emailVerified: new Date(),
						profile: {
							create: {
								firstName: user.name.split(" ")[0],
								lastName: user.name.split(" ").slice(1).join(" "),
							},
						},
						accounts: {
							create: {
								type: "oauth",
								provider: "facebook",
								providerAccountId: user.id,
								access_token: accessToken,
								token_type: "bearer",
								scope: "email,public_profile",
							},
						},
					},
					include: { profile: true, accounts: true },
				});
				console.log("Nouvel utilisateur Facebook créé:", dbUser.id);
			} else {
				// Mettre à jour l'utilisateur existant
				dbUser = await prisma.user.update({
					where: { id: dbUser.id },
					data: {
						emailVerified: new Date(),
						profile: {
							upsert: {
								create: {
									firstName: user.name.split(" ")[0],
									lastName: user.name.split(" ").slice(1).join(" "),
								},
								update: {
									firstName: user.name.split(" ")[0],
									lastName: user.name.split(" ").slice(1).join(" "),
								},
							},
						},
						accounts: {
							upsert: {
								where: {
									provider_providerAccountId: {
										provider: "facebook",
										providerAccountId: user.id,
									},
								},
								create: {
									type: "oauth",
									provider: "facebook",
									providerAccountId: user.id,
									access_token: accessToken,
									token_type: "bearer",
									scope: "email,public_profile",
								},
								update: {
									access_token: accessToken,
									token_type: "bearer",
									scope: "email,public_profile",
								},
							},
						},
					},
					include: { profile: true, accounts: true },
				});
				console.log("Utilisateur Facebook mis à jour:", dbUser.id);
			}

			// Créer un token de session signé avec l'ID de l'utilisateur en BDD
			const jwtSecret = process.env.NEXTAUTH_SECRET;
			if (!jwtSecret) throw new Error("NEXTAUTH_SECRET manquant");

			const sessionToken = sign(
				{
					userId: dbUser.id,
					email: dbUser.email,
					name: user.name,
					provider: "facebook",
				},
				jwtSecret,
				{ expiresIn: "7d" }
			);

			// Rediriger vers l'accueil avec le cookie de session
			const response = NextResponse.redirect(
				process.env.NODE_ENV === "production"
					? "https://lady-haya-wear.vercel.app/?success=facebook_login"
					: "http://localhost:3000/?success=facebook_login"
			);

			// Définir le cookie de session
			response.cookies.set("auth-token", sessionToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				maxAge: 7 * 24 * 60 * 60, // 7 jours
			});

			// Nettoyer le cookie de state
			response.cookies.delete("fb_state");

			return response;
		} catch (dbError) {
			console.error("Erreur lors de la sauvegarde en BDD:", dbError);
			return NextResponse.redirect(
				process.env.NODE_ENV === "production"
					? "https://lady-haya-wear.vercel.app/login?error=facebook_db_error"
					: "http://localhost:3000/login?error=facebook_db_error"
			);
		}
	} catch (error) {
		console.error("Erreur lors du callback Facebook:", error);
		return NextResponse.redirect(
			process.env.NODE_ENV === "production"
				? "https://lady-haya-wear.vercel.app/login?error=facebook_callback_failed"
				: "http://localhost:3000/login?error=facebook_callback_failed"
		);
	}
}
