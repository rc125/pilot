import moment from 'moment'
import {
  assoc,
  merge,
} from 'ramda'
import isRefundable from './isRefundable'
import { transaction as transactionMock } from './mocks/fromRequests.json'

describe('isRefundable', () => {
  it('should return false if status is neither paid nor authorized', () => {
    const transaction = assoc('status', 'processing', transactionMock)
    expect(isRefundable(transaction)).toBe(false)
  })

  it('should return true if status is paid, acquirer is not `rede` and is debit', () => {
    const transaction = merge(transactionMock, {
      acquirer_name: 'pagarme',
      payment_method: 'debit_card',
      status: 'paid',
    })
    expect(isRefundable(transaction)).toBe(true)
  })

  it('should return true if status is paid, acquirer is not `rede` and is credit', () => {
    const transaction = merge(transactionMock, {
      acquirer_name: 'pagarme',
      payment_method: 'credit_card',
      status: 'paid',
    })
    expect(isRefundable(transaction)).toBe(true)
  })

  it('should return true if status is authorized, acquirer is not `rede` and is debit', () => {
    const transaction = merge(transactionMock, {
      acquirer_name: 'pagarme',
      payment_method: 'debit_card',
      status: 'authorized',
    })
    expect(isRefundable(transaction)).toBe(true)
  })

  it('should return true if status is authorized, acquirer is not `rede` and is credit', () => {
    const transaction = merge(transactionMock, {
      acquirer_name: 'pagarme',
      payment_method: 'credit_card',
      status: 'authorized',
    })
    expect(isRefundable(transaction)).toBe(true)
  })

  it('should return false if status is authorized, acquirer is `pagarme` and is boleto', () => {
    const transaction = merge(transactionMock, {
      acquirer_name: 'pagarme',
      payment_method: 'boleto',
      status: 'authorized',
    })
    expect(isRefundable(transaction)).toBe(false)
  })

  it('should return false if status is authorized, acquirer is `development` and is boleto', () => {
    const transaction = merge(transactionMock, {
      acquirer_name: 'development',
      payment_method: 'boleto',
      status: 'authorized',
    })
    expect(isRefundable(transaction)).toBe(false)
  })

  it('should return true if status is paid, acquirer is `pagarme` and is boleto', () => {
    const transaction = merge(transactionMock, {
      acquirer_name: 'pagarme',
      payment_method: 'boleto',
      status: 'paid',
    })
    expect(isRefundable(transaction)).toBe(true)
  })

  it('should return true if status is paid, acquirer is `development` and is boleto', () => {
    const transaction = merge(transactionMock, {
      acquirer_name: 'development',
      payment_method: 'boleto',
      status: 'paid',
    })
    expect(isRefundable(transaction)).toBe(true)
  })

  it('should return true if status is paid, payment_method is debit, acquirer is `rede` and date_created is after current time', () => {
    const transaction = merge(transactionMock, {
      acquirer_name: 'rede',
      date_created: moment().toISOString(),
      payment_method: 'debit_card',
      status: 'paid',
    })
    expect(isRefundable(transaction)).toBe(true)
  })

  it('should return true if status is paid, payment_method is credit, acquirer is `rede` and date_created is after current time', () => {
    const transaction = merge(transactionMock, {
      acquirer_name: 'rede',
      date_created: moment().toISOString(),
      payment_method: 'credit_card',
      status: 'paid',
    })
    expect(isRefundable(transaction)).toBe(true)
  })

  it('should return false if status is paid, payment_method is debit, acquirer is `rede` and date_created is before current time', () => {
    const transaction = merge(transactionMock, {
      acquirer_name: 'rede',
      date_created: moment().subtract(48, 'months').toISOString(),
      payment_method: 'debit_card',
      status: 'paid',
    })
    expect(isRefundable(transaction)).toBe(false)
  })

  it('should return false if status is paid, payment_method is credit, acquirer is `rede` and date_created is before current time', () => {
    const transaction = merge(transactionMock, {
      acquirer_name: 'rede',
      date_created: moment().subtract(48, 'months').toISOString(),
      payment_method: 'credit_card',
      status: 'paid',
    })
    expect(isRefundable(transaction)).toBe(false)
  })

  it('should return true if status is authorized, payment_method is debit, acquirer is `rede` and date_created is after current time', () => {
    const transaction = merge(transactionMock, {
      acquirer_name: 'rede',
      date_created: moment().toISOString(),
      payment_method: 'debit_card',
      status: 'authorized',
    })
    expect(isRefundable(transaction)).toBe(true)
  })

  it('should return true if status is authorized, payment_method is credit, acquirer is `rede` and date_created is after current time', () => {
    const transaction = merge(transactionMock, {
      acquirer_name: 'rede',
      date_created: moment().toISOString(),
      payment_method: 'credit_card',
      status: 'authorized',
    })
    expect(isRefundable(transaction)).toBe(true)
  })

  it('should return false if status is authorized, payment_method is debit, acquirer is `rede` and date_created is before current time', () => {
    const transaction = merge(transactionMock, {
      acquirer_name: 'rede',
      date_created: moment().subtract(48, 'months').toISOString(),
      payment_method: 'debit_card',
      status: 'authorized',
    })
    expect(isRefundable(transaction)).toBe(false)
  })

  it('should return false if status is authorized, payment_method is credit, acquirer is `rede` and date_created is before current time', () => {
    const transaction = merge(transactionMock, {
      acquirer_name: 'rede',
      date_created: moment().subtract(48, 'months').toISOString(),
      payment_method: 'credit_card',
      status: 'authorized',
    })
    expect(isRefundable(transaction)).toBe(false)
  })
})
