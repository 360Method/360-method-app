import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  LayoutDashboard, 
  Home, 
  Eye, 
  Zap, 
  TrendingUp,
  Search,
  ClipboardCheck,
  Activity,
  ListOrdered,
  Calendar,
  CheckCircle2,
  Shield,
  Lightbulb,
  Building2,
  Settings,
  Menu,
  Wrench
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "AWARE",
    icon: Eye,
    color: "text-blue-600",
    subItems: [
      { title: "Baseline", url: createPageUrl("Baseline"), icon: Search },
      { title: "Inspect", url: createPageUrl("Inspect"), icon: ClipboardCheck },
      { title: "Track", url: createPageUrl("Track"), icon: Activity },
    ]
  },
  {
    title: "ACT",
    icon: Zap,
    color: "text-orange-600",
    subItems: [
      { title: "Prioritize", url: createPageUrl("Prioritize"), icon: ListOrdered },
      { title: "Schedule", url: createPageUrl("Schedule"), icon: Calendar },
      { title: "Execute", url: createPageUrl("Execute"), icon: CheckCircle2 },
    ]
  },
  {
    title: "ADVANCE",
    icon: TrendingUp,
    color: "text-green-600",
    subItems: [
      { title: "Preserve", url: createPageUrl("Preserve"), icon: Shield },
      { title: "Upgrade", url: createPageUrl("Upgrade"), icon: Lightbulb },
      { title: "Scale", url: createPageUrl("Scale"), icon: Building2 },
    ]
  },
  {
    title: "Properties",
    url: createPageUrl("Properties"),
    icon: Home,
  },
  {
    title: "Services",
    url: createPageUrl("Services"),
    icon: Wrench,
  },
  {
    title: "Settings",
    url: createPageUrl("Settings"),
    icon: Settings,
  },
];

