import 'dotenv/config'

import { TestWorkflowEnvironment } from '@temporalio/testing'
import { Worker } from '@temporalio/worker'
import { WorkflowCoverage } from '@temporalio/nyc-test-coverage'
import { createFairyringCowswapActivitiesWithDependencies } from './activities'
import { getDb } from './db'
import { syncFairyringCowswapOrders } from './workflows'
import { FAIRYRING_COWSWAP_SYNC_TASK_QUEUE, FAIRYRING_COWSWAP_SYNC_WORKFLOW_ID } from './config'

let testEnv: TestWorkflowEnvironment
const workflowCoverage = new WorkflowCoverage()

const runFairyringCowswapSyncWorkflowUnderTest = async () => {
  testEnv = await TestWorkflowEnvironment.createLocal()

  const db = await getDb()
  const activities = createFairyringCowswapActivitiesWithDependencies(db)

  const { client, nativeConnection } = testEnv
  const worker = await Worker.create(
    workflowCoverage.augmentWorkerOptions({
      connection: nativeConnection,
      taskQueue: FAIRYRING_COWSWAP_SYNC_TASK_QUEUE,
      workflowsPath: require.resolve('./workflows'),
      activities,
    })
  )

  await worker.runUntil(async () => {
    const result = await client.workflow.execute(syncFairyringCowswapOrders, {
      workflowId: FAIRYRING_COWSWAP_SYNC_WORKFLOW_ID,
      taskQueue: FAIRYRING_COWSWAP_SYNC_TASK_QUEUE,
      args: [{}],
    })
    console.log(`Workflow ran to completion. Result:`, result)
  })

  console.log(`Test: Complete, tearing down.`)
  await testEnv.teardown()
  console.log(`Test: Tearing down complete. Exiting.`)
}

runFairyringCowswapSyncWorkflowUnderTest()
  .then((_) => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
