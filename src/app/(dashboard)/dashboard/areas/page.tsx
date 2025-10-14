import { FC } from "react";
import AreasDashboard from "@/components/admin/AreasDashboard";

interface pageProps {}

const page: FC<pageProps> = ({}) => {
  return (
    <div className="container mx-auto py-6">
      <AreasDashboard />
    </div>
  );
};

export default page;
