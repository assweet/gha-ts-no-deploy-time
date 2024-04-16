import * as core from '@actions/core'
import * as github from '@actions/github'
import {
  checkHolidays,
  checkOfficeHours,
  checkWeekend,
  convertDateTz
} from './check'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const eventTypes: string = core.getInput('event_types', { required: true })
    const noDeploymentDays: string = core.getInput('no_deployment_days', {
      required: true
    })
    const tz: string = core.getInput('tz', { required: true })
    const country: string = core.getInput('country')
    const state: string = core.getInput('state')
    const region: string = core.getInput('region')
    const officeHoursStart: string = core.getInput('office_hours_start')
    const officeHoursEnd: string = core.getInput('office_hours_end')

    // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    core.debug(`eventTypes: "${eventTypes}"`)
    core.debug(`noDeploymentDays: "${noDeploymentDays}"`)
    core.debug(`tz: "${tz}"`)
    core.debug(`country: "${country}"`)
    core.debug(`state: "${state}"`)
    core.debug(`region: "${region}"`)
    core.debug(`officeHoursStart: "${officeHoursStart}"`)
    core.debug(`officeHoursEnd: "${officeHoursEnd}"`)

    // Run this only for events listed in eventTypes
    const eventName = `,${github.context.eventName.trim().toLowerCase()},`
    const eventTypesComma = `,${eventTypes.trim().toLowerCase()},`
    if (!eventTypesComma.includes(eventName)) {
      core.setOutput('reason', 'Should Deploy')
      core.setOutput('should_deploy', true)
      return
    }

    // Log the current timestamp
    const today: Date = new Date()
    core.info(`today: "${today.toISOString()}"`)
    const [todayHour, dayOfWeek] = convertDateTz(today, tz)
    core.setOutput(
      'debug',
      `convertDateTz returns [${today}, ${todayHour}, ${dayOfWeek}]`
    )

    // check if day of week is one of the noDeploymentDays
    if (checkWeekend(dayOfWeek, noDeploymentDays)) {
      // We found it in a noDeploymentDays
      core.setOutput(
        'reason',
        `Do not deploy on a no deployment day, ${noDeploymentDays}`
      )
      core.setOutput(`should_deploy`, false)
      return
    }
    // check if officeHoursEnd and officeHoursStart are defined
    if (!checkOfficeHours(todayHour, officeHoursStart, officeHoursEnd)) {
      core.setOutput(
        'reason',
        `Do not deploy outside the office hours from ${officeHoursStart} to ${officeHoursEnd} on a weekday`
      )
      core.setOutput(`should_deploy`, false)
      return
    }
    // check if we are in a holiday for country
    if (country !== '' && checkHolidays(today, country, state, region)) {
      core.setOutput('reason', `Do not deploy a holiday for ${country}`)
      core.setOutput(`should_deploy`, false)
      return
    }
    core.setOutput('reason', 'Proceed with deploy')
    core.setOutput(`should_deploy`, true)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
