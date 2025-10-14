import { FC } from "react";
import LeadsDashboard from "@/components/crm/LeadsDashboard";

interface PageProps {}

const Page: FC<PageProps> = ({}) => {
  return (
    <div className="container mx-auto py-6">
      <LeadsDashboard
        title="My Leads"
        description="View and manage leads assigned to you"
        showCreateButton={true}
        useMyLeads={true}
      />
    </div>
  );
};

export default Page;
