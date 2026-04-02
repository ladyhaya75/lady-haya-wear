"use client";

import ProductGrid from "@/components/ProductGrid/ProductGrid";
import ProductGridSkeleton from "@/components/Skeletons/ProductGridSkeleton";
import { motion } from "framer-motion";
import { Suspense } from "react";

interface AllProductsClientProps {
	products: any[];
	categories: any[];
}

export default function AllProductsClient({ products, categories }: AllProductsClientProps) {
	return (
		<div className="min-h-screen bg-beige-light">
			{/* Header de la page */}
			<section className="px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-48 py-16">
				<motion.div
					className="text-center"
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, ease: "easeOut" }}
				>
					<motion.h1
						className="text-5xl lg:text-6xl font-alex-brush text-logo mt-12 lg:mt-14 mb-4"
						initial={{ y: 50, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
					>
						Tous nos produits
					</motion.h1>
					<motion.p
						className="text-lg text-nude-dark mb-6 max-w-2xl mx-auto"
						initial={{ y: 30, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
					>
						Découvrez notre collection complète de vêtements élégants et
						tendance pour femmes musulmanes. Des pièces uniques qui allient
						style et confort.
					</motion.p>
					<motion.div
						className="flex flex-col sm:flex-row gap-4 justify-center"
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
					>
						<div className="text-sm text-nude-dark bg-rose-light-2 px-4 py-2 rounded-full">
							{products.length} produit{products.length > 1 ? "s" : ""}{" "}
							disponible{products.length > 1 ? "s" : ""}
						</div>
					</motion.div>
				</motion.div>
			</section>

			{/* Grille des produits */}
			<motion.section
				className="px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-48 py-2 mb-16"
				initial={{ opacity: 0, y: 40 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
			>
				<Suspense fallback={<ProductGridSkeleton count={12} />}>
					<ProductGrid
						products={products}
						title=""
						showFilters={true}
						categories={categories}
					/>
				</Suspense>
			</motion.section>

			{/* Section CTA */}
			<motion.section
				className="px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-48 bg-rose-light-2 py-16"
				initial={{ opacity: 0, y: 30 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, amount: 0.3 }}
				transition={{ duration: 0.8, ease: "easeOut" }}
			>
				<motion.div
					className="text-center"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.3 }}
					transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
				>
					<motion.h2
						className="text-4xl lg:text-5xl font-alex-brush text-logo mb-4"
						initial={{ y: 30, opacity: 0 }}
						whileInView={{ y: 0, opacity: 1 }}
						viewport={{ once: true, amount: 0.3 }}
						transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
					>
						Vous ne trouvez pas votre bonheur ?
					</motion.h2>
					<motion.p
						className="text-lg text-nude-dark mb-8 max-w-2xl mx-auto"
						initial={{ y: 20, opacity: 0 }}
						whileInView={{ y: 0, opacity: 1 }}
						viewport={{ once: true, amount: 0.3 }}
						transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
					>
						Nos collections sont régulièrement mises à jour avec de nouvelles
						pièces. N&apos;hésitez pas à nous contacter pour des demandes spéciales.
					</motion.p>
					<motion.div
						className="flex flex-col sm:flex-row gap-4 justify-center"
						initial={{ y: 20, opacity: 0 }}
						whileInView={{ y: 0, opacity: 1 }}
						viewport={{ once: true, amount: 0.3 }}
						transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
					>
						<a
							href="/contact"
							className="rounded-2xl w-max ring-1 ring-nude-dark text-nude-dark py-3 px-6 text-sm hover:bg-nude-dark hover:text-[#f8ede4] transition-all duration-300"
						>
							Nous contacter
						</a>
						<a
							href="/collections"
							className="rounded-2xl w-max ring-1 ring-nude-dark text-nude-dark py-3 px-6 text-sm hover:bg-nude-dark hover:text-[#f8ede4] transition-all duration-300"
						>
							Voir par collection
						</a>
					</motion.div>
				</motion.div>
			</motion.section>
		</div>
	);
}
