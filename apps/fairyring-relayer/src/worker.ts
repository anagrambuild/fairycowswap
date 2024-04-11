import 'dotenv/config'
import {
  NativeConnection,
  NativeConnectionOptions,
  Worker,
} from "@temporalio/worker";
import { Decimal } from 'decimal.js-light';
import { createRebalanceActivitiesWithDependencies } from "./activities";
import {
  getTemporalCloudClientCrt,
  getTemporalCloudClientKey,
  getTemporalCloudAppAddress, getTemporalCloudAppNamespace
} from "./config";
import { getDb } from "./db";

Decimal.set({ toExpPos: 9e15 });
Decimal.set({ toExpNeg: -9e15 });
Decimal.set({ rounding: Decimal.ROUND_DOWN });
Decimal.set({ precision: 64 });

const workflowOption = () =>
  process.env.NODE_ENV === 'production'
    ? {
        workflowBundle: {
          codePath: require.resolve('../workflow-bundle.js'),
        },
      }
    : { workflowsPath: require.resolve('./workflows') };

async function run(): Promise<void> {
  const address = getTemporalCloudAppAddress()
  const namespace = getTemporalCloudAppNamespace()

  const crt = await getTemporalCloudClientCrt();
  const key = await getTemporalCloudClientKey();

  const connectionOptions: NativeConnectionOptions = {
    address,
    tls: {
      clientCertPair: {
        crt,
        key,
      },
    },
  };

  const connection = await NativeConnection.connect(connectionOptions);

  const db = await getDb();
  
  const activities = createRebalanceActivitiesWithDependencies(db);

  const worker = await Worker.create({
    connection,
    namespace,
    activities,
    ...workflowOption(),
    taskQueue: 'post-decrypted-orders-to-cowswap',
  });
  console.log("Worker connection successfully established");

  console.log("WORKER RUNNING...");
  await worker.run();
  await connection.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
