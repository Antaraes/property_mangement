import { propertyRouter } from "./routers/property";
import { agentRouter } from "./routers/agent";
import { router } from "./trpc";

export const appRouter = router({
  property: propertyRouter,
  agent: agentRouter,
});
export type AppRouter = typeof appRouter;
