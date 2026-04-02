import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = "https://ladyhaya-wear.fr";

	// Pages statiques publiques (produits/collections dynamiques ajoutés plus tard)
	const staticPages = [
		{ url: baseUrl, priority: 1.0, changeFrequency: "weekly" as const },
		{ url: `${baseUrl}/allProducts`, priority: 0.9, changeFrequency: "daily" as const },
		{ url: `${baseUrl}/collections`, priority: 0.9, changeFrequency: "weekly" as const },
		{ url: `${baseUrl}/contact`, priority: 0.6, changeFrequency: "monthly" as const },
		{ url: `${baseUrl}/guide-tailles`, priority: 0.5, changeFrequency: "monthly" as const },
		{ url: `${baseUrl}/services/envoi-rapide`, priority: 0.4, changeFrequency: "monthly" as const },
		{ url: `${baseUrl}/services/paiement-securise`, priority: 0.4, changeFrequency: "monthly" as const },
		{ url: `${baseUrl}/services/retours`, priority: 0.4, changeFrequency: "monthly" as const },
		{ url: `${baseUrl}/services/service-client`, priority: 0.4, changeFrequency: "monthly" as const },
		{ url: `${baseUrl}/mentions/mentions-legales`, priority: 0.2, changeFrequency: "yearly" as const },
		{ url: `${baseUrl}/mentions/conditions-vente`, priority: 0.2, changeFrequency: "yearly" as const },
		{ url: `${baseUrl}/mentions/politique-confidentialite`, priority: 0.2, changeFrequency: "yearly" as const },
	];

	return staticPages.map((page) => ({
		url: page.url,
		lastModified: new Date(),
		changeFrequency: page.changeFrequency,
		priority: page.priority,
	}));
}
