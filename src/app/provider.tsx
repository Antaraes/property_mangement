"use client";

import { PropsWithChildren, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "@/layout/Layout";
// import { trpc } from '@/trpc/client'
// import { httpBatchLink } from '@trpc/client'

const Providers = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(() => new QueryClient());
  //   const [trpcClient] = useState(() =>
  //     trpc.createClient({
  //       links: [
  //         httpBatchLink({
  //           url: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/trpc`,
  //           fetch(url, options) {
  //             return fetch(url, {
  //               ...options,
  //               credentials: 'include',
  //             })
  //           },
  //         }),
  //       ],
  //     })
  //   )

  return (
    <QueryClientProvider client={queryClient}>
      <Layout>{children}</Layout>
    </QueryClientProvider>
  );
};

export default Providers;
