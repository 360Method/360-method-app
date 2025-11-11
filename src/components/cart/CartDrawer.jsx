import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, X, ArrowRight, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function CartDrawer() {
  const [isOpen, setIsOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: cartItems = [] } = useQuery({
    queryKey: ['cartItems'],
    queryFn: async () => {
      const items = await base44.entities.CartItem.filter({ 
        status: 'in_cart',
        created_by: user?.email 
      });
      return items || [];
    },
    enabled: !!user,
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id) => base44.entities.CartItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
    },
  });

  const totalItems = cartItems.length;
  const totalEstimatedCost = cartItems.reduce((sum, item) => 
    sum + ((item.estimated_cost_min + item.estimated_cost_max) / 2 || 0), 
    0
  );

  return (
    <>
      {/* Floating Cart Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 md:bottom-4 md:right-4 z-40 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all"
        style={{ minHeight: '56px', minWidth: '56px' }}
      >
        <ShoppingCart className="w-6 h-6" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-full md:w-96 bg-white shadow-2xl z-[60] transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="border-b p-4 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="flex items-center gap-3 text-white">
            <ShoppingCart className="w-6 h-6" />
            <div>
              <h2 className="font-bold text-lg">Service Cart</h2>
              <p className="text-xs text-white/80">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            style={{ minHeight: '40px', minWidth: '40px' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="overflow-y-auto" style={{ height: 'calc(100vh - 200px)' }}>
          {totalItems === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="font-medium mb-2">Your cart is empty</p>
              <p className="text-sm">Add tasks, upgrades, or service requests to get started</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="border-2 rounded-lg p-3 hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.system_type && (
                          <Badge variant="outline" className="text-xs">
                            {item.system_type}
                          </Badge>
                        )}
                        {item.priority && (
                          <Badge 
                            className={`text-xs ${
                              item.priority === 'Emergency' || item.priority === 'High' 
                                ? 'bg-red-100 text-red-800' 
                                : item.priority === 'Medium'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {item.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteItemMutation.mutate(item.id)}
                      className="text-red-600 hover:bg-red-50 rounded p-1 transition-colors"
                      style={{ minHeight: '32px', minWidth: '32px' }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                    {item.description}
                  </p>
                  {(item.estimated_cost_min || item.estimated_cost_max) && (
                    <p className="text-sm font-medium text-indigo-600">
                      Est: ${item.estimated_cost_min?.toLocaleString() || '?'} - ${item.estimated_cost_max?.toLocaleString() || '?'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {totalItems > 0 && (
          <div className="border-t p-4 bg-gray-50">
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Estimated Total:</span>
                <span className="font-bold text-lg text-gray-900">
                  ${Math.round(totalEstimatedCost).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Final pricing after operator review
              </p>
            </div>
            <Link to={createPageUrl("CartReview")}>
              <Button
                className="w-full gap-2"
                style={{ backgroundColor: '#8B5CF6', minHeight: '48px' }}
                onClick={() => setIsOpen(false)}
              >
                Review & Submit Cart
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}