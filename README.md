# trigger-open-pr-workflow

## Inputs
- token: the user's access token
- workflow_filename: the workflow file name


```yml
name: Dispatch Merge Event

on:
 pull_request:
   branches:
     - main
   types: [closed]


jobs:
  publish-merge-event:
    if: ${{ github.event.pull_request.merged }}
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Open PRs workflow
        uses: GeekEast/trigger-open-pr-workflow@1.0.7
        with:
          token: ${{ secrets.ACCESS_TOKEN }} # genereate a personal token, don't use the default secrets.GTIHUB_TOKEN
          workflow_filename: 'pipeline.yml'
```

## Sample Project
- [worfklow-trigger-me](https://github.com/GeekEast/workflow-trigger-me)
