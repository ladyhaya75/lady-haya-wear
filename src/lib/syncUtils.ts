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
        "slug": slug.current,
        "colors": colors[] {
          name,
          "mainImage": mainImage.asset->url,
          "mainImageAlt": mainImage.alt
        },
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
			const originalPrice = productDetails.promoPercentage
				? productDetails.price
				: undefined;

			// Chercher l'image de la couleur spécifique de l'article
			const colorData = productDetails.colors?.find(
				(c: { name: string; mainImage: string; mainImageAlt: string }) =>
					c.name === dbItem.colorName
			);
			// Fallback sur l'image principale du produit si la couleur n'a pas d'image
			const image = colorData?.mainImage || productDetails.image || null;
			const imageAlt = colorData?.mainImageAlt || productDetails.imageAlt || "";

			enrichedItems.push({
				id: `${dbItem.productId}-${dbItem.colorName}-${dbItem.sizeName}`,
				productId: dbItem.productId,
				name: productDetails.name,
				price: dbItem.price,
				originalPrice: originalPrice,
				promoPercentage: productDetails.promoPercentage,
				image,
				imageAlt,
				color: dbItem.colorName || "",
				colorHex: "",
				size: dbItem.sizeName || "",
				quantity: dbItem.quantity,
				maxQuantity: 10,
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
