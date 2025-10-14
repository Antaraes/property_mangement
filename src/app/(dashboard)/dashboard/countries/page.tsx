import { FC } from "react";
import CountriesDashboard from "@/components/admin/CountriesDashboard";

interface pageProps {}

const page: FC<pageProps> = ({}) => {
  return (
    <div className="container mx-auto py-6">
      <CountriesDashboard />
    </div>
  );
};

export default page;
