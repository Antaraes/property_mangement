import SignupForm from "@/components/form/SignupForm";

import { Metadata } from "next";
import { FC } from "react";

export const metadata: Metadata = {
  title: "House - Sign Up",
  description: "Create your account",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

interface pageProps {}

const page: FC<pageProps> = ({}) => {
  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <SignupForm />
      </div>
    </div>
  );
};

export default page;
