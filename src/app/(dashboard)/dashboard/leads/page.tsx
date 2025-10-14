import { FC } from "react";
import LeadsDashboard from "@/components/crm/LeadsDashboard";

interface PageProps {}

const Page: FC<PageProps> = ({}) => {
  return (
    <div className="container mx-auto py-6">
      <LeadsDashboard
        title="All Leads"
        description="Manage and track all customer leads across your organization"
        showCreateButton={true}
        useMyLeads={false}
      />
    </div>
  );
};

export default Page;
