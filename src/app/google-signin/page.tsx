"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";

const SignInPage = () => {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      void signIn("google");
    }

    if (status === "authenticated" && session) {
      if (window.opener) {
        window.opener.location.href = "/dashboard/properties";
        window.close();
      } else {
        // Fallback: Navigate directly if no parent window
        window.location.href = "/dashboard/properties";
      }
    }
  }, [status]);

  return (
    <div
      style={{
        width: "80vw",
        height: "80vh",
        position: "absolute",
        left: 0,
        top: 0,
        background: "white",
      }}
    ></div>
  );
};

export default SignInPage;
