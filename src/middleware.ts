import { NextRequest, NextResponse } from "next/server";
import { securityMiddleware } from "./middleware-security";

/** Domaines prod : tout le site public redirige vers /coming-soon (sauf assets & API). */
const COMING_SOON_HOSTS = new Set(["ladyhaya-wear.fr", "www.ladyhaya-wear.fr"]);

function isComingSoonHost(request: NextRequest): boolean {
	if (process.env.COMING_SOON_DISABLED === "true") return false;
	return COMING_SOON_HOSTS.has(request.nextUrl.hostname.toLowerCase());
}

/** Fichiers publics servis sans passer par les pages (logo, fonts, PWA…). */
function isPublicStaticPath(pathname: string): boolean {
	return (
		pathname.startsWith("/assets/") ||
		pathname.startsWith("/fonts/") ||
		pathname === "/manifest.json" ||
		pathname === "/robots.txt" ||
		pathname === "/sitemap.xml" ||
		pathname === "/sw.js" ||
		pathname.startsWith("/workbox") ||
		pathname === "/favicon.ico" ||
		pathname.startsWith("/icon") ||
		pathname === "/apple-touch-icon.png"
	);
}

export function middleware(request: NextRequest) {
	// ===== SÉCURITÉ GLOBALE =====
	const securityResponse = securityMiddleware(request);
	if (securityResponse.status !== 200) {
		return securityResponse;
	}

	const pathname = request.nextUrl.pathname;

	// ===== MODE COMING SOON (ladyhaya-wear.fr + www) =====
	// Désactiver le verrou : variable d'environnement COMING_SOON_DISABLED=true (Vercel).
	if (isComingSoonHost(request)) {
		const onComingSoonPage =
			pathname === "/coming-soon" || pathname.startsWith("/coming-soon/");
		if (!onComingSoonPage && !isPublicStaticPath(pathname)) {
			return NextResponse.redirect(new URL("/coming-soon", request.url));
		}
	}

	// ===== PROTECTION DES ROUTES UTILISATEUR =====
	const protectedRoutes = ["/account", "/orders", "/checkout", "/cart"];

	const isProtectedRoute = protectedRoutes.some((route) =>
		pathname.startsWith(route)
	);

	if (isProtectedRoute) {
		const hasSession =
			request.cookies.has("next-auth.session-token") ||
			request.cookies.has("__Secure-next-auth.session-token") ||
			request.cookies.has("auth-token");

		if (!hasSession) {
			const loginUrl = new URL("/login", request.url);
			loginUrl.searchParams.set("callbackUrl", pathname);
			return NextResponse.redirect(loginUrl);
		}
	}

	// ===== PROTECTION DES ROUTES ADMIN =====
	const adminRoutes = ["/dashboard"];

	const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

	if (isAdminRoute) {
		const hasAdminToken = request.cookies.has("admin-token");

		console.log("🔍 Debug middleware - Route admin:", pathname);
		console.log("🔍 Admin token présent:", hasAdminToken);

		if (!hasAdminToken) {
			console.log("❌ Pas de token admin, redirection vers admin-login");
			const loginUrl = new URL("/admin-login", request.url);
			loginUrl.searchParams.set("callbackUrl", pathname);
			return NextResponse.redirect(loginUrl);
		}

		console.log("✅ Token admin trouvé, accès autorisé");
	}

	return securityResponse;
}

export const config = {
	matcher: [
		// Toutes les routes sauf API Next, fichiers statiques _next, favicon
		"/((?!api|_next/static|_next/image|favicon.ico).*)",
		"/",
	],
};
