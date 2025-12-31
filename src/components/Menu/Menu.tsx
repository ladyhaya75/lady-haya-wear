"use client";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

import Link from "next/link";
import { FaInstagram } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa6";
import InstallButton from "../PWA/InstallButton";

export default function Menu() {
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		const handleOpenMenu = () => {
			setIsOpen(true);
			document.body.style.overflow = "hidden";
		};

		const handleCloseMenu = () => {
			setIsOpen(false);
			document.body.style.overflow = "unset";
		};

		window.addEventListener("openMenu", handleOpenMenu);
		window.addEventListener("closeMenu", handleCloseMenu);

		return () => {
			window.removeEventListener("openMenu", handleOpenMenu);
			window.removeEventListener("closeMenu", handleCloseMenu);
			document.body.style.overflow = "unset";
		};
	}, []);

	const closeMenu = () => {
		setIsOpen(false);
		// Restaurer le scroll quand on ferme le menu
		document.body.style.overflow = "unset";
		window.dispatchEvent(
			new CustomEvent("menuToggle", { detail: { isOpen: false } })
		);
	};

	return (
		<div className="">
			{/* Menu avec animation */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						className="fixed left-0 right-0 bottom-0 z-60 top-18"
						onClick={closeMenu}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
					>
						<motion.div
							className="absolute left-0 top-0 h-full w-[90%] md:w-3/4 bg-nude-medium border-t border-white"
							onClick={(e) => e.stopPropagation()}
							initial={{ x: "-100%" }}
							animate={{ x: 0 }}
							exit={{ x: "-100%" }}
							transition={{ duration: 0.3, ease: "easeOut" }}
						>
							{/* Contenu du menu */}
							<motion.div
								className="flex flex-col items-center justify-center pt-20 px-8 gap-6 text-xl"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.3, delay: 0.1 }}
							>
								{/* Logo central avec effet scale comme sur téléphone */}
								<motion.div
									className="flex items-center gap-2"
									initial={{ scale: 0, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									transition={{
										duration: 1.0,
										delay: 0.2,
										ease: [0.68, -0.55, 0.265, 1.55],
									}}
								>
									<Image
										src="/assets/logo-haya.png"
										alt="Logo"
										width={48}
										height={48}
									/>
									<h1 className="text-logo font-alex-brush font-semibold text-4xl">
										Lady-Haya
									</h1>
								</motion.div>

								{/* Trait de séparation */}
								<motion.div
									className="w-32 h-[1px] bg-nude-dark my-4"
									initial={{ scaleX: 0 }}
									animate={{ scaleX: 1 }}
									transition={{ duration: 0.5, delay: 0.3 }}
								></motion.div>

								{/* Liens de navigation - apparaissent de droite à gauche */}
								<motion.div
									className="flex flex-col items-center gap-6"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ duration: 0.3, delay: 0.4 }}
								>
									{[
										{ href: "/", label: "Accueil" },
										{ href: "/collections", label: "Collections" },
										{ href: "/allProducts", label: "Tous nos Produits" },
										{ href: "/contact", label: "Contact" },
									].map((item, index) => (
										<motion.div
											key={item.href}
											initial={{ x: 100, opacity: 0 }}
											animate={{ x: 0, opacity: 1 }}
											transition={{
												duration: 0.6,
												delay: 0.5 + index * 0.1,
												ease: "easeOut",
											}}
											whileHover={{ x: -5 }}
										>
											<Link
												href={item.href}
												className="relative group text-logo font-balqis font-semibold text-2xl transition-colors inline-block"
												onClick={closeMenu}
											>
												{item.label}
												<motion.span
													className="absolute bottom-0 left-1/2 w-0 menu-underline group-hover:w-full group-hover:left-0 group-hover:transition-all group-hover:duration-300 group-hover:ease-out transition-all duration-300 ease-in"
													style={{
														height: "1px",
														backgroundColor: "var(--color-nude-dark)",
													}}
													initial={{ scaleX: 0 }}
													whileHover={{ scaleX: 1 }}
													transition={{ duration: 0.3 }}
												></motion.span>
											</Link>
										</motion.div>
									))}
								</motion.div>

								{/* Trait de séparation */}
								<motion.div
									className="w-32 h-[1px] bg-nude-dark my-4"
									initial={{ scaleX: 0 }}
									animate={{ scaleX: 1 }}
									transition={{ duration: 0.5, delay: 0.8 }}
								></motion.div>

								{/* Réseaux sociaux - apparaissent de bas en haut en dernier */}
								<motion.div
									className="flex flex-col items-center gap-4"
									initial={{ y: 50, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									transition={{
										duration: 0.6,
										delay: 0.9,
										ease: "easeOut",
									}}
								>
									<motion.h3
										className="text-logo font-balqis font-semibold text-lg"
										initial={{ y: 20, opacity: 0 }}
										animate={{ y: 0, opacity: 1 }}
										transition={{ duration: 0.4, delay: 1.0 }}
									>
										Suivez-nous
									</motion.h3>
									<motion.div
										className="flex gap-4"
										initial={{ y: 30, opacity: 0 }}
										animate={{ y: 0, opacity: 1 }}
										transition={{ duration: 0.5, delay: 1.1 }}
									>
										<motion.a
											href="https://instagram.com/lady.haya_wear"
											target="_blank"
											rel="noopener noreferrer"
											className="p-3 bg-pink-600 rounded-full hover:bg-pink-700 transition-colors duration-300"
											onClick={closeMenu}
											initial={{ scale: 0, rotate: -180 }}
											animate={{ scale: 1, rotate: 0 }}
											transition={{
												duration: 0.6,
												delay: 1.2,
												ease: [0.68, -0.55, 0.265, 1.55],
											}}
											whileHover={{ scale: 1.1, rotate: 5 }}
											whileTap={{ scale: 0.9 }}
										>
											<FaInstagram className="text-xl text-white" />
										</motion.a>
										<motion.a
											href="https://tiktok.com/@lady.haya_wear"
											target="_blank"
											rel="noopener noreferrer"
											className="p-3 bg-black rounded-full hover:bg-gray-800 transition-colors duration-300"
											onClick={closeMenu}
											initial={{ scale: 0, rotate: -180 }}
											animate={{ scale: 1, rotate: 0 }}
											transition={{
												duration: 0.6,
												delay: 1.3,
												ease: [0.68, -0.55, 0.265, 1.55],
											}}
											whileHover={{ scale: 1.1, rotate: 5 }}
											whileTap={{ scale: 0.9 }}
										>
											<FaTiktok className="text-xl text-white" />
										</motion.a>
									</motion.div>
								</motion.div>

								{/* Trait de séparation */}
								<motion.div
									className="w-32 h-[1px] bg-nude-dark my-4"
									initial={{ scaleX: 0 }}
									animate={{ scaleX: 1 }}
									transition={{ duration: 0.5, delay: 1.4 }}
								></motion.div>

								{/* Section PWA - Télécharger l'app */}
								<motion.div
									className="flex flex-col items-center gap-4"
									initial={{ y: 50, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									transition={{
										duration: 0.6,
										delay: 1.5,
										ease: "easeOut",
									}}
								>
									<motion.h3
										className="text-logo font-balqis font-semibold text-lg"
										initial={{ y: 20, opacity: 0 }}
										animate={{ y: 0, opacity: 1 }}
										transition={{ duration: 0.4, delay: 1.6 }}
									>
										Télécharger l'app
									</motion.h3>
									<motion.div
										initial={{ scale: 0, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										transition={{
											duration: 0.6,
											delay: 1.7,
											ease: [0.68, -0.55, 0.265, 1.55],
										}}
									>
										<InstallButton />
									</motion.div>
								</motion.div>
							</motion.div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
