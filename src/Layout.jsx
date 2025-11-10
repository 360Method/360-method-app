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
  Timeline,
  ListOrdered,
  Calendar,
  CheckCircle2,
  Shield,
  Lightbulb,
  Building2,
  Settings,
  Menu
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
      { title: "Track", url: createPageUrl("Track"), icon: Timeline },
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