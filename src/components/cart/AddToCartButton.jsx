import React from "react";
import { CartItem } from "@/api/supabaseClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check } from "lucide-react";

export default function AddToCartButton({ 
  item,
  size = "default",
  variant = "default",
  className = ""
}) {
  const [added, setAdded] = React.useState(false);
  const queryClient = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: async (cartItem) => {
      return CartItem.create(cartItem);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    },
  });

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    
    const cartItem = {
      property_id: item.property_id,
      source_type: item.source_type || 'custom',
      source_id: item.source_id || item.id,
      title: item.title,
      description: item.description,
      system_type: item.system_type,
      priority: item.priority || 'Medium',
      photo_urls: item.photo_urls || [],
      estimated_hours: item.estimated_hours,
      estimated_cost_min: item.estimated_cost_min || item.current_fix_cost,
      estimated_cost_max: item.estimated_cost_max || item.delayed_fix_cost,
      customer_notes: item.customer_notes || '',
      status: 'in_cart'
    };

    await addToCartMutation.mutateAsync(cartItem);
  };

  if (added) {
    return (
      <Button
        size={size}
        variant="outline"
        className={`gap-2 ${className}`}
        disabled
        style={{ minHeight: '44px' }}
      >
        <Check className="w-4 h-4 text-green-600" />
        Added!
      </Button>
    );
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={addToCartMutation.isPending}
      size={size}
      variant={variant}
      className={`gap-2 ${className}`}
      style={{ minHeight: '44px' }}
    >
      <ShoppingCart className="w-4 h-4" />
      {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
    </Button>
  );
}