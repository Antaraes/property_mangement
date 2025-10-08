import { FC } from "react";
import PropertiesDashboard from "@/components/admin/PropertiesDashboard";

interface pageProps {}

const page: FC<pageProps> = ({}) => {
  return (
    <div className="container mx-auto py-6">
      <PropertiesDashboard />
    </div>
  );
};

export default page;
