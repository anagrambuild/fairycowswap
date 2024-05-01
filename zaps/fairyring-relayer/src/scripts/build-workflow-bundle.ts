import { bundleWorkflowCode } from '@temporalio/worker';
import { writeFile } from 'fs/promises';
import path from 'path';

async function bundle() {
  const { code } = await bundleWorkflowCode({
    workflowsPath: require.resolve('../workflows'),
  });
  const codePathPackage = path.join(__dirname, '../../workflow-bundle.js');
  const codePathRoot = path.join(__dirname, '../../../../workflow-bundle.js');
  await writeFile(codePathPackage, code);
  console.log(`Bundle written to ${codePathPackage}`);
  await writeFile(codePathRoot, code);
  console.log(`Bundle written to ${codePathRoot}`);
}

bundle().catch((err) => {
  console.error(err);
  process.exit(1);
});