import payablesFromRequest from '../mocks/payables/received.json'
import expectedPayablesResult from '../mocks/payables/expected.json'
import payableFromRequest from '../mocks/payable/received.json'
import expectedPayable from '../mocks/payable/expected.json'
import buildPayableRows,
{
  buildOutcoming,
  buildOutgoing,
  getInstallment,
} from './payables'

describe('payables data', () => {
  it('should build the correct payable data', () => {
    expect(buildPayableRows(payablesFromRequest))
      .toEqual(expectedPayablesResult)
  })

  it('should get the correct installments', () => {
    const installments = getInstallment(payableFromRequest)
    const expected = expectedPayable.installment

    expect(installments).toEqual(expected)
  })

  it('should build a correct outcoming', () => {
    const outcoming = buildOutcoming(payableFromRequest)
    const expected = expectedPayable.outcoming

    expect(outcoming).toEqual(expected)
  })

  it('should build a correct outgoing', () => {
    const outcoming = buildOutgoing(payableFromRequest)
    const expected = expectedPayable.outgoing

    expect(outcoming).toEqual(expected)
  })
})
