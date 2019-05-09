import payablesFromRequest from '../mocks/payablesFromRequestMock.json'
import expectedPayablesResult from '../mocks/payablesExpectedResult.json'
import { buildPayableRows } from './payables'

describe('payables data', () => {
  it('should build the correct payable data', () => {
    expect(buildPayableRows(payablesFromRequest))
      .toEqual(expectedPayablesResult)
  })
})
