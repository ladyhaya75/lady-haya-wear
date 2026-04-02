import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
	FaEnvelope,
	FaInstagram,
	FaMapMarkerAlt,
	FaPhone,
} from "react-icons/fa";
import { FaTiktok } from "react-icons/fa6";

export default function Footer() {
	return (
		<footer className="bg-logo text-nude-light">
			{/* Contenu principal du footer */}
			<div className="px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-48 py-12">
				<motion.div
					className="grid grid-cols-1 lg:grid-cols-4  gap-8"
					initial={{ opacity: 0, y: 50 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.1 }}
					transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
				>
					{/* Logo et informations de l'entreprise */}
					<motion.div
						className="lg:col-span-2"
						initial={{ opacity: 0, x: -30 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true, amount: 0.1 }}
						transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
					>
						<div className="flex flex-col items-start gap-1 mb-4">
							<div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-3">
								<div className="flex items-center gap-3">
									<Image
										src="/assets/logo-haya.png"
										alt="Logo Lady Haya Wear"
										width={48}
										height={48}
										className="w-12 h-12"
									/>
									<div className="text-2xl lg:text-3xl font-alex-brush font-semibold">
										Lady Haya Wear
									</div>
								</div>
								<p className="text-xs tracking-widest text-nude-light/70 font-light lg:pl-1">
									— LA MODESTIE SUBLIMÉE —
								</p>
							</div>
						</div>
						<p className="text-sm mb-4 leading-relaxed">
							Spécialiste des vêtements élégants pour femmes musulmanes. Nous
							proposons une collection unique d&apos;abayas, kimonos, robes et
							accessoires qui allient tradition et modernité.
						</p>
						<div className="text-xs space-y-1">
							<p>SIRET : 102 769 643 000 10</p>
							<p>RCS : Paris B 123 456 789</p>
						</div>
					</motion.div>

					{/* Réseaux sociaux */}
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.1 }}
						transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
					>
						<h3 className="text-lg lg:text-xl font-balqis font-semibold mb-4">
							Suivez-nous
						</h3>
						<div className="flex gap-4">
							<motion.a
								href="https://instagram.com/lady.haya_wear"
								target="_blank"
								rel="noopener noreferrer"
								className="p-3 bg-pink-600 rounded-full hover:bg-pink-700"
								initial={{ scale: 0, opacity: 0 }}
								whileInView={{ scale: 1, opacity: 1 }}
								viewport={{ once: true, amount: 0.1 }}
								transition={{
									duration: 0.5,
									ease: [0.68, -0.55, 0.265, 1.55],
									delay: 0.6,
								}}
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.95 }}
							>
								<FaInstagram className="text-xl" />
							</motion.a>
							<motion.a
								href="https://tiktok.com/@lady.haya_wear"
								target="_blank"
								rel="noopener noreferrer"
								className="p-3 bg-black rounded-full hover:bg-gray-800"
								initial={{ scale: 0, opacity: 0 }}
								whileInView={{ scale: 1, opacity: 1 }}
								viewport={{ once: true, amount: 0.1 }}
								transition={{
									duration: 0.5,
									ease: [0.68, -0.55, 0.265, 1.55],
									delay: 0.8,
								}}
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.95 }}
							>
								<FaTiktok className="text-xl" />
							</motion.a>
						</div>
					</motion.div>

					{/* Contact */}
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.1 }}
						transition={{ duration: 0.6, ease: "easeOut", delay: 0.6 }}
					>
						<h3 className="text-lg lg:text-xl font-balqis font-semibold mb-4">
							Contact
						</h3>
						<div className="space-y-3 text-sm">
							<div className="flex items-center gap-3">
								<FaEnvelope className="text-nude-medium" />
								<a
									href="mailto:contact@ladyhaya.fr"
									className="hover:text-nude-medium transition-colors duration-300"
								>
									contact@ladyhaya-wear.fr
								</a>
							</div>
							<div className="flex items-center gap-3">
								<FaPhone className="text-nude-medium" />
								<a
									href="tel:+33123456789"
									className="hover:text-nude-medium transition-colors duration-300"
								>
									+33 1 23 45 67 89
								</a>
							</div>
							<div className="flex items-start gap-3">
								<FaMapMarkerAlt className="text-nude-medium mt-1" />
								<address className="not-italic">
									123 Rue de la Mode
									<br />
									75001 Paris, France
								</address>
							</div>
						</div>
					</motion.div>
				</motion.div>
			</div>

			{/* Séparateur */}
			<div className="border-t border-nude-medium/30"></div>

			{/* Mentions légales */}
			<div className="px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-48 py-6">
				<motion.div
					className="flex flex-col md:flex-row justify-between items-center gap-4"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.1 }}
					transition={{ duration: 0.6, ease: "easeOut", delay: 0.8 }}
				>
					<div className="text-sm">
						© 2024 Lady Haya. Tous droits réservés.
					</div>
					<div className="flex flex-wrap justify-center items-center text-sm gap-4">
						<Link
							href="/mentions/mentions-legales"
							className="hover:text-nude-medium transition-colors duration-300"
						>
							Mentions légales
						</Link>
						<Link
							href="/mentions/politique-confidentialite"
							className="hover:text-nude-medium transition-colors duration-300"
						>
							Politique de confidentialité
						</Link>
						<Link
							href="/mentions/conditions-vente"
							className="hover:text-nude-medium transition-colors duration-300"
						>
							Conditions de vente
						</Link>
					</div>
				</motion.div>
			</div>
		</footer>
	);
}
