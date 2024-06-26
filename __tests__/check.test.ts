import {
  checkHolidays,
  checkOfficeHours,
  checkWeekend,
  convertDateTz
} from '../src/check'
import { expect } from '@jest/globals'

describe('check.ts', () => {
  // checkHoliday
  it('checkHoliday with valid holiday', async () => {
    const date: Date = new Date('2024-04-10 12:00:00 GMT+0800')
    const result: boolean = checkHolidays(date, 'SG', 'SG', 'SG')

    expect(result).toBeTruthy()
  })
  it('checkHoliday with invalid holiday', async () => {
    const date: Date = new Date('2024-04-15 12:00:00 GMT+0800')
    const result: boolean = checkHolidays(date, 'SG', 'SG', 'SG')

    expect(result).toBeFalsy()
  })
  // checkOfficeHours
  it('checkOfficeHours with valid time', async () => {
    const nowHour = 12
    const result: boolean = checkOfficeHours(nowHour, '9', '22')

    expect(result).toBeTruthy()
  })
  it('checkOfficeHours with after office hours', async () => {
    const nowHour = 23
    const result: boolean = checkOfficeHours(nowHour, '9', '22')

    expect(result).toBeFalsy()
  })
  it('checkOfficeHours with before office hours', async () => {
    const nowHour = 5
    const result: boolean = checkOfficeHours(nowHour, '9', '22')

    expect(result).toBeFalsy()
  })
  it('checkOfficeHours with just at end office hours', async () => {
    const nowHour = 22
    const result: boolean = checkOfficeHours(nowHour, '9', '22')

    expect(result).toBeFalsy()
  })
  // checkWeekend
  it('checkWeekend with weekday', async () => {
    const date: Date = new Date('2024-04-10 12:00:00 GMT+0800')
    const dayOfWeek: string = date.toLocaleDateString('en-US', {
      weekday: 'long'
    })
    const noDeploymentDays = 'Friday,Saturday,Sunday'
    const result: boolean = checkWeekend(dayOfWeek, noDeploymentDays)

    expect(result).toBeFalsy()
  })
  it('checkWeekend with weekend', async () => {
    const date: Date = new Date('2024-04-12 22:00:00 GMT+0800')
    const dayOfWeek: string = date.toLocaleDateString('en-US', {
      timeZone: 'America/Los_Angeles',
      weekday: 'long'
    })
    const noDeploymentDays = 'Friday,Saturday,Sunday'
    const result: boolean = checkWeekend(dayOfWeek, noDeploymentDays)

    expect(result).toBeTruthy()
  })
  // convertTZ
  it('convertDateTz with valid timezone', async () => {
    const date: Date = new Date('2024-04-10 12:00:00 GMT+0800')
    const [resultHour, resultDayOfWeek] = convertDateTz(date, '+8')
    console.log(`date = ${date}`)
    console.log(`offset = ${date.getTimezoneOffset()}`)

    expect(resultHour).toEqual(12)
    expect(resultDayOfWeek.includes('wednesday')).toBeTruthy()
  })
  it('convertDateTz with different timezone', async () => {
    const date: Date = new Date('2024-04-10 12:00:00 GMT+0800')
    const [resultHour, resultDayOfWeek] = convertDateTz(date, '-5')
    console.log(`date = ${date}`)
    console.log(`offset = ${date.getTimezoneOffset()}`)

    expect(resultHour).toEqual(23)
    expect(resultDayOfWeek.includes('tuesday')).toBeTruthy()
  })
  it('convertDateTz with invalid offset', async () => {
    const date: Date = new Date('2024-04-10 12:00:00 GMT+0800')
    const t = (): boolean => {
      convertDateTz(date, 'abc')
      return true
    }
    expect(t).toThrow(TypeError)
  })
})
