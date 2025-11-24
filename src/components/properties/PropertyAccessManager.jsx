import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Plus,
  X,
  Mail,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';

const ROLE_CONFIG = {
  'Owner': { color: 'bg-purple-100 text-purple-700', icon: Shield },
  'Operator': { color: 'bg-blue-100 text-blue-700', icon: Users },
  'Contractor': { color: 'bg-orange-100 text-orange-700', icon: Users },
  'Viewer': { color: 'bg-gray-100 text-gray-700', icon: Users }
};

const STATUS_CONFIG = {
  'active': { label: 'Active', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  'invited': { label: 'Invited', color: 'bg-yellow-100 text-yellow-700', icon: Mail },
  'pending': { label: 'Pending', color: 'bg-blue-100 text-blue-700', icon: Clock },
  'removed': { label: 'Removed', color: 'bg-red-100 text-red-700', icon: AlertCircle }
};

export default function PropertyAccessManager({ property, currentUserRole }) {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteData, setInviteData] = useState({ email: '', role: 'Viewer' });

  const queryClient = useQueryClient();

  const { data: accessList = [] } = useQuery({
    queryKey: ['propertyAccess', property.id],
    queryFn: async () => {
      const list = await base44.entities.PropertyAccess.filter({
        property_id: property.id,
        status: { $in: ['active', 'invited', 'pending'] }
      });
      return list.sort((a, b) => {
        const roleOrder = { Owner: 0, Operator: 1, Contractor: 2, Viewer: 3 };
        return roleOrder[a.role] - roleOrder[b.role];
      });
    }
  });

  const inviteUserMutation = useMutation({
    mutationFn: async (data) => {
      const invitationToken = Math.random().toString(36).substring(2, 15);
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 7);

      const permissions = getDefaultPermissions(data.role);

      const user = await base44.auth.me();

      return base44.entities.PropertyAccess.create({
        property_id: property.id,
        user_email: data.email,
        role: data.role,
        permissions,
        status: 'invited',
        invited_by: user.email,
        invitation_token: invitationToken,
        invitation_expires: expirationDate.toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propertyAccess', property.id] });
      toast.success('Invitation sent successfully');
      setShowInviteDialog(false);
      setInviteData({ email: '', role: 'Viewer' });
    }
  });

  const removeAccessMutation = useMutation({
    mutationFn: async (accessId) => {
      const user = await base44.auth.me();
      return base44.entities.PropertyAccess.update(accessId, {
        status: 'removed',
        removed_date: new Date().toISOString(),
        removed_by: user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propertyAccess', property.id] });
      toast.success('Access removed');
    }
  });

  const handleInvite = () => {
    if (!inviteData.email) {
      toast.error('Please enter an email address');
      return;
    }
    inviteUserMutation.mutate(inviteData);
  };

  const handleRemove = (access) => {
    if (access.role === 'Owner' && currentUserRole !== 'Owner') {
      toast.error('Only owners can remove other owners');
      return;
    }
    if (window.confirm(`Remove ${access.user_email}'s access to this property?`)) {
      removeAccessMutation.mutate(access.id);
    }
  };

  const canInvite = currentUserRole === 'Owner' || currentUserRole === 'Operator';
  const canRemove = (access) => {
    if (currentUserRole === 'Owner') return access.role !== 'Owner';
    if (currentUserRole === 'Operator') return access.role === 'Contractor' || access.role === 'Viewer';
    return false;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Property Access
        </h2>
        {canInvite && (
          <Button onClick={() => setShowInviteDialog(true)} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Invite User
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {accessList.map(access => {
          const roleConfig = ROLE_CONFIG[access.role];
          const statusConfig = STATUS_CONFIG[access.status];
          const RoleIcon = roleConfig.icon;
          const StatusIcon = statusConfig.icon;

          return (
            <div key={access.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">{access.user_email}</span>
                  <Badge className={roleConfig.color}>
                    <RoleIcon className="w-3 h-3 mr-1" />
                    {access.role}
                  </Badge>
                  <Badge className={statusConfig.color}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                </div>
                {access.accepted_date && (
                  <div className="text-xs text-gray-500">
                    Connected {new Date(access.accepted_date).toLocaleDateString()}
                  </div>
                )}
                {access.status === 'invited' && (
                  <div className="text-xs text-yellow-600">
                    Invitation expires {new Date(access.invitation_expires).toLocaleDateString()}
                  </div>
                )}
              </div>
              {canRemove(access) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(access)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <Input
                type="email"
                value={inviteData.email}
                onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Role
              </label>
              <select
                value={inviteData.role}
                onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                {currentUserRole === 'Owner' && (
                  <>
                    <option value="Operator">Operator</option>
                    <option value="Viewer">Viewer</option>
                  </>
                )}
                {currentUserRole === 'Operator' && (
                  <>
                    <option value="Contractor">Contractor</option>
                    <option value="Viewer">Viewer</option>
                  </>
                )}
              </select>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm text-blue-900">
                {getPermissionDescription(inviteData.role)}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleInvite}
                disabled={inviteUserMutation.isPending}
                className="flex-1"
              >
                {inviteUserMutation.isPending ? 'Sending...' : 'Send Invitation'}
              </Button>
              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function getDefaultPermissions(role) {
  const permissions = {
    Owner: {
      view_dashboard: true,
      view_full_inspection: true,
      edit_property: true,
      create_inspection: true,
      create_work_order: true,
      assign_contractor: false,
      view_financials: true,
      make_payment: true,
      manage_access: true
    },
    Operator: {
      view_dashboard: true,
      view_full_inspection: true,
      edit_property: true,
      create_inspection: true,
      create_work_order: true,
      assign_contractor: true,
      view_financials: true,
      make_payment: false,
      manage_access: false
    },
    Contractor: {
      view_dashboard: false,
      view_full_inspection: false,
      edit_property: false,
      create_inspection: false,
      create_work_order: false,
      assign_contractor: false,
      view_financials: false,
      make_payment: false,
      manage_access: false
    },
    Viewer: {
      view_dashboard: true,
      view_full_inspection: false,
      edit_property: false,
      create_inspection: false,
      create_work_order: false,
      assign_contractor: false,
      view_financials: false,
      make_payment: false,
      manage_access: false
    }
  };
  return permissions[role] || permissions.Viewer;
}

function getPermissionDescription(role) {
  const descriptions = {
    Owner: 'Full access to all property features including management, financials, and user access control.',
    Operator: 'Can view, edit, and manage property maintenance, inspections, and work orders. Cannot manage user access or make payments.',
    Contractor: 'Limited access to assigned work orders only. Cannot view full property data.',
    Viewer: 'Read-only access to property dashboard. Cannot make changes or view financial information.'
  };
  return descriptions[role] || '';
}