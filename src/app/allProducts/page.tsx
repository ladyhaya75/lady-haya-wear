// Server Component — le fetch Sanity se fait côté serveur, pas dans le navigateur
import { getAllCategories, getAllUnifiedProducts } from "@/lib/sanity-queries";
import AllProductsClient from "./AllProductsClient";

export default async function AllProducts() {
	const [products, categories] = await Promise.all([
		getAllUnifiedProducts(),
		getAllCategories(),
	]);

	return <AllProductsClient products={products} categories={categories} />;
}
