import { proxyActivities } from "@temporalio/workflow";
import type { createRebalanceActivitiesWithDependencies } from "./activities";

const activityInitialRetryInterval = 1000;
// Instantiate the activities
const { pullAllCowswapOrdersForBlocks, postCowSwapOrdersToOrderbook } =
  proxyActivities<ReturnType<typeof createRebalanceActivitiesWithDependencies>>(
    {
      startToCloseTimeout: "1 hour",
      heartbeatTimeout: "2 minutes",
      retry: {
        // default retry policy if not specified
        initialInterval: "60s",
        backoffCoefficient: 2,
        maximumAttempts: 1, //Infinity,
        maximumInterval: 100 * activityInitialRetryInterval,
        nonRetryableErrorTypes: [],
      },
    }
  );

// Compose sync workflow with activities
export const syncFairyringCowswapOrders = async (
  _workflowArgs: { }
) => {
  console.log("temporal worker: syncFairyringCowswapOrders [start]");
  const cowswapOrders = await pullAllCowswapOrdersForBlocks();
  const ordersPostJobResult = await postCowSwapOrdersToOrderbook(cowswapOrders)
  console.log("temporal worker: syncFairyringCowswapOrders[end]");
  return {
    success: true,
    cowswapOrders,
    ordersPostJobResult,
  };
};
