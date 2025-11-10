import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, User, LogOut } from "lucide-react";

export default function Settings() {
  const [user, setUser] = React.useState(null);
  const [formData, setFormData] = React.useState({
    full_name: "",
    email: ""
  });

  React.useEffect(() => {
    base44.auth.me().then(userData => {
      setUser(userData);
      setFormData({
        full_name: userData.full_name || "",
        email: userData.email || ""
      });
    }).catch(() => {});
  }, []);

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      alert('Profile updated successfully!');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate({ full_name: formData.full_name });
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account and preferences</p>
        </div>

        {/* Profile Settings */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Your full name"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              {user && (
                <div>
                  <Label>Account Type</Label>
                  <Input
                    value={user.role === 'admin' ? 'Admin' : 'User'}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* App Information */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              About 360° Method
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">The 360° Method</h4>
              <p className="text-sm text-gray-600">
                A proven 3-phase system that transforms homeowners from reactive to proactive:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                <li><span className="font-medium">AWARE:</span> Understand your home through baseline documentation, seasonal inspections, and comprehensive tracking</li>
                <li><span className="font-medium">ACT:</span> Take systematic action by prioritizing issues, scheduling maintenance, and executing efficiently</li>
                <li><span className="font-medium">ADVANCE:</span> Preserve and improve value through predictive maintenance, strategic upgrades, and portfolio scaling</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">💡 Prevention Philosophy:</span> Turn $50 problems into savings, not $15,000 disasters. 
                By staying proactive, you prevent small issues from cascading into major emergencies.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">Sign Out</h4>
                <p className="text-sm text-gray-600">Sign out of your account</p>
              </div>
              <Button onClick={handleLogout} variant="outline" className="gap-2">
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}