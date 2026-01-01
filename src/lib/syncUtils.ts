import { sanityClient } from "./sanity";

// Fonction pour récupérer les détails d'un produit depuis Sanity
export async function getProductDetails(productId: string) {
	try {
		const query = `
      *[_type == "productUnified" && _id == $productId][0] {
        _id,
        name,
        price,
        originalPrice,
        promoPercentage,
        "image": mainImage.asset->url,
        "imageAlt": mainImage.alt,
        "hoverImage": hoverImage.asset->url,
        "hoverImageAlt": hoverImage.alt,
        "slug": slug.current,
        category->{
          _id,
          name,
          "slug": slug.current
        }
      }
    `;

		const product = await sanityClient.fetch(query, { productId });
		return product;
	} catch (error) {
		console.error("Erreur lors de la récupération du produit:", error);
		return null;
	}
}

// Fonction pour enrichir les items du panier avec les détails Sanity
export async function enrichCartItems(dbItems: any[]) {
	const enrichedItems = [];

	for (const dbItem of dbItems) {
		const productDetails = await getProductDetails(dbItem.productId);

		if (productDetails) {
			// Si le produit a un promoPercentage, originalPrice est le prix de base
			const originalPrice = productDetails.promoPercentage 
				? productDetails.price 
				: undefined;

			enrichedItems.push({
				id: `${dbItem.productId}-${dbItem.colorName}-${dbItem.sizeName}`,
				productId: dbItem.productId,
				name: productDetails.name,
				price: dbItem.price,
				originalPrice: originalPrice,
				promoPercentage: productDetails.promoPercentage,
				image: productDetails.image,
				imageAlt: productDetails.imageAlt,
				color: dbItem.colorName || "",
				colorHex: "", // Cette info n'est pas disponible en base
				size: dbItem.sizeName || "",
				quantity: dbItem.quantity,
				maxQuantity: 10, // Valeur par défaut
				slug: productDetails.slug,
			});
		}
	}

	return enrichedItems;
}

// Fonction pour enrichir les favoris avec les détails Sanity
export async function enrichFavorites(dbFavorites: any[]) {
	const enrichedFavorites = [];

	for (const dbFavorite of dbFavorites) {
		const productDetails = await getProductDetails(dbFavorite.productId);

		if (productDetails) {
			enrichedFavorites.push({
				productId: dbFavorite.productId,
				name: productDetails.name,
				price: productDetails.price,
				originalPrice: productDetails.originalPrice,
				promoPercentage: productDetails.promoPercentage,
				image: productDetails.image,
				imageAlt: productDetails.imageAlt,
				slug: productDetails.slug,
				category: productDetails.category,
			});
		}
	}

	return enrichedFavorites;
}
