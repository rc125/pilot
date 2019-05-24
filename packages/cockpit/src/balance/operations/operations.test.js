import operations, {
  boletoRefundFeeOutcoming,
  boletoRefundFeeOutgoing,
  getInstallment,
  interRecipientTransferOutcoming,
  interRecipientTransferOutgoing,
  isBoletoRefund,
  isCredit,
  isInterRecipientTransfer,
  isRefundOrChargeBack,
  isTedTransfer,
  refundOrChargeBackOutcoming,
  refundOrChargeBackOutgoing,
  tedTransferOutgoing,
  zeroTransferAmount,
  creditOutcoming,
  creditOutgoing,
  buildOutcoming,
  buildOutgoing,
} from './operations'

import operationsExpectedMock from '../mocks/operations/expected.json'
import operationMock from '../mocks/operation/received.json'
import operationExpectedMock from '../mocks/operation/expected.json'
import operationsMock from '../mocks/operations/received.json'

describe('Operations table data', () => {
  it('should build the correct operations table data', () => {
    const result = operations(operationsMock)

    expect(result).toEqual(operationsExpectedMock)
  })

  it('should get the correct installments', () => {
    const installments = getInstallment(operationMock)
    const expected = operationExpectedMock.installment

    expect(installments).toEqual(expected)
  })

  describe('Building outcoming and outgoing', () => {
    it('should validate if a operation is a chargeback or refund', () => {
      let refundOrChargeback = isRefundOrChargeBack(operationMock)

      expect(refundOrChargeback).toBe(false)

      refundOrChargeback = isRefundOrChargeBack({
        ...operationMock,
        movement_object: {
          type: 'chargeback',
        },
      })

      expect(refundOrChargeback).toBe(true)

      refundOrChargeback = isRefundOrChargeBack({
        ...operationMock,
        movement_object: {
          type: 'refund',
        },
      })

      expect(refundOrChargeback).toBe(true)
    })

    it('should create a correct object with amount and type from the given chargeback/refund fee', () => {
      const operation = {
        fee: 100,
      }

      const expected = [{
        amount: 100,
        type: 'mdr',
      }]

      expect(refundOrChargeBackOutcoming(operation)).toEqual(expected)
    })

    it('should create a correct object with amount and type from the given chargeback/refund amount', () => {
      const operation = {
        amount: 100,
      }

      const expected = [{
        amount: 100,
        type: 'payable',
      }]

      expect(refundOrChargeBackOutgoing(operation)).toEqual(expected)
    })

    it('should validate if a operation is TED transfer', () => {
      let isTed = isTedTransfer(operationMock)

      expect(isTed).toBe(false)

      isTed = isTedTransfer({
        ...operationMock,
        type: 'transfer',
        movement_object: {
          type: 'ted',
        },
      })

      expect(isTed).toBe(true)
    })

    it('should return a transfer with zero amount', () => {
      const zeroAmountTransfer = zeroTransferAmount()
      const expected = {
        amount: 0,
        type: 'payable',
      }

      expect(zeroAmountTransfer).toEqual(expected)
    })

    it('should return a ted transfer outgoing array', () => {
      const operation = {
        amount: 100,
        fee: 115,
      }
      const outgoing = tedTransferOutgoing(operation)
      const expectedOutGoing = [{
        type: 'tedFee',
        amount: 115,
      }, {
        type: 'payable',
        amount: 100,
      }]

      expect(outgoing).toEqual(expectedOutGoing)
    })

    it('should validate if is a transfer between recipients', () => {
      let isInterRecipient = isInterRecipientTransfer(operationMock)

      expect(isInterRecipient).toBe(false)

      isInterRecipient = isInterRecipientTransfer({
        ...operationMock,
        type: 'transfer',
        movement_object: {
          type: 'inter_recipient',
        },
      })

      expect(isInterRecipient).toBe(true)
    })

    it('should create a correct inter-recipient outcoming', () => {
      const outcoming = interRecipientTransferOutcoming(operationMock)
      const expected = [{
        amount: 30000,
        type: 'payable',
      }]

      expect(outcoming).toEqual(expected)
    })

    it('should create a correct inter-recipient outgoing', () => {
      const outgoing = interRecipientTransferOutgoing(operationMock)
      const expected = [{
        amount: 0,
        type: 'payable',
      }]

      expect(outgoing).toEqual(expected)
    })

    it('should validate if it is a boleto refund fee', () => {
      let isBoletoFee = isBoletoRefund(operationMock)

      expect(isBoletoFee).toBe(false)

      isBoletoFee = isBoletoRefund({
        ...operationMock,
        type: 'refund',
        movement_object: {
          type: 'boleto',
        },
      })

      expect(isBoletoFee).toBe(true)
    })

    it('should create a correct object with amount and type from the given boleto refund fee', () => {
      const operation = {
        fee: 100,
      }

      const expected = [{
        amount: 100,
        type: 'tedFee',
      }]

      expect(boletoRefundFeeOutgoing(operation)).toEqual(expected)
    })

    it('should create a correct object with amount and type from the given boleto amount', () => {
      const operation = {
        amount: 123,
      }

      const expected = [{
        amount: 123,
        type: 'payable',
      }]

      expect(boletoRefundFeeOutcoming(operation)).toEqual(expected)
    })

    it('should validate if it is a credit operation', () => {
      let isCreditOperation = isCredit(operationMock)

      expect(isCreditOperation).toBe(true)

      isCreditOperation = isCredit({
        ...operationMock,
        type: 'not-payable',
        movement_object: {
          type: 'not-credit',
        },
      })

      expect(isCreditOperation).toBe(false)
    })

    it('should create a correct object with amount and type from the given credit outcoming', () => {
      const outcoming = creditOutcoming(operationMock)
      const expected = operationExpectedMock.outcoming

      expect(outcoming).toEqual(expected)
    })

    it('should create a correct object with amount and type from the given credit outgoing', () => {
      const outgoing = creditOutgoing(operationMock)
      const expected = operationExpectedMock.outgoing

      expect(outgoing).toEqual(expected)
    })

    it('should build a correct outcoming', () => {
      const outcoming = buildOutcoming(operationMock)
      const expected = operationExpectedMock.outcoming

      expect(outcoming).toEqual(expected)
    })

    it('should build a correct outgoing', () => {
      const outcoming = buildOutgoing(operationMock)
      const expected = operationExpectedMock.outgoing

      expect(outcoming).toEqual(expected)
    })
  })
})
