"use client";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IoMdClose, IoMdMenu } from "react-icons/io";
import { IoArrowUp } from "react-icons/io5";
import NavbarIcons from "../Navbar/NavbarIcons";

export default function Navbar() {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [showScrollTop, setShowScrollTop] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			const scrollY = window.scrollY;
			console.log("Scroll Y:", scrollY, "isScrolled:", scrollY > 200);
			setIsScrolled(scrollY > 200);
			setShowScrollTop(scrollY > 1000);
		};

		const handleMenuToggle = (event: CustomEvent) => {
			setIsMenuOpen(event.detail.isOpen);
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		window.addEventListener("menuToggle", handleMenuToggle as EventListener);

		return () => {
			window.removeEventListener("scroll", handleScroll);
			window.removeEventListener(
				"menuToggle",
				handleMenuToggle as EventListener
			);
		};
	}, []);

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	};

	return (
		<>
			<div
				className={`xl:h-[68px] h-[72px] px-4 md:px-8 lg:px-8 xl:px-18 2xl:px-22 bg-rose-light fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
					isScrolled ? "opacity-0 pointer-events-none" : "opacity-100"
				}`}
			>
				{/* Mobile et Tablet (sm à lg) */}
				<div className="flex items-center justify-between h-full xl:hidden">
					<motion.div
						className="relative"
						initial={{ x: -50, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						transition={{ duration: 0.6, delay: 0.5 }}
					>
						<AnimatePresence mode="wait">
							{!isMenuOpen ? (
								<motion.div
									key="menu"
									initial={{ rotate: -90, opacity: 0 }}
									animate={{ rotate: 0, opacity: 1 }}
									exit={{ rotate: 90, opacity: 0 }}
									transition={{ duration: 0.3 }}
								>
									<IoMdMenu
										className="text-4xl cursor-pointer text-logo"
										onClick={() => {
											console.log("Navbar: Clic sur menu");
											window.dispatchEvent(new CustomEvent("openMenu"));
											setIsMenuOpen(true);
										}}
									/>
								</motion.div>
							) : (
								<motion.div
									key="close"
									initial={{ rotate: -90, opacity: 0 }}
									animate={{ rotate: 0, opacity: 1 }}
									exit={{ rotate: 90, opacity: 0 }}
									transition={{ duration: 0.3 }}
								>
									<IoMdClose
										className="text-4xl cursor-pointer text-logo"
										onClick={() => {
											console.log("Navbar: Clic sur fermeture");
											window.dispatchEvent(new CustomEvent("closeMenu"));
											setIsMenuOpen(false);
										}}
									/>
								</motion.div>
							)}
						</AnimatePresence>
					</motion.div>

					<motion.div
						initial={{ scale: 0, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{
							duration: 1.0,
							delay: 0.8,
							ease: [0.68, -0.55, 0.265, 1.55],
						}}
						className="hidden md:flex"
					>
						<Link href="/" className="flex items-center gap-3">
							<motion.div
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.95 }}
								transition={{ duration: 0.5 }}
							>
								<Image
									src="/assets/logo-haya.png"
									alt="Logo"
									width={48}
									height={48}
									className="w-12 h-12"
								/>
							</motion.div>
							<motion.div
								className="text-3xl lg:text-4xl tracking-wide font-alex-brush text-logo font-semibold leading-none"
								whileHover={{ scale: 1.05 }}
								transition={{ duration: 0.5 }}
							>
								Lady Haya Wear
							</motion.div>
						</Link>
					</motion.div>

					<motion.div
						initial={{ x: 50, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						transition={{ duration: 0.6, delay: 1.0 }}
					>
						<NavbarIcons />
					</motion.div>
				</div>
				{/* Desktop (xl+) */}
				<div className="hidden xl:flex items-center h-full relative">
					{/* LEFT - Logo */}
					<motion.div
						initial={{ x: -100, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						transition={{
							duration: 0.6,
							delay: 0.2,
							ease: "easeOut",
						}}
						className="absolute left-0"
					>
						<Link href="/" className="flex items-center gap-3">
							<motion.div
								initial={{ scale: 0, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								transition={{
									duration: 1.0,
									delay: 0.8,
									ease: [0.68, -0.55, 0.265, 1.55],
								}}
								whileHover={{ scale: 1.1, rotate: 5 }}
								whileTap={{ scale: 0.95 }}
							>
								<Image
									src="/assets/logo-haya.png"
									alt="Logo"
									width={48}
									height={48}
									className="w-12 h-12"
								/>
							</motion.div>
							<motion.div
								className="text-4xl tracking-wide font-alex-brush text-logo font-semibold leading-none"
								initial={{ scale: 0, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								transition={{
									duration: 1.0,
									delay: 0.8,
									ease: [0.68, -0.55, 0.265, 1.55],
								}}
								whileHover={{ scale: 1.05 }}
							>
								Lady Haya Wear
							</motion.div>
						</Link>
					</motion.div>

					{/* CENTER - Navigation (centrée par rapport à l'écran) */}
					<div className="w-full flex justify-center">
						<motion.div
							className="hidden lg:flex gap-8 lg:gap-8 xl:gap-14 2xl:gap-16 lg:ml-24 xl:ml-32"
							initial={{ y: -50, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ duration: 0.8, delay: 1.0 }}
						>
							{[
								{ href: "/", label: "Accueil" },
								{ href: "/collections", label: "Collections" },
								{ href: "/allProducts", label: "Tous nos Produits" },
								{ href: "/contact", label: "Contact" },
							].map((item, index) => (
								<motion.div
									key={item.href}
									initial={{ y: -30, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									transition={{ duration: 0.6, delay: 1.2 + index * 0.15 }}
									whileHover={{ y: -2 }}
								>
									<Link
										href={item.href}
										className="relative group text-logo text-xl transition-colors tracking-wide font-balqis font-bold leading-none"
									>
										{item.label}
										<motion.span
											className="absolute bottom-0 left-1/2 w-0 menu-underline h-[1px] group-hover:w-full group-hover:left-0 group-hover:transition-all group-hover:duration-300 group-hover:ease-out transition-all duration-300 ease-in"
											initial={{ scaleX: 0 }}
											whileHover={{ scaleX: 1 }}
											transition={{ duration: 0.3 }}
										/>
									</Link>
								</motion.div>
							))}
						</motion.div>
					</div>

					{/* RIGHT - Icons */}
					<motion.div
						className="flex items-center justify-between gap-8 absolute right-0"
						initial={{ x: 100, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						transition={{ duration: 0.8, delay: 1.5 }}
					>
						<NavbarIcons />
					</motion.div>
				</div>
			</div>

			{/* Bouton remonter en haut */}
			<AnimatePresence>
				{showScrollTop && (
					<motion.button
						initial={{ scale: 0, opacity: 0, rotate: -180 }}
						animate={{ scale: 1, opacity: 1, rotate: 0 }}
						exit={{ scale: 0, opacity: 0, rotate: 180 }}
						whileHover={{ scale: 1.1, rotate: 5 }}
						whileTap={{ scale: 0.95 }}
						transition={{ duration: 0.3, ease: "easeOut" }}
						onClick={scrollToTop}
						className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-rose-medium text-logo rounded-full shadow-lg hover:bg-rose-dark transition-all duration-300 flex items-center justify-center"
						aria-label="Remonter en haut"
					>
						<IoArrowUp className="text-2xl" />
					</motion.button>
				)}
			</AnimatePresence>
		</>
	);
}
