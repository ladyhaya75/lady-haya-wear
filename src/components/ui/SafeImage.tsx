"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface SafeImageProps {
	src: string | null | undefined;
	alt: string;
	fill?: boolean;
	width?: number;
	height?: number;
	sizes?: string;
	className?: string;
	priority?: boolean;
	loading?: "lazy" | "eager";
	placeholder?: "blur" | "empty";
	blurDataURL?: string;
	fallback?: string;
	protected?: boolean; // Nouvelle option pour activer la protection
}

export default function SafeImage({
	src,
	alt,
	fill = false,
	width,
	height,
	sizes,
	className = "",
	priority = false,
	loading = "lazy",
	placeholder = "empty",
	blurDataURL,
	fallback = "/assets/placeholder.jpg",
	protected: isProtected = false,
}: SafeImageProps) {
	const [imageError, setImageError] = useState(false);
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	// Si pas de source, afficher le fallback
	if (!src) {
		return (
			<div
				className={`relative bg-gradient-to-br from-nude-light to-rose-light-2 flex items-center justify-center ${className}`}
			>
				{fill ? (
					<>
						<span className="text-4xl">🛍️</span>
						<div className="absolute inset-0 bg-black/10 rounded-2xl" />
					</>
				) : (
					<span className="text-2xl">🛍️</span>
				)}
			</div>
		);
	}

	// Pendant l'hydratation, afficher le fallback pour éviter les différences SSR/Client
	if (!isMounted) {
		return (
			<div
				className={`relative bg-gradient-to-br from-nude-light to-rose-light-2 flex items-center justify-center ${className}`}
			>
				{fill ? (
					<>
						<span className="text-4xl">🛍️</span>
						<div className="absolute inset-0 bg-black/10 rounded-2xl" />
					</>
				) : (
					<span className="text-2xl">🛍️</span>
				)}
			</div>
		);
	}

	// Si erreur après le montage, afficher le fallback
	if (imageError) {
		return (
			<div
				className={`relative bg-gradient-to-br from-nude-light to-rose-light-2 flex items-center justify-center ${className}`}
			>
				{fill ? (
					<>
						<span className="text-4xl">🛍️</span>
						<div className="absolute inset-0 bg-black/10 rounded-2xl" />
					</>
				) : (
					<span className="text-2xl">🛍️</span>
				)}
			</div>
		);
	}

	const imageElement = (
		<Image
			src={src}
			alt={alt}
			fill={fill}
			width={!fill ? width : undefined}
			height={!fill ? height : undefined}
			sizes={sizes}
			className={className}
			priority={priority}
			loading={priority ? undefined : loading}
			placeholder={placeholder}
			blurDataURL={blurDataURL}
			onError={() => {
				setImageError(true);
			}}
			// Configuration pour améliorer la fiabilité
			unoptimized={false}
			quality={90}
		/>
	);

	// Si pas de protection, retourner l'image directement
	if (!isProtected) {
		return imageElement;
	}

	// Si protection activée, wrapper dans un conteneur protégé
	return (
		<div
			className="relative"
			onContextMenu={(e) => {
				e.preventDefault();
				e.stopPropagation();
				return false;
			}}
			onDragStart={(e) => {
				e.preventDefault();
				e.stopPropagation();
				return false;
			}}
			style={{
				userSelect: "none",
				MozUserSelect: "none",
				WebkitUserSelect: "none",
				WebkitTouchCallout: "none",
			}}
			data-protected="true"
		>
			{imageElement}
		</div>
	);
}
