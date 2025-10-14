"use client";

import * as React from "react";
import {
  Building,
  Home,
  Users,
  FileText,
  Settings,
  MapPin,
  Briefcase,
  LayoutDashboard,
  MessageSquare,
  ClipboardList,
  DollarSign,
  Building2,
  Globe,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
import { useRBAC } from "@/hooks/useRBAC";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { canViewAgentTab, canViewDocuments, canManageSettings } = useRBAC();

  // Build navigation based on user role
  const navItems = React.useMemo(() => {
    const items = [
      {
        title: "Dashboard",
        url: "#",
        icon: LayoutDashboard,
        items: [
          {
            title: "Overview",
            url: "/dashboard/overview",
          },
        ],
      },
      {
        title: "Properties",
        url: "#",
        icon: Home,
        isActive: true,
        items: [
          {
            title: "All Properties",
            url: "/dashboard/properties",
          },
          {
            title: "Create Property",
            url: "/dashboard/properties/create",
          },
        ],
      },
    ];

    // Add Employees section for ADMIN and SUPERADMIN only
    if (canViewAgentTab) {
      items.push({
        title: "Employees",
        url: "#",
        icon: Users,
        items: [
          {
            title: "All Employees",
            url: "/dashboard/employees",
          },
          {
            title: "Create Employee",
            url: "/dashboard/employees/create",
          },
        ],
      });
    }

    // Add CRM / Leads for EMPLOYEE, ADMIN, SUPERADMIN
    if (canViewDocuments) {
      items.push({
        title: "CRM & Leads",
        url: "#",
        icon: ClipboardList,
        items: [
          {
            title: "All Leads",
            url: "/dashboard/leads",
          },
          {
            title: "My Leads",
            url: "/dashboard/leads/my-leads",
          },
          {
            title: "Lead Analytics",
            url: "/dashboard/leads/analytics",
          },
        ],
      });
    }

    // Add Transactions for EMPLOYEE, ADMIN, SUPERADMIN
    if (canViewDocuments) {
      items.push({
        title: "Transactions",
        url: "#",
        icon: DollarSign,
        items: [
          {
            title: "All Transactions",
            url: "/dashboard/transactions",
          },
          {
            title: "Create Transaction",
            url: "/dashboard/transactions/create",
          },
        ],
      });
    }

    // Add Messages for all authenticated users
    items.push({
      title: "Messages",
      url: "#",
      icon: MessageSquare,
      items: [
        {
          title: "Inbox",
          url: "/dashboard/messages",
        },
        {
          title: "Sent",
          url: "/dashboard/messages/sent",
        },
      ],
    });

    // Add Locations/Areas for ADMIN and SUPERADMIN
    if (canViewAgentTab) {
      items.push({
        title: "Locations",
        url: "#",
        icon: MapPin,
        items: [
          {
            title: "Countries",
            url: "/dashboard/countries",
          },
          {
            title: "Areas",
            url: "/dashboard/areas",
          },
        ],
      });
    }

    // Add Company for ADMIN and SUPERADMIN
    if (canManageSettings) {
      items.push({
        title: "Company",
        url: "#",
        icon: Building2,
        items: [
          {
            title: "Company Profile",
            url: "/dashboard/company",
          },
          {
            title: "Statistics",
            url: "/dashboard/company/stats",
          },
        ],
      });
    }

    // Add Settings with role-based sub-items
    const settingsItems = [
      {
        title: "Profile",
        url: "/dashboard/settings/profile",
      },
    ];

    if (canManageSettings) {
      settingsItems.push({
        title: "System Settings",
        url: "/dashboard/settings/system",
      });
    }

    items.push({
      title: "Settings",
      url: "#",
      icon: Settings,
      items: settingsItems,
    });

    return items;
  }, [canViewAgentTab, canViewDocuments, canManageSettings]);

  const projects = [
    {
      name: "Investment Properties",
      url: "#",
      icon: Briefcase,
    },
    {
      name: "Luxury Homes",
      url: "#",
      icon: Home,
    },
  ];

  return (
    <Sidebar className="sticky" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenuButton>
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Building className="size-4" />
          </div>
          <div className="grid flex-1 text-sm leading-tight">
            <span className="truncate font-semibold">Real Estate</span>
            <span className="truncate text-xs">Dashboard</span>
          </div>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        <NavProjects projects={projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
