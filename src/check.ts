// import * as core from '@actions/core'
import Holidays from 'date-holidays'

/**
 * The convertDateTz cnnvert the date to the specified timezone
 * @returns {Date}` Resolves when the action is complete.
 */
export function convertDateTz(today: Date, offset: string): [number, string] {
  // Some data validation before continuing
  if (offset === '') {
    throw new TypeError('Timezone offset not specified')
  }
  const offsetInt: number = parseInt(offset, 10)
  if (isNaN(offsetInt)) {
    throw new TypeError('Timezone offset invalid')
  }
  const todayUTCHour: number = today.getUTCHours()
  let resultDayOfWeekInt: number = today.getUTCDay()
  let resultHour: number = todayUTCHour + offsetInt
  if (resultHour < 0) {
    resultDayOfWeekInt = resultDayOfWeekInt - 1
    resultHour = resultHour + 24
  } else if (resultHour > 24) {
    resultDayOfWeekInt = resultDayOfWeekInt + 1
    resultHour = resultHour - 24
  }
  const weekday: string[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday'
  ]
  const resultDayOfWeek: string = weekday[resultDayOfWeekInt]
  console.log(`convertDateTz returns [${resultHour}, ${resultDayOfWeek}]`)

  return [resultHour, resultDayOfWeek]
}

/**
 * The checkWeekend checks if the date time is within week days
 * @returns {boolean} Resolves when the action is complete.
 */
export function checkWeekend(
  dayOfWeek: string,
  noDeploymentDays: string
): boolean {
  // Some data validation before continuing
  if (dayOfWeek === '') {
    throw new TypeError('dayOfWeek not properly defined')
  }
  if (noDeploymentDays === '') {
    throw new TypeError('noDeploymentDays is not properly defined')
  }
  const noDeploymentDaysCommas = `,${noDeploymentDays.toLowerCase()},`
  const result: boolean = noDeploymentDaysCommas.includes(
    `,${dayOfWeek.toLowerCase()},`
  )
  return result
}

/**
 * The checkOfficeHours checks if the date time is within office hours
 * @returns {boolean} Resolves when the action is complete.
 */
export function checkOfficeHours(
  nowHour: number,
  officeHoursStart: string,
  officeHoursEnd: string
): boolean {
  // Some data validation before continuing
  if (officeHoursStart === '' || officeHoursEnd === '') {
    throw new TypeError('Either office hours start or end is not defined')
  }
  const officeHoursStartInt: number = parseInt(officeHoursStart, 10)
  const officeHoursEndInt: number = parseInt(officeHoursEnd, 10)

  if (
    isNaN(nowHour) ||
    isNaN(officeHoursStartInt) ||
    isNaN(officeHoursEndInt)
  ) {
    throw new TypeError(
      'Either nowHour or office hours start or end is not a number'
    )
  }
  if (nowHour <= officeHoursStartInt || nowHour >= officeHoursEndInt) {
    return false
  }
  return true
}

/**
 * The checkHolidays checks if the date time is correct
 * @returns {boolean}` Resolves when the action is complete.
 */
export function checkHolidays(
  tzToday: Date,
  country: string,
  state: string,
  region: string
): boolean {
  // Some data validation before continuing
  if (!(tzToday instanceof Date) || isNaN(tzToday.getTime())) {
    throw new TypeError('today is not a date')
  }
  const h = new Holidays(country, state, region)
  const isTodayHoliday = h.isHoliday(tzToday)
  return isTodayHoliday !== false
}
