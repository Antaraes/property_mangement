"use client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { HouseIcon, Menu } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Reusable NavLink Component
const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  console.log(pathname);

  return (
    <Link
      href={href}
      className={`block py-2 px-4 rounded-md font-medium text-xs transition-colors ${
        isActive ? "bg-primary text-white" : "hover:bg-muted text-primary"
      }`}
    >
      {children}
    </Link>
  );
};

const Navbar = () => {
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/properties", label: "Properties" },
    { href: "/projects", label: "Our Projects" },
    { href: "/faqs", label: "FAQs" },
    { href: "/aboutUs", label: "About Us" },
  ];

  return (
    <Card className="container  bg-card border-0 py-3 px-4 sticky z-50 top-0 inset-x-0 h-16 flex items-center rounded-none justify-between  gap-6 ">
      <ul className="hidden lg:flex items-center gap-3 text-card-foreground">
        {navLinks.map((link) => (
          <NavLink key={link.href} href={link.href}>
            {link.label}
          </NavLink>
        ))}
      </ul>

      <div className="lg:absolute lg:left-1/2 md:transform lg:-translate-x-1/2 flex items-center">
        <HouseIcon className="h-6 w-6" />
        <h1 className="text-lg font-bold ml-2">House</h1>
      </div>

      <div className="flex items-center">
        <Button variant="secondary" className="hidden lg:block px-2">
          Login
        </Button>
        <Button className="hidden lg:block ml-2 mr-2">Get Started</Button>

        {/* Mobile Menu */}
        <div className="flex lg:hidden items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Menu className=" cursor-pointer h-5 w-5" />
            </SheetTrigger>

            <SheetContent side="left" className="w-64">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 text-sm mt-6">
                {navLinks.map((link) => (
                  <NavLink key={link.href} href={link.href}>
                    {link.label}
                  </NavLink>
                ))}
              </nav>

              <div className="mt-6 flex flex-col gap-3">
                <Button variant="secondary" className="w-full">
                  Login
                </Button>
                <Button className="w-full">Get Started</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </Card>
  );
};

export default Navbar;
