import { memo, useCallback } from 'react';
import Image from 'next/image';
import { FiTrash2 } from 'react-icons/fi';
import type { CartItem as CartItemType } from '@/stores/cartStore';
import { useCartStore } from '@/stores/cartStore';
import { OptimisticIndicator, OptimisticCartButton } from '../OptimisticFeedback/OptimisticFeedback';

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
    <div className="relative flex gap-4 p-3 bg-white rounded-xl shadow-sm cursor-default">
      {/* Indicateur optimiste */}
      <OptimisticIndicator itemId={item.id} type="cart" />
      <Image
        src={item.image}
        alt={item.imageAlt || item.name}
        width={80}
        height={96}
        className="object-cover rounded-lg"
      />
      <div className="flex flex-col justify-between w-full">
        {/* TOP */}
        <div>
          {/* TITLE */}
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-semibold text-sm text-nude-dark line-clamp-2">
              {item.name}
            </h3>
            <div className="text-sm font-semibold text-logo">
              {item.originalPrice && item.originalPrice < item.price ? (
                <span className="line-through text-gray-400 mr-1">
                  {item.originalPrice.toFixed(2)}€
                </span>
              ) : null}
              {item.price.toFixed(2)}€
            </div>
          </div>
          
          {/* DESC */}
          <div className="text-xs text-gray-500 mt-1">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full border border-gray-300"
                style={{ backgroundColor: item.colorHex }}
              />
              <span>{item.color}</span>
              <span>•</span>
              <span>Taille {item.size}</span>
            </div>
          </div>
        </div>
        
        {/* BOTTOM */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <OptimisticCartButton
              itemId={item.id}
              onClick={handleDecrement}
              disabled={item.quantity <= 1 || isOptimistic}
              className="w-6 h-6 rounded-full ring-1 ring-nude-dark text-nude-dark hover:ring-rose-dark-2 hover:bg-rose-light hover:text-rose-dark-2 flex items-center justify-center transition-all duration-300 text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              −
            </OptimisticCartButton>
            <span className="text-sm font-medium text-nude-dark min-w-[20px] text-center">
              {item.quantity}
            </span>
            <OptimisticCartButton
              itemId={item.id}
              onClick={handleIncrement}
              disabled={item.quantity >= item.maxQuantity || isOptimistic}
              className="w-6 h-6 rounded-full ring-1 ring-nude-dark text-nude-dark hover:ring-rose-dark-2 hover:bg-rose-light hover:text-rose-dark-2 flex items-center justify-center transition-all duration-300 text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </OptimisticCartButton>
          </div>
          <OptimisticCartButton
            itemId={item.id}
            onClick={handleRemove}
            disabled={isOptimistic}
            className="p-1 text-red-400 hover:text-red-600 transition-colors cursor-pointer"
          >
            <FiTrash2 className="w-3 h-3" />
          </OptimisticCartButton>
        </div>
      </div>
    </div>
  );
});

export default CartItem;

