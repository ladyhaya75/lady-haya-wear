import type { CartItem as CartItemType } from "@/stores/cartStore";
import { useCartStore } from "@/stores/cartStore";
import Image from "next/image";
import { memo, useCallback } from "react";
import { FiTrash2 } from "react-icons/fi";
import {
	OptimisticCartButton,
	OptimisticIndicator,
} from "../OptimisticFeedback/OptimisticFeedback";

interface CartItemProps {
	item: CartItemType;
	onUpdateQuantity: (id: string, quantity: number) => void;
	onRemove: (id: string) => void;
}

/**
 * Composant CartItem optimisé avec React.memo
 * Ne re-render que si item, onUpdateQuantity ou onRemove change
 */
const CartItem = memo(function CartItem({
	item,
	onUpdateQuantity,
	onRemove,
}: CartItemProps) {
	const isOptimistic = useCartStore((state) => state.isOptimistic(item.id));

	const handleIncrement = useCallback(() => {
		onUpdateQuantity(item.id, item.quantity + 1);
	}, [item.id, item.quantity, onUpdateQuantity]);

	const handleDecrement = useCallback(() => {
		onUpdateQuantity(item.id, item.quantity - 1);
	}, [item.id, item.quantity, onUpdateQuantity]);

	const handleRemove = useCallback(() => {
		onRemove(item.id);
	}, [item.id, onRemove]);

	return (
		<div className="relative flex gap-1.5 sm:gap-3 p-2 bg-white rounded-xl shadow-sm cursor-default">
			{/* Indicateur optimiste */}
			<OptimisticIndicator itemId={item.id} type="cart" />

			{/* Colonne 1: Image + Quantité */}
			<div className="flex flex-col gap-1">
				<Image
					src={item.image}
					alt={item.imageAlt || item.name}
					width={56}
					height={70}
					className="object-cover rounded-lg w-16 h-22 sm:w-20 sm:h-24"
				/>
				{/* Quantité sous l'image */}
				<div className="flex items-center gap-2 sm:gap-1 justify-center mt-1">
					<OptimisticCartButton
						itemId={item.id}
						onClick={handleDecrement}
						disabled={item.quantity <= 1 || isOptimistic}
						className="w-5 h-5 sm:w-5 sm:h-5 rounded-full ring-1 ring-nude-dark text-nude-dark hover:ring-rose-dark-2 hover:bg-rose-light hover:text-rose-dark-2 flex items-center justify-center transition-all duration-300 text-[10px] sm:text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
					>
						−
					</OptimisticCartButton>
					<span className="sm:text-xs font-medium text-nude-dark text-center">
						{item.quantity}
					</span>
					<OptimisticCartButton
						itemId={item.id}
						onClick={handleIncrement}
						disabled={item.quantity >= item.maxQuantity || isOptimistic}
						className="w-5 h-5 sm:w-5 sm:h-5 rounded-full ring-1 ring-nude-dark text-nude-dark hover:ring-rose-dark-2 hover:bg-rose-light hover:text-rose-dark-2 flex items-center justify-center transition-all duration-300 text-[10px] sm:text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
					>
						+
					</OptimisticCartButton>
				</div>
			</div>

			{/* Colonne 2: Informations */}
			<div className="flex-1 flex flex-col justify-between min-w-0">
				{/* Nom, détails et prix */}
				<div className="flex items-start justify-between gap-1.5">
					<div className="flex-1 min-w-0">
						{/* TITLE */}
						<h3 className="font-semibold text-base font-balqis text-nude-dark line-clamp-2">
							{item.name}
						</h3>
						{/* DESC directement sous le titre */}
						<div className="text-xs text-gray-500 mt-0.5">
							<div className="flex items-center gap-1">
								<div
									className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border border-gray-500"
									style={{ backgroundColor: item.colorHex }}
								/>
								<span className="truncate">{item.color}</span>
								<span>•</span>
								<span className="whitespace-nowrap">T. {item.size}</span>
							</div>
						</div>
					</div>
					{/* PRICE + BADGE */}
					<div className="flex flex-col items-end gap-1 flex-shrink-0">
						<div className="text-sm font-semibold text-logo whitespace-nowrap">
							{item.price.toFixed(2)}€
						</div>
						{item.promoPercentage && item.originalPrice && (
							<div className="flex items-center gap-1">
								<span className="text-gray-400 line-through text-[10px] sm:text-xs whitespace-nowrap">
									{item.originalPrice.toFixed(2)}€
								</span>
								<span className="bg-orange-400 text-white text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded whitespace-nowrap">
									-{item.promoPercentage}%
								</span>
							</div>
						)}
					</div>
				</div>

				{/* Supprimer aligné en bas */}
				<div className="flex justify-end">
					<OptimisticCartButton
						itemId={item.id}
						onClick={handleRemove}
						disabled={isOptimistic}
						className="p-0.5 sm:p-1 text-red-400 hover:text-red-600 transition-colors cursor-pointer"
					>
						<FiTrash2 className=" sm:text-lg" />
					</OptimisticCartButton>
				</div>
			</div>
		</div>
	);
});

export default CartItem;
