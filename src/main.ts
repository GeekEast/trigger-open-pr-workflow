import * as core from '@actions/core';
import { pullInputs, getOpenPRBranches, triggerWorkflow } from './utils';

async function run() {
  console.log(`Starting Workflow Dispatch 🚀`);
  try {
    const { token, workflow_filename, owner, repo } = pullInputs();

    const branches = await getOpenPRBranches({ repo, owner, token });

    console.log('open pr branches', branches);
    await Promise.all(
      branches.map((branch_name) => triggerWorkflow({ owner, repo, token, workflow_filename, ref: branch_name })),
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

run();
