
import {
  isNegative,
  transformMovementTypePropTo,
  buildNetAmount,
  getOperationDate,
  getSourceId,
  getTargetId,
  getTransactionId,
  getType,
} from './shared'
import operationMock from '../mocks/operation/received.json'
import operationExpectedMock from '../mocks/operation/expected.json'
import payableMock from '../mocks/payable/received.json'

describe('Transform movement prop', () => {
  it('should create a correct object with amount and type from the given prop', () => {
    const operation = {
      fee: null,
    }

    const expected = {
      amount: 0,
      type: 'mdr',
    }

    const transform = transformMovementTypePropTo(['fee'], 'mdr')

    expect(transform(operation)).toEqual(expected)
  })
})

describe('Is negative', () => {
  const exampleObject = {
    batata: -1,
    xuxu: 0,
  }

  it('should return true when a object prop is negative', () => {
    expect(isNegative('batata', exampleObject)).toBe(true)
  })

  it('should return false when a object prop is zero or positive', () => {
    expect(isNegative('xuxu', exampleObject)).toBe(false)
  })
})

describe('Get net amount builder', () => {
  it('should create a function which calls the received functions', () => {
    const outcoming = jest.fn()
    const outgoing = jest.fn()
    outcoming.mockReturnValue([{
      type: 'payable',
      amount: 0,
    }])
    outgoing.mockReturnValue([{
      type: 'mdr',
      amount: 0,
    }])
    const builder = buildNetAmount(outcoming, outgoing)

    expect(outcoming).not.toBeCalled()
    expect(outgoing).not.toBeCalled()

    builder([])

    expect(outcoming).toBeCalled()
    expect(outgoing).toBeCalled()
  })

  it('should create a correct output given outcoming and outgoing functions', () => {
    const outcoming = jest.fn()
    const outgoing = jest.fn()
    outcoming.mockReturnValue([{
      type: 'payable',
      amount: 100,
    }])
    outgoing.mockReturnValue([{
      type: 'mdr',
      amount: 0,
    }])
    const builder = buildNetAmount(outcoming, outgoing)
    const output = builder([])

    expect(output).toEqual(100)
  })
})

describe('Get operation date', () => {
  it('should get the operation dates correctly', () => {
    const expectedDates = operationExpectedMock.payment_date
    const getPaymentDate = getOperationDate('payment_date', 'date_created')
    const getOriginalPaymentDate = getOperationDate('original_payment_date')
    const dates = {
      actual: getPaymentDate(operationMock),
      original: getOriginalPaymentDate(operationMock),
    }

    expect(dates).toEqual(expectedDates)
  })
})

describe('Get source id', () => {
  it('should get the correct source id', () => {
    const sourceId = getSourceId(operationMock)
    const expected = operationExpectedMock.sourceId

    expect(sourceId).toEqual(expected)
  })
})

describe('Get target', () => {
  it('should get the correct target id', () => {
    const targetId = getTargetId(operationMock)
    const expected = operationExpectedMock.targetId

    expect(targetId).toEqual(expected)
  })
})

describe('Get transaction id', () => {
  it('should get the transaction id correctly from an operation', () => {
    const transacitonId = getTransactionId(operationMock)

    expect(transacitonId).toBe(1785141)
  })

  it('should get the transaction id correctly from a payable', () => {
    const transacitonId = getTransactionId(payableMock)

    expect(transacitonId).toBe(6293604)
  })
})

describe('Get type', () => {
  it('should get a correct type from an operation', () => {
    const type = getType(operationMock)

    expect(type).toBe('credit_card')
  })

  it('should get a correct type from a payable', () => {
    const type = getType(payableMock)

    expect(type).toBe('credit_card')
  })

  it('should retrun "boletoRefundFee" when receive a refund operation with movement type boleto', () => {
    const operation = {
      ...operationMock,
      movement_object: {
        ...operationMock.movement_object,
        type: 'boleto',
      },
      type: 'refund',
    }
    const type = getType(operation)

    expect(type).toBe('boletoRefundFee')
  })

  it('should return the received movement type when the operation is not boleto refund neither credit', () => {
    const operation = {
      ...operationMock,
      movement_object: {
        ...operationMock.movement_object,
        type: 'batata',
      },
      type: 'batata',
    }

    const type = getType(operation)

    expect(type).toBe('batata')
  })
})
