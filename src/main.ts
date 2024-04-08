import * as core from '@actions/core'
import Holidays from 'date-holidays'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
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
    core.debug(`noDeploymentDays: "${noDeploymentDays}"`)
    core.debug(`tz: "${tz}"`)
    core.debug(`country: "${country}"`)
    core.debug(`state: "${state}"`)
    core.debug(`region: "${region}"`)
    core.debug(`officeHoursStart: "${officeHoursStart}"`)
    core.debug(`officeHoursEnd: "${officeHoursEnd}"`)

    // Log the current timestamp
    const today: Date = new Date()
    core.info(`today: "${today.toISOString()}"`)

    // check if day of week is one of the noDeploymentDays
    if (tz !== '' && noDeploymentDays !== '') {
      // convert to timezone
      const tzTodayDay = today.toLocaleString('en-US', {
        timeZone: tz,
        weekday: 'long'
      })
      core.info(`tzTodayDay: "${tzTodayDay}"`)
      const noDeploymentDaysCommas: string = `,${noDeploymentDays.toLowerCase()},`
      const foundDeploymentDay: number = noDeploymentDaysCommas.indexOf(
        `,${tzTodayDay.toLowerCase()},`
      )
      core.debug(`foundDeploymentDay: "${foundDeploymentDay}"`)
      if (foundDeploymentDay > -1) {
        // We found it in a noDeploymentDays
        core.setOutput(
          'reason',
          `Do not deploy on a no deployment day, ${noDeploymentDays}`
        )
        core.setOutput(`should_deploy`, false)
        return
      }
    }
    // check if officeHoursEnd and officeHoursStart are defined
    if (tz !== '' && officeHoursStart !== '' && officeHoursEnd !== '') {
      const officeHoursStartInt: number = parseInt(officeHoursStart, 10)
      const officeHoursEndInt: number = parseInt(officeHoursEnd, 10)
      // check if in officeHours
      const todayHour = today.toLocaleString('en-US', {
        timeZone: tz,
        hourCycle: 'h23',
        hour: '2-digit'
      })
      // validate the input officeHoursStart and officeHoursEnd
      const todayHourInt: number = parseInt(todayHour, 10)
      core.debug(
        `Check if "${todayHour}" is in office hour "${officeHoursStart}"-"${officeHoursEnd}"`
      )

      if (
        todayHourInt <= officeHoursStartInt ||
        todayHourInt >= officeHoursEndInt
      ) {
        core.setOutput(
          'reason',
          `Do not deploy outside the office hours from ${officeHoursStart} to ${officeHoursEnd} on a weekday`
        )
        core.setOutput(`should_deploy`, false)
        return
      }
    }
    // check if we are in a holiday for country
    if (country !== '') {
      const h = new Holidays(country, state, region)
      const isTodayHoliday = h.isHoliday(today)
      if (isTodayHoliday) {
        core.setOutput('reason', `Do not deploy a holiday for ${country}`)
        core.setOutput(`should_deploy`, false)
        return
      }
    }
    core.setOutput('reason', 'Proceed with deploy')
    core.setOutput(`should_deploy`, true)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