export default function Layout({ children }) {
  const location = useLocation();
  const [openSections, setOpenSections] = React.useState({
    AWARE: true,
    ACT: true,
    ADVANCE: true
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --primary: #1B365D;
          --secondary: #FF6B35;
          --accent: #28A745;
          --alert: #DC3545;
          --background: #FAFAF9;
        }
        
        /* CRITICAL: Solid background styling for all modals and popups */
        /* Applied system-wide to ensure readability and proper visual hierarchy */
        
        /* Modal Overlay - Dark semi-opaque background */
        [data-radix-dialog-overlay] {
          background-color: rgba(0, 0, 0, 0.75) !important;
          backdrop-filter: none !important;
        }
        
        /* Modal Content Card - Solid white background */
        [data-radix-dialog-content] {
          background-color: #FFFFFF !important;
          opacity: 1 !important;
          border-radius: 8px !important;
          box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15) !important;
          padding: 24px !important;
        }
        
        /* Ensure all dialog headers are solid white */
        [data-radix-dialog-content] [role="dialog"] > div:first-child,
        .dialog-header,
        [class*="DialogHeader"] {
          background-color: #FFFFFF !important;
          opacity: 1 !important;
        }
        
        /* Dialog title styling */
        [data-radix-dialog-title],
        .dialog-title,
        [class*="DialogTitle"] {
          color: #1B365D !important;
          font-size: 24px !important;
          font-weight: 700 !important;
          background-color: transparent !important;
        }
        
        /* Dialog body content */
        [data-radix-dialog-content] > div {
          background-color: #FFFFFF !important;
          opacity: 1 !important;
        }
        
        /* Form inputs in dialogs */
        [data-radix-dialog-content] input,
        [data-radix-dialog-content] textarea,
        [data-radix-dialog-content] select {
          background-color: #FFFFFF !important;
          border: 1px solid #CCCCCC !important;
          color: #333333 !important;
          opacity: 1 !important;
        }
        
        [data-radix-dialog-content] input:focus,
        [data-radix-dialog-content] textarea:focus,
        [data-radix-dialog-content] select:focus {
          border-color: #FF6B35 !important;
          outline: none !important;
        }
        
        /* Buttons in dialogs */
        [data-radix-dialog-content] button {
          opacity: 1 !important;
        }
        
        /* Select dropdowns */
        [data-radix-select-content] {
          background-color: #FFFFFF !important;
          opacity: 1 !important;
          border-radius: 8px !important;
          box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15) !important;
        }
        
        /* Popover content */
        [data-radix-popover-content] {
          background-color: #FFFFFF !important;
          opacity: 1 !important;
          border-radius: 8px !important;
          box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15) !important;
        }
        
        /* Dropdown menu content */
        [data-radix-dropdown-menu-content] {
          background-color: #FFFFFF !important;
          opacity: 1 !important;
          border-radius: 8px !important;
          box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15) !important;
        }
        
        /* Sheet/Sidebar overlays */
        [data-radix-sheet-overlay] {
          background-color: rgba(0, 0, 0, 0.75) !important;
        }
        
        [data-radix-sheet-content] {
          background-color: #FFFFFF !important;
          opacity: 1 !important;
        }
        
        /* Cards used as modals */
        .modal-card,
        .popup-card,
        .form-card {
          background-color: #FFFFFF !important;
          opacity: 1 !important;
          border-radius: 8px !important;
          box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15) !important;
        }
        
        /* Ensure no transparency on any modal/popup backgrounds */
        [role="dialog"],
        [role="alertdialog"],
        [data-state="open"][data-radix-dialog-content] {
          background-color: #FFFFFF !important;
          opacity: 1 !important;
        }
        
        /* Fix any glass morphism or backdrop blur */
        .backdrop-blur,
        [class*="backdrop-blur"] {
          backdrop-filter: none !important;
        }
        
        /* Ensure solid backgrounds for all form sections */
        form > div,
        .form-section,
        .form-group {
          background-color: #FFFFFF !important;
          opacity: 1 !important;
        }
      `}</style>
      <div className="min-h-screen flex w-full" style={{ backgroundColor: 'var(--background)' }}>
        <Sidebar className="border-r border-gray-200">
          <SidebarHeader className="border-b border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1B365D 0%, #2A4A7F 100%)' }}>
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">360° Method</h2>
                <p className="text-xs text-gray-500">Home Maintenance</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-2">
            <SidebarGroup>
              <SidebarMenu>
                {navigationItems.map((item) => {
                  if (item.subItems) {
                    return (
                      <Collapsible 
                        key={item.title}
                        open={openSections[item.title]}
                        onOpenChange={() => toggleSection(item.title)}
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton className="hover:bg-gray-100 transition-colors rounded-lg mb-1">
                              <item.icon className={`w-4 h-4 ${item.color}`} />
                              <span className="font-semibold">{item.title}</span>
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenu className="ml-4 mt-1">
                              {item.subItems.map((subItem) => (
                                <SidebarMenuItem key={subItem.title}>
                                  <SidebarMenuButton 
                                    asChild
                                    className={`hover:bg-gray-100 transition-colors rounded-lg ${
                                      location.pathname === subItem.url ? 'bg-gray-100 font-medium' : ''
                                    }`}
                                  >
                                    <Link to={subItem.url} className="flex items-center gap-2 px-3 py-2">
                                      <subItem.icon className="w-4 h-4 text-gray-500" />
                                      <span className="text-sm">{subItem.title}</span>
                                    </Link>
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                              ))}
                            </SidebarMenu>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    );
                  }
                  
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-gray-100 transition-colors rounded-lg mb-1 ${
                          location.pathname === item.url ? 'bg-gray-100 font-medium' : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
                          <item.icon className="w-4 h-4 text-gray-600" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-200 p-4">
            <div className="text-xs text-gray-500 text-center">
              <p className="font-medium text-gray-700 mb-1">Prevent Disasters</p>
              <p>Turn $50 problems into savings, not $15K emergencies</p>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b border-gray-200 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-gray-100 p-2 rounded-lg transition-colors">
                <Menu className="w-5 h-5" />
              </SidebarTrigger>
              <h1 className="text-lg font-semibold">360° Method</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}