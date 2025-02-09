"use client";
import { FC, ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface LayoutProps {
  children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();

  // Function to generate breadcrumb items dynamically
  const generateBreadcrumbItems = () => {
    if (!pathname) return [];

    const paths = pathname.split("/").filter(Boolean); // Split the pathname and remove empty strings
    const breadcrumbItems = [];

    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      const href = `/${paths.slice(0, i + 1).join("/")}`; // Generate the href for each breadcrumb item
      const isLast = i === paths.length - 1;

      breadcrumbItems.push(
        <BreadcrumbItem className=" uppercase" key={href}>
          {isLast ? (
            <BreadcrumbPage>{path}</BreadcrumbPage>
          ) : (
            <BreadcrumbLink href={href}>{path}</BreadcrumbLink>
          )}
        </BreadcrumbItem>
      );

      if (!isLast) {
        breadcrumbItems.push(<BreadcrumbSeparator key={`separator-${i}`} />);
      }
    }

    return breadcrumbItems;
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center w-full justify-between gap-2 px-4">
            <div className="flex items-center">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>{generateBreadcrumbItems()}</BreadcrumbList>
              </Breadcrumb>
            </div>
            <Link
              className={cn(
                buttonVariants({
                  variant: "outline",
                })
              )}
              href={"/"}
            >
              View Website
            </Link>
          </div>
        </header>
        <div className="">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
