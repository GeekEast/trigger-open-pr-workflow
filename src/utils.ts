import * as core from '@actions/core';
import * as github from '@actions/github';
import axios from 'axios';
import { GraphQLClient, gql } from 'graphql-request';

export const pullInputs = (): { token: string; workflow_filename: string; owner: string; repo: string } => {
  const inputs = {
    token: core.getInput('token'),
    workflow_filename: core.getInput('workflow_filename'),
  };

  const owner = github.context.repo.owner.toLowerCase();
  const repo = github.context.repo.repo.toLowerCase();

  return {
    ...inputs,
    owner,
    repo,
  };
};

export const getOpenPRBranches = async (config: { repo: string; owner: string; token: string }): Promise<string[]> => {
  console.log(`query open PR branches for ${config.owner}/${config.repo}`);

  const endpoint = 'https://api.github.com/graphql';
  const graphQLClient = new GraphQLClient(endpoint, {
    headers: {
      authorization: `Bearer ${config.token}`,
    },
  });

  const query = gql`
    query Query($repo: String!, $owner: String!) {
      repository(name: $repo, owner: $owner) {
        pullRequests(first: 100, states: OPEN) {
          nodes {
            headRefName
          }
        }
      }
    }
  `;

  const data = await graphQLClient.request(query, { repo: config.repo, owner: config.owner });
  const arrOfHeadRef = data.repository.pullRequests.nodes;
  return arrOfHeadRef.map((pr: { headRefName: string }) => pr.headRefName);
};

export const triggerWorkflow = async (config: {
  owner: string;
  repo: string;
  workflow_filename: string;
  token: string;
  ref: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<void> => {
  const restClient = axios.create({
    baseURL: 'https://api.github.com',
    headers: {
      authorization: `Bearer ${config.token}`,
      accept: 'application/vnd.github.v3+json',
    },
  });

  const owner = config.owner || 'geekeast';
  const repo = config.repo || 'external-workflow-trigger';
  const workflow_id = config.workflow_filename || 'pipeline.yml';

  const res = await restClient.post(`/repos/${owner}/${repo}/actions/workflows/${workflow_id}/dispatches`, {
    ref: config.ref,
  });

  if (res.status === 204) console.log(`trigger successfully for ${owner}/${repo}:${config.ref}:${workflow_id}`);
};
