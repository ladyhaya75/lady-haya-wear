import AuthToastHandler from "@/components/AuthToastHandler";
import CategoryList from "@/components/CategoryList/CategoryList";
import DemoNotice from "@/components/DemoNotice/DemoNotice";
import Newsletter from "@/components/Newsletter/Newsletter";
import ProductList from "@/components/ProductList/ProductList";
import Reviews from "@/components/Reviews/Reviews";
import ServicesInfo from "@/components/ServicesInfo/ServicesInfo";
import Slider from "@/components/Slider/Slider";
import {
	getAllCategories,
	getFeaturedCategories,
	getFeaturedUnifiedProducts,
} from "@/lib/sanity-queries";

// Revalidation toutes les 60 secondes pour récupérer les nouvelles données de Sanity
export const revalidate = 60;

export default async function Home() {
	const featuredCategories = await getFeaturedCategories();
	const allCategories = await getAllCategories();
	const featuredProducts = await getFeaturedUnifiedProducts();

	return (
		<>
			<AuthToastHandler />
			<Slider featuredCategories={featuredCategories} />
			<DemoNotice />

			<section className="bg-rose-light-2 md:py-16 py-8 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-48">
				<CategoryList categories={allCategories} />
			</section>

			<section className="bg-beige-light md:py-16 py-8 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-48">
				<ProductList featuredProducts={featuredProducts} />
			</section>

			<section>
				<Reviews />
			</section>

			<section>
				<Newsletter />
			</section>

			<section>
				<ServicesInfo />
			</section>
		</>
	);
}
