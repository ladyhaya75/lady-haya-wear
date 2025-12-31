"use client";

import { useScrollLock } from "@/hooks/useScrollLock";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaHeart, FaUser } from "react-icons/fa";
import { FaBagShopping } from "react-icons/fa6";

// ✅ Lazy load des modals (chargés uniquement au clic)
const CartModal = dynamic(() => import("../CartModal/CartModal"), {
	ssr: false,
});
const FavModal = dynamic(() => import("../FavModal/FavModal"), {
	ssr: false,
});
const InstallButton = dynamic(() => import("../PWA/InstallButton"), {
	ssr: false,
});

export default function NavbarIcons() {
	const router = useRouter();
	const favorites = useFavoritesStore((state) => state.favorites);
	const getCartCount = useCartStore((state) => state.getCartCount);
	const { user, loading, logout } = useAuthStore();
	const profileModalRef = useRef<HTMLDivElement>(null);

	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const [isCartOpen, setIsCartOpen] = useState(false);
	const [isFavOpen, setIsFavOpen] = useState(false);

	// Bloquer le scroll quand une modale est ouverte
	useScrollLock(isCartOpen || isFavOpen);

	// Vérifier si l'utilisateur est connecté
	const isLoggedIn = !!user;

	// Fermeture de la modale au clic extérieur
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				profileModalRef.current &&
				!profileModalRef.current.contains(event.target as Node)
			) {
				setIsProfileOpen(false);
			}
		};

		if (isProfileOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isProfileOpen]);

	const handleProfile = () => {
		if (!isLoggedIn) {
			router.push("/login");
		} else {
			setIsProfileOpen((prev) => !prev);
		}
	};

	const handleLogout = async () => {
		setIsProfileOpen(false);
		await logout();
		router.push("/");
	};

	return (
		<motion.div
			className="flex items-center gap-4 xl:gap-6 relative"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}
		>
		{/* Bouton Installation PWA - Masqué sur mobile, visible sur desktop */}
		<motion.div
			className="hidden xl:flex"
			initial={{ scale: 0, opacity: 0, y: -20 }}
			animate={{ scale: 1, opacity: 1, y: 0 }}
			transition={{
				duration: 0.6,
				delay: 0.1,
				ease: [0.68, -0.55, 0.265, 1.55],
			}}
		>
			<InstallButton />
		</motion.div>

			<motion.div
				initial={{ scale: 0, opacity: 0, y: -20 }}
				animate={{ scale: 1, opacity: 1, y: 0 }}
				transition={{
					duration: 0.6,
					delay: 0.2,
					ease: [0.68, -0.55, 0.265, 1.55],
				}}
				whileTap={{ scale: 0.9 }}
			>
				<FaUser
					className="text-xl cursor-pointer text-logo"
					onClick={handleProfile}
				/>
			</motion.div>

			{isProfileOpen && isLoggedIn && (
				<motion.div
					ref={profileModalRef}
					className="absolute p-4 rounded-lg top-12 right-2 text-sm shadow-[0_3px_10px_rgb(0,0,0,0.2)] z-20 bg-nude-light border border-nude-light min-w-[200px]"
					initial={{ opacity: 0, scale: 0.8, y: -10 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					transition={{ duration: 0.3, ease: "easeOut" }}
				>
					<div className="flex items-center gap-3 mb-3 pb-3 border-b border-nude-medium">
						<Image
							src="/assets/logo-haya.png"
							alt="Lady Haya Wear"
							width={32}
							height={32}
							className="rounded-full"
						/>
						<div>
							<p className="text-logo font-medium truncate max-w-[120px]">
								{user?.profile?.firstName || user?.profile?.lastName
									? `${user?.profile?.firstName || ""} ${user?.profile?.lastName || ""}`.trim()
									: user?.name || user?.email || "Utilisateur"}
							</p>
						</div>
					</div>
					<Link
						href="/account"
						className="block py-2 px-3 hover:bg-rose-light-2 rounded-md transition-colors duration-200 text-nude-dark hover:text-logo"
						onClick={() => setIsProfileOpen(false)}
					>
						Mon compte
					</Link>
					<Link
						href="/orders"
						className="block py-2 px-3 hover:bg-rose-light-2 rounded-md transition-colors duration-200 text-nude-dark hover:text-logo"
						onClick={() => setIsProfileOpen(false)}
					>
						Mes commandes
					</Link>
					<div className="border-t border-nude-light my-2"></div>
					<button
						className="block w-full text-left py-2 px-3 hover:bg-rose-light-2 rounded-md transition-colors duration-200 text-nude-dark hover:text-logo cursor-pointer"
						onClick={handleLogout}
					>
						Se déconnecter
					</button>
				</motion.div>
			)}

			<motion.div
				className="relative cursor-pointer"
				initial={{ scale: 0, opacity: 0, y: -20 }}
				animate={{ scale: 1, opacity: 1, y: 0 }}
				transition={{
					duration: 0.6,
					delay: 0.3,
					ease: [0.68, -0.55, 0.265, 1.55],
				}}
				whileTap={{ scale: 0.9 }}
			>
				<FaHeart
					className="text-xl cursor-pointer text-logo"
					onClick={() => setIsFavOpen(true)}
				/>
				{favorites.length > 0 && (
					<motion.div
						className="absolute -top-4 -right-4 w-6 h-6 bg-red-400 rounded-full text-white text-sm flex items-center justify-center"
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ duration: 0.3, delay: 0.1 }}
					>
						{favorites.length}
					</motion.div>
				)}
			</motion.div>

			<motion.div
				className="relative cursor-pointer"
				initial={{ scale: 0, opacity: 0, y: -20 }}
				animate={{ scale: 1, opacity: 1, y: 0 }}
				transition={{
					duration: 0.6,
					delay: 0.4,
					ease: [0.68, -0.55, 0.265, 1.55],
				}}
				whileTap={{ scale: 0.9 }}
			>
				<FaBagShopping
					className="text-xl mr-2 md:mr-0 cursor-pointer text-logo"
					data-cart-icon
					onClick={(e) => {
						e.stopPropagation();
						setIsCartOpen((prev) => !prev);
					}}
				/>
				{getCartCount() > 0 && (
					<motion.div
						className="absolute -top-4 -right-4 w-6 h-6 bg-red-400 rounded-full text-white text-sm flex items-center justify-center mr-2 md:mr-0"
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ duration: 0.3, delay: 0.1 }}
					>
						{getCartCount()}
					</motion.div>
				)}
				{isCartOpen && <CartModal onClose={() => setIsCartOpen(false)} />}
			</motion.div>

			{/* FavModal */}
			<FavModal isOpen={isFavOpen} onClose={() => setIsFavOpen(false)} />
		</motion.div>
	);
}
