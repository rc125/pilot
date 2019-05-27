import buildBalanceTotal from './operations'
import fromRequest from '../mocks/total/operations/received.json'
import expectedResult from '../mocks/total/operations/expected.json'

describe('balance total details', () => {
  it('should build the correct total balance', () => {
    expect(buildBalanceTotal(fromRequest)).toEqual(expectedResult)
  })
})
