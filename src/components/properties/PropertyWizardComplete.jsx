import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Home, ClipboardCheck, Calendar, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { CartItem } from "@/api/supabaseClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function PropertyWizardComplete({ property, onComplete }) {
  const [addedToCart, setAddedToCart] = React.useState(false);
  const queryClient = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: async (cartItem) => {
      return CartItem.create(cartItem);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    },
  });

  const handleAddProfessionalBaseline = async () => {
    const cartItem = {
      property_id: property.id,
      source_type: 'custom',
      title: 'Professional Baseline Assessment',
      description: `Complete professional documentation of all home systems for ${property.address}. Includes photos, condition assessments, and digital records for all major systems (HVAC, Plumbing, Electrical, Roof, Foundation, etc.)`,
      system_type: 'General',
      priority: 'Medium',
      photo_urls: [],
      estimated_hours: 3,
      estimated_cost_min: 300,
      estimated_cost_max: 500,
      customer_notes: 'Professional baseline assessment requested during property setup',
      preferred_timeline: 'Within 2 weeks',
      status: 'in_cart'
    };

    await addToCartMutation.mutateAsync(cartItem);
  };

  return (
    <>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '28px' }}>
            ✓ Property Added Successfully!
          </h2>
        </div>

        <Card className="border-2 mobile-card mb-6" style={{ borderColor: '#28A745', backgroundColor: '#F0FFF4' }}>
          <CardContent className="p-6">
            <h3 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '20px' }}>
              {property.address}
            </h3>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <p><strong>Property Type:</strong> {property.property_type}</p>
              <p><strong>Doors:</strong> {property.door_count}</p>
              <p><strong>Climate Zone:</strong> {property.climate_zone}</p>
              <p><strong>Year Built:</strong> {property.year_built}</p>
              <p><strong>Square Footage:</strong> {property.square_footage?.toLocaleString()} sq ft</p>
              {property.stories && <p><strong>Stories:</strong> {property.stories}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 mobile-card mb-6" style={{ borderColor: '#FF6B35' }}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl">🎯</div>
              <h3 className="font-bold" style={{ color: '#1B365D', fontSize: '20px' }}>
                WHAT'S NEXT: Document Your Systems
              </h3>
            </div>

            <p className="text-gray-700 mb-4" style={{ fontSize: '16px', lineHeight: '1.5' }}>
              Your next step is the <strong>BASELINE</strong> - documenting all the major systems in your home. 
              This is the foundation of the 360° Method.
            </p>

            <p className="text-gray-700 mb-4">
              <strong>Time required:</strong> 2-3 hours (can be done in multiple sessions)
            </p>

            <div className="mb-4">
              <p className="font-semibold mb-2" style={{ color: '#1B365D' }}>
                You'll document:
              </p>
              <ul className="text-gray-700 space-y-1 ml-4">
                <li>✓ What systems you have (brand, model, age)</li>
                <li>✓ Current condition of each system</li>
                <li>✓ Photos for comparison over time</li>
                <li>✓ Maintenance history if known</li>
              </ul>
            </div>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <p className="text-sm font-semibold mb-2" style={{ color: '#1B365D' }}>
                  Once you complete 4 of 6 required systems, you'll unlock:
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✓ Seasonal inspection checklists</li>
                  <li>✓ Priority task management</li>
                  <li>✓ Maintenance scheduling</li>
                  <li>✓ Cost tracking</li>
                </ul>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        <Card className="border-2 mobile-card mb-6" style={{ borderColor: '#1B365D' }}>
          <CardContent className="p-6">
            <h3 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '20px' }}>
              CHOOSE YOUR PATH:
            </h3>

            <div className="space-y-3">
              <Button
                asChild
                className="w-full font-bold"
                style={{ backgroundColor: '#28A745', minHeight: '56px' }}
              >
                <Link to={createPageUrl("Baseline") + `?property=${property.id}`}>
                  <ClipboardCheck className="w-5 h-5 mr-2" />
                  Start Baseline Now
                </Link>
              </Button>

              <Button
                onClick={handleAddProfessionalBaseline}
                disabled={addToCartMutation.isPending || addedToCart}
                variant="outline"
                className="w-full font-bold"
                style={{ 
                  borderColor: addedToCart ? '#28A745' : '#28A745', 
                  color: addedToCart ? '#28A745' : '#28A745',
                  backgroundColor: addedToCart ? '#F0FFF4' : 'transparent',
                  minHeight: '56px' 
                }}
              >
                {addedToCart ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Added to Cart!
                  </>
                ) : addToCartMutation.isPending ? (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Adding to Cart...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add Professional Baseline to Cart
                  </>
                )}
              </Button>

              <Button
                onClick={onComplete}
                variant="outline"
                className="w-full"
                style={{ minHeight: '56px' }}
              >
                I'll Do This Later
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-2 border-blue-200">
          <CardContent className="p-6">
            <p className="text-sm font-semibold mb-2" style={{ color: '#1B365D' }}>
              💡 PRO TIP:
            </p>
            <p className="text-sm text-gray-700 mb-3">
              Block 2-3 hours this weekend to complete your baseline. Having a complete property profile 
              unlocks the full power of the 360° Method and helps prevent expensive surprises.
            </p>
            <p className="text-sm text-gray-700">
              <strong>Most users who complete baseline in first week save $2,000+ in the first year</strong> by 
              catching problems early.
            </p>
          </CardContent>
        </Card>
      </div>

    </>
  );
}