import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: [
					"/api/",
					"/dashboard/",
					"/admin-login",
					"/checkout/",
					"/cart",
					"/account",
					"/orders",
					"/complete-profile",
					"/reset-password",
					"/review",
					"/unsubscribe",
				],
			},
		],
		sitemap: "https://ladyhaya-wear.fr/sitemap.xml",
	};
}
