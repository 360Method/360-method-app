import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, X, Trash2, Edit, ChevronRight, Image as ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import EditCartItemDialog from "./EditCartItemDialog";
import ConfirmDialog from "../ui/confirm-dialog";

export default function CartDrawer() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState(null);
  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const [deletingItem, setDeletingItem] = React.useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
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

  // Lock body scroll when drawer is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowEditDialog(true);
  };

  const handleDeleteClick = (item) => {
    setDeletingItem(item);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingItem) {
      await deleteItemMutation.mutateAsync(deletingItem.id);
      setDeletingItem(null);
      setShowDeleteDialog(false);
    }
  };

  const totalEstimatedCost = cartItems.reduce((sum, item) => {
    const midpoint = ((item.estimated_cost_min || 0) + (item.estimated_cost_max || 0)) / 2;
    return sum + midpoint;
  }, 0);

  return (
    <>
      {/* Floating Cart Button - Always Visible */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[999]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-purple-600 text-white rounded-full shadow-2xl hover:bg-purple-700 transition-all hover:scale-110 active:scale-95"
          style={{ 
            minHeight: '64px', 
            minWidth: '64px',
            padding: '16px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Shopping Cart"
        >
          <ShoppingCart className="w-8 h-8" />
          {cartItems.length > 0 && (
            <span 
              className="absolute bg-red-500 text-white text-sm font-bold rounded-full min-w-[28px] h-7 flex items-center justify-center px-2 shadow-lg"
              style={{
                top: '-4px',
                right: '-4px',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            >
              {cartItems.length}
            </span>
          )}
        </button>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 z-[998]"
          style={{ 
            position: 'fixed',
            touchAction: 'none'
          }}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-0 z-[998] ${
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        <div
          className={`absolute top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl transform transition-transform duration-300 ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '100vh',
            maxHeight: '100dvh'
          }}
        >
          {/* Header - Fixed */}
          <div className="flex-shrink-0 p-4 border-b bg-purple-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-purple-600" />
              <h2 className="font-bold text-lg" style={{ color: '#1B365D' }}>
                Service Cart ({cartItems.length})
              </h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Cart Items - Scrollable Area */}
          <div 
            className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3"
            style={{
              WebkitOverflowScrolling: 'touch',
              overflowY: 'scroll',
              overscrollBehavior: 'contain',
              touchAction: 'pan-y',
              minHeight: 0
            }}
          >
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
                  {/* Compact Card Design */}
                  <div className="flex gap-3">
                    {/* Icon/Image */}
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center flex-shrink-0">
                      {item.photo_urls && item.photo_urls.length > 0 ? (
                        <img 
                          src={item.photo_urls[0]} 
                          alt={item.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-2xl">
                          {item.system_type === 'HVAC System' ? '❄️' :
                           item.system_type === 'Plumbing System' ? '🚰' :
                           item.system_type === 'Electrical System' ? '⚡' :
                           item.system_type === 'Roof System' ? '🏠' :
                           item.priority === 'Emergency' || item.priority === 'High' ? '⚠️' : '🔧'}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-1">{item.title}</h3>
                      <div className="flex items-center gap-1 mb-1">
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
                        {(item.estimated_cost_min && item.estimated_cost_max) && (
                          <span className="text-xs font-semibold text-purple-700">
                            ${Math.round((item.estimated_cost_min + item.estimated_cost_max) / 2).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleEditItem(item)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View details →
                      </button>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteClick(item)}
                      className="flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                      style={{ minHeight: '44px', minWidth: '44px' }}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer - Fixed */}
          {cartItems.length > 0 && (
            <div className="flex-shrink-0 p-4 border-t bg-gray-50 space-y-3">
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setDeletingItem(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Remove from Cart?"
        message={`Are you sure you want to remove "${deletingItem?.title}" from your cart? This action cannot be undone.`}
        confirmText="Yes, Remove"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  );
}