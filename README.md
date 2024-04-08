# Create a GitHub Action Using TypeScript

[![GitHub Super-Linter](https://github.com/assweet/gha-ts-no-deploy-time/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/assweet/gha-ts-no-deploy-time/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/assweet/gha-ts-no-deploy-time/actions/workflows/check-dist.yml/badge.svg)](https://github.com/assweet/gha-ts-no-deploy-time/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/assweet/gha-ts-no-deploy-time/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/assweet/gha-ts-no-deploy-time/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

This is a app that you can add to your github actions job to block auto
deployment during the weekends and outside office hours

You should still be able to allow deployment via workflow_dispatch or
workflow_call

## Initial Setup

Add the following step in your github actions:

```
outputs:
  reason: ${{ steps.should-deploy.outputs.reason }}
  should_deploy: ${{ steps.should-deploy.outputs.shouldDeploy }}
steps:
  - use: assweet/gha-ts-no-deploy-time
    id: should-deploy
    with:
      no_deployment_days: Friday,Saturday,Sunday
      tz: Asia/Singapore
      country: SG
      state: SG
      region: SG
      office_hours_start: 9
      office_hours_end: 22
```

We obtain the list of holidays using the npm package
[date-holidays](https://www.npmjs.com/package/date-holidays)

You will need to check the arrangement for the state and region specified in the
holidays package by running:

```
const h = new Holidays()
h.getCountries()

h.getStates('US')

h.getRegions('US', 'ca')
```

## Testing and Debugging

```
npm install

INPUT_NO_DEPLOYMENT_DAYS=Friday,Saturday,Sunday INPUT_TZ=Asia/Singapore INPUT_COUNTRY=SG INPUT_STATE=SG INPUT_REGION=SG  INPUT_OFFICE_HOURS_START=9 INPUT_OFFICE_HOURS_END=22 npx ts-node src/index.ts
```
