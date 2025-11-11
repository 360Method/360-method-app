import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, X, Trash2, Edit, ChevronRight, Image as ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import EditCartItemDialog from "./EditCartItemDialog";

export default function CartDrawer() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState(null);
  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: cartItems = [] } = useQuery({
    queryKey: ['cartItems'],
    queryFn: async () => {
      if (!user) return [];
      return base44.entities.CartItem.filter({ 
        created_by: user.email,
        status: 'in_cart'
      });
    },
    enabled: !!user,
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId) => base44.entities.CartItem.delete(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
    },
  });

  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowEditDialog(true);
  };

  const totalEstimatedCost = cartItems.reduce((sum, item) => {
    const midpoint = ((item.estimated_cost_min || 0) + (item.estimated_cost_max || 0)) / 2;
    return sum + midpoint;
  }, 0);

  return (
    <>
      {/* Floating Cart Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 md:bottom-6 right-6 bg-purple-600 text-white rounded-full p-4 shadow-lg hover:bg-purple-700 transition-all hover:scale-110 z-[60]"
        style={{ minHeight: '56px', minWidth: '56px' }}
      >
        <ShoppingCart className="w-6 h-6" />
        {cartItems.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {cartItems.length}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-[70] md:hidden"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl transform transition-transform duration-300 z-[80] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b bg-purple-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-purple-600" />
              <h2 className="font-bold text-lg" style={{ color: '#1B365D' }}>
                Service Cart ({cartItems.length})
              </h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
              style={{ minHeight: '40px', minWidth: '40px' }}
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cartItems.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ShoppingCart className="w-16 h-16 mx-auto mb-3 text-gray-400" />
                <p className="font-medium mb-2">Cart is Empty</p>
                <p className="text-sm">Add services to get started</p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="border-2 rounded-lg p-3 bg-white hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-2">{item.title}</h3>
                      <div className="flex items-center gap-1 flex-wrap">
                        {item.system_type && (
                          <Badge variant="outline" className="text-xs">
                            {item.system_type}
                          </Badge>
                        )}
                        {item.priority && (
                          <Badge 
                            className={`text-xs ${
                              item.priority === 'Emergency' || item.priority === 'High'
                                ? 'bg-red-600 text-white'
                                : item.priority === 'Medium'
                                ? 'bg-orange-600 text-white'
                                : 'bg-blue-600 text-white'
                            }`}
                          >
                            {item.priority}
                          </Badge>
                        )}
                        {item.photo_urls && item.photo_urls.length > 0 && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <ImageIcon className="w-3 h-3" />
                            {item.photo_urls.length}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {item.description}
                  </p>

                  {item.customer_notes && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-2">
                      <p className="text-xs text-gray-700 line-clamp-1">
                        📝 {item.customer_notes}
                      </p>
                    </div>
                  )}

                  {(item.estimated_cost_min || item.estimated_cost_max) && (
                    <p className="text-sm font-semibold text-purple-700 mb-2">
                      ${item.estimated_cost_min?.toLocaleString() || '?'} - ${item.estimated_cost_max?.toLocaleString() || '?'}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditItem(item)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                      style={{ minHeight: '40px' }}
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Remove this item from cart?')) {
                          deleteItemMutation.mutate(item.id);
                        }
                      }}
                      className="flex items-center justify-center px-3 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded transition-colors"
                      style={{ minHeight: '40px', minWidth: '40px' }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="p-4 border-t bg-gray-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">Estimated Total:</span>
                <span className="text-xl font-bold text-purple-700">
                  ${Math.round(totalEstimatedCost).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-600 text-center">
                ⚠️ Preliminary estimate. Final pricing after operator review.
              </p>
              <Link to={createPageUrl("CartReview")}>
                <Button
                  className="w-full gap-2"
                  style={{ backgroundColor: '#8B5CF6', minHeight: '48px' }}
                  onClick={() => setIsOpen(false)}
                >
                  Review & Submit Cart
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Edit Cart Item Dialog */}
      <EditCartItemDialog
        open={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setEditingItem(null);
        }}
        item={editingItem}
      />
    </>
  );
}