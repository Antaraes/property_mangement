import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { FC } from "react";

interface pageProps {}

const page: FC<pageProps> = ({}) => {
  return (
    <div>
      <Link className={cn(buttonVariants())} href={"properties/create"}>
        Add Property
      </Link>
    </div>
  );
};

export default page;
