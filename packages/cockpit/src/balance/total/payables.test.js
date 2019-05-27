import buildPayablesTotal from './payables'
import expectedTotal from '../mocks/total/payables/expected.json'
import receivedTotal from '../mocks/total/payables/received.json'

describe('payables total details', () => {
  const total = buildPayablesTotal(receivedTotal)
  it('should created a obejct with the correct fields', () => {
    expect(total).toEqual(expectedTotal)
  })
})
