import NextAuth from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    role: string; // Ensure this matches your `$Enums.Role` type
  }
  interface Session {
    user: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface JWT {
    id: string;
  }
}
