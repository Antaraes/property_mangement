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
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
// import { NavUser } from "@/components/nav-user";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";

// Real estate-related sidebar data
const data = {
  navMain: [
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
          title: "For Sale",
          url: "/dashboard/properties/sale",
        },
        {
          title: "For Rent",
          url: "/dashboard/properties/rent",
        },
      ],
    },
    {
      title: "Agents",
      url: "#",
      icon: Users,
      items: [
        {
          title: "All Agents",
          url: "/dashboard/agents",
        },
        {
          title: "Top Rated",
          url: "/dashboard/agents/top-rated",
        },
      ],
    },
    {
      title: "Documents",
      url: "#",
      icon: FileText,
      items: [
        {
          title: "Contracts",
          url: "/dashboard/documents/contracts",
        },
        {
          title: "Agreements",
          url: "/dashboard/documents/agreements",
        },
      ],
    },
    {
      title: "Locations",
      url: "#",
      icon: MapPin,
      items: [
        {
          title: "City Listings",
          url: "/dashboard/locations/cities",
        },
        {
          title: "Neighborhoods",
          url: "/dashboard/locations/neighborhoods",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
      items: [
        {
          title: "Profile",
          url: "/dashboard/settings/profile",
        },
        {
          title: "Billing",
          url: "/dashboard/settings/billing",
        },
      ],
    },
  ],
  projects: [
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
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        {" "}
        <NavUser />{" "}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
