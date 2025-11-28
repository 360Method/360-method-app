/**
 * Shared Supabase client helper for Edge Functions
 * Replaces the @base44/sdk functionality
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers for all responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get Supabase URL and keys from environment
const getSupabaseUrl = () => Deno.env.get('SUPABASE_URL')!;
const getSupabaseAnonKey = () => Deno.env.get('SUPABASE_ANON_KEY')!;
const getSupabaseServiceKey = () => Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

/**
 * Creates a Supabase client from the request's authorization header
 * This client has the permissions of the authenticated user
 */
export function createClientFromRequest(req: Request): SupabaseClient {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader) {
    // Return anon client if no auth header
    return createClient(getSupabaseUrl(), getSupabaseAnonKey());
  }
  
  // Create client with user's JWT
  return createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });
}

/**
 * Creates a Supabase client with service role (admin) permissions
 * Use this for operations that need to bypass RLS
 */
export function createServiceClient(): SupabaseClient {
  return createClient(getSupabaseUrl(), getSupabaseServiceKey());
}

/**
 * Get the current authenticated user from the request
 */
export async function getCurrentUser(req: Request) {
  const supabase = createClientFromRequest(req);
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

/**
 * Helper to create entity wrappers similar to Base44's pattern
 */
export function createEntityHelper(supabase: SupabaseClient, tableName: string) {
  return {
    async list(orderBy: string = '-created_at') {
      const ascending = !orderBy.startsWith('-');
      const column = orderBy.replace('-', '');
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order(column, { ascending });
      if (error) throw error;
      return data || [];
    },
    
    async filter(conditions: Record<string, any>, orderBy: string = '-created_at') {
      const ascending = !orderBy.startsWith('-');
      const column = orderBy.replace('-', '');
      let query = supabase.from(tableName).select('*');
      
      Object.entries(conditions).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
      
      const { data, error } = await query.order(column, { ascending });
      if (error) throw error;
      return data || [];
    },
    
    async get(id: string) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    
    async create(record: Record<string, any>) {
      const { data, error } = await supabase
        .from(tableName)
        .insert(record)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    
    async update(id: string, updates: Record<string, any>) {
      const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    
    async delete(id: string) {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    }
  };
}

/**
 * Create all entity helpers for a client
 */
export function createEntities(supabase: SupabaseClient) {
  return {
    Property: createEntityHelper(supabase, 'properties'),
    SystemBaseline: createEntityHelper(supabase, 'system_baselines'),
    MaintenanceTask: createEntityHelper(supabase, 'maintenance_tasks'),
    Inspection: createEntityHelper(supabase, 'inspections'),
    Upgrade: createEntityHelper(supabase, 'upgrades'),
    CartItem: createEntityHelper(supabase, 'cart_items'),
    PreservationRecommendation: createEntityHelper(supabase, 'preservation_recommendations'),
    PortfolioEquity: createEntityHelper(supabase, 'portfolio_equity'),
    Operator: createEntityHelper(supabase, 'operators'),
    PropertyAccess: createEntityHelper(supabase, 'property_access'),
    UpgradeTemplate: createEntityHelper(supabase, 'upgrade_templates'),
    UserSecuritySettings: createEntityHelper(supabase, 'user_security_settings'),
    UserNotificationSettings: createEntityHelper(supabase, 'user_notification_settings'),
    NotificationPreference: createEntityHelper(supabase, 'notification_preferences'),
    Notification: createEntityHelper(supabase, 'notifications'),
    StrategicRecommendation: createEntityHelper(supabase, 'strategic_recommendations'),
    ServicePackage: createEntityHelper(supabase, 'service_packages'),
    OperatorStripeAccount: createEntityHelper(supabase, 'operator_stripe_accounts'),
    MaintenanceTemplate: createEntityHelper(supabase, 'maintenance_templates'),
    WealthProjection: createEntityHelper(supabase, 'wealth_projections'),
    Waitlist: createEntityHelper(supabase, 'waitlist'),
    PreservationImpact: createEntityHelper(supabase, 'preservation_impacts'),
    PortfolioBenchmark: createEntityHelper(supabase, 'portfolio_benchmarks'),
    CapitalAllocation: createEntityHelper(supabase, 'capital_allocations'),
    VideoTutorial: createEntityHelper(supabase, 'video_tutorials'),
    ServiceRequest: createEntityHelper(supabase, 'service_requests'),
    ResourceGuide: createEntityHelper(supabase, 'resource_guides'),
    Contractor: createEntityHelper(supabase, 'contractors'),
    ContractorJob: createEntityHelper(supabase, 'contractor_jobs'),
    PublicPropertyData: createEntityHelper(supabase, 'public_property_data'),
    RegionalCosts: createEntityHelper(supabase, 'regional_costs'),
    SystemLifespans: createEntityHelper(supabase, 'system_lifespans'),
    ContractorPricing: createEntityHelper(supabase, 'contractor_pricing'),
    UserSession: createEntityHelper(supabase, 'user_sessions'),
    LoginAttempt: createEntityHelper(supabase, 'login_attempts'),
    AuthEvent: createEntityHelper(supabase, 'auth_events'),
    JobQueue: createEntityHelper(supabase, 'job_queue'),
    PushSubscription: createEntityHelper(supabase, 'push_subscriptions'),
    PaymentMethod: createEntityHelper(supabase, 'payment_methods'),
    ScheduledTask: createEntityHelper(supabase, 'scheduled_tasks'),
    Job: createEntityHelper(supabase, 'jobs'),
    Transaction: createEntityHelper(supabase, 'transactions'),
    WebhookEvent: createEntityHelper(supabase, 'webhook_events'),
    PlatformSettings: createEntityHelper(supabase, 'platform_settings'),
    AccountLockout: createEntityHelper(supabase, 'account_lockouts'),
    User: createEntityHelper(supabase, 'users'),
    CanonicalProperty: createEntityHelper(supabase, 'canonical_properties'),
    UserProperty: createEntityHelper(supabase, 'user_properties'),
    RepairCost: createEntityHelper(supabase, 'repair_costs'),
    ComponentLifespan: createEntityHelper(supabase, 'component_lifespans'),
    MaintenanceReminder: createEntityHelper(supabase, 'maintenance_reminders'),
    RepairCostReference: createEntityHelper(supabase, 'repair_cost_references'),
  };
}

/**
 * Helper to invoke another Edge Function
 */
export async function invokeFunction(functionName: string, body: Record<string, any> = {}, authHeader?: string) {
  const supabaseUrl = getSupabaseUrl();
  const url = `${supabaseUrl}/functions/v1/${functionName}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (authHeader) {
    headers['Authorization'] = authHeader;
  } else {
    // Use service role key for server-to-server calls
    headers['Authorization'] = `Bearer ${getSupabaseServiceKey()}`;
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Function ${functionName} failed: ${response.status} - ${errorText}`);
  }
  
  return response.json();
}

/**
 * Main helper class that mimics the Base44 client interface
 */
export class SupabaseHelper {
  private userClient: SupabaseClient;
  private serviceClient: SupabaseClient;
  private authHeader?: string;
  
  constructor(req: Request) {
    this.authHeader = req.headers.get('Authorization') || undefined;
    this.userClient = createClientFromRequest(req);
    this.serviceClient = createServiceClient();
  }
  
  // Auth helper
  auth = {
    me: async () => {
      const { data: { user }, error } = await this.userClient.auth.getUser();
      if (error || !user) return null;
      return user;
    },
    
    updateMe: async (updates: Record<string, any>) => {
      const { data, error } = await this.userClient.auth.updateUser({
        data: updates
      });
      if (error) throw error;
      return data.user;
    }
  };
  
  // Entity helpers with user permissions
  entities = createEntities(this.userClient);
  
  // Service role (admin) helpers
  asServiceRole = {
    entities: createEntities(this.serviceClient),
    
    functions: {
      invoke: (functionName: string, body: Record<string, any> = {}) => 
        invokeFunction(functionName, body)
    }
  };
  
  // Functions helper
  functions = {
    invoke: (functionName: string, body: Record<string, any> = {}) => 
      invokeFunction(functionName, body, this.authHeader)
  };
}

/**
 * Factory function to create the helper from a request
 * This is the main replacement for createClientFromRequest from @base44/sdk
 */
export function createHelperFromRequest(req: Request): SupabaseHelper {
  return new SupabaseHelper(req);
}

// Export for convenience
export { createClient };

