import { propertyRouter } from "./routers/property";
import { agentRouter } from "./routers/agent";
import { employeeRouter } from "./routers/employee";
import { companyRouter } from "./routers/company";
import { countryRouter } from "./routers/country";
import { areaRouter } from "./routers/area";
import { leadRouter } from "./routers/lead";
import { transactionRouter } from "./routers/transaction";
import { messageRouter } from "./routers/message";
import { router } from "./trpc";

export const appRouter = router({
  property: propertyRouter,
  agent: agentRouter, // Legacy - will be deprecated
  employee: employeeRouter,
  company: companyRouter,
  country: countryRouter,
  area: areaRouter,
  lead: leadRouter,
  transaction: transactionRouter,
  message: messageRouter,
});
export type AppRouter = typeof appRouter;
