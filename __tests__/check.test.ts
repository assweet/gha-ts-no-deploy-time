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
    const date: Date = new Date('2024-04-10 12:00:00 GMT+8')
    const result: boolean = checkHolidays(date, 'SG', 'SG', 'SG')

    expect(result).toBeTruthy()
  })
  it('checkHoliday with invalid holiday', async () => {
    const date: Date = new Date('2024-04-15 12:00:00 GMT+8')
    const result: boolean = checkHolidays(date, 'SG', 'SG', 'SG')

    expect(result).toBeFalsy()
  })
  // checkOfficeHours
  it('checkOfficeHours with valid time', async () => {
    const date: Date = new Date('2024-04-10 12:00:00 GMT+8')
    const nowHour: number = date.getHours()
    const result: boolean = checkOfficeHours(nowHour, '9', '22')

    expect(result).toBeTruthy()
  })
  it('checkOfficeHours with after office hours', async () => {
    const date: Date = new Date('2024-04-10 23:00:00 GMT+8')
    const nowHour: number = date.getHours()
    const result: boolean = checkOfficeHours(nowHour, '9', '22')

    expect(result).toBeFalsy()
  })
  it('checkOfficeHours with before office hours', async () => {
    const date: Date = new Date('2024-04-10 04:00:00 GMT+8')
    const nowHour: number = date.getHours()
    const result: boolean = checkOfficeHours(nowHour, '9', '22')

    expect(result).toBeFalsy()
  })
  it('checkOfficeHours with just at end office hours', async () => {
    const date: Date = new Date('2024-04-10 22:00:00 GMT+8')
    const nowHour: number = date.getHours()
    const result: boolean = checkOfficeHours(nowHour, '9', '22')

    expect(result).toBeFalsy()
  })
  // checkWeekend
  it('checkWeekend with weekday', async () => {
    const date: Date = new Date('2024-04-10 12:00:00 GMT+8')
    const dayOfWeek: string = date.toLocaleDateString('en-US', {
      weekday: 'long'
    })
    const noDeploymentDays = 'Friday,Saturday,Sunday'
    const result: boolean = checkWeekend(dayOfWeek, noDeploymentDays)

    expect(result).toBeFalsy()
  })
  it('checkWeekend with weekend', async () => {
    const date: Date = new Date('2024-04-12 22:00:00 GMT+8')
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
    const date: Date = new Date('2024-04-10 12:00:00 GMT+8')
    const [resultDate, resultHour, resultDayOfWeek] = convertDateTz(date, '+8')
    console.log(`offset = ${date.getTimezoneOffset()}`)

    expect(resultDate.getTime()).toEqual(date.getTime())
    expect(resultHour).toEqual(12)
    expect(resultDayOfWeek.includes('wednesday')).toBeTruthy()
  })
  it('convertDateTz with different timezone', async () => {
    const date: Date = new Date('2024-04-10 12:00:00 GMT+8')
    const [resultDate, resultHour, resultDayOfWeek] = convertDateTz(date, '-5')

    expect(resultDate.getTime()).toBeLessThan(date.getTime())
    expect(resultHour).toEqual(23)
    expect(resultDayOfWeek.includes('tuesday')).toBeTruthy()
  })
  it('convertDateTz with invalid offset', async () => {
    const date: Date = new Date('2024-04-10 12:00:00 GMT+8')
    const t = (): boolean => {
      convertDateTz(date, 'abc')
      return true
    }
    expect(t).toThrow(TypeError)
  })
})
