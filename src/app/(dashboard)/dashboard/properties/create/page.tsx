import { CreatePropertyForm } from "@/components/admin/CreatePropertyForm";
import { FC } from "react";

interface pageProps {}

const page: FC<pageProps> = ({}) => {
  return (
    <div>
      <CreatePropertyForm />
    </div>
  );
};

export default page;
