"use client";

import { PropsWithChildren, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "@/layout/Layout";
import { httpBatchLink } from "@trpc/client";
import { trpc } from "@/server/client";
import { SessionProvider } from "next-auth/react";

const Providers = ({ children }: PropsWithChildren) => {
  const queryClient = new QueryClient();

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/trpc`,
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: "include",
            });
          },
        }),
      ],
    })
  );

  return (
    <SessionProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <Layout>{children}</Layout>
        </QueryClientProvider>
      </trpc.Provider>
    </SessionProvider>
  );
};

export default Providers;
