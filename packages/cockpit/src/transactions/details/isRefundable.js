import moment from 'moment'
import {
  F,
  T,
  allPass,
  always,
  anyPass,
  both,
  complement,
  cond,
  either,
  ifElse,
  propEq,
} from 'ramda'

const propNotEq = complement(propEq)

const isCreditOrDebit = either(
  propEq('payment_method', 'credit_card'),
  propEq('payment_method', 'debit_card')
)

const isBoleto = propEq('payment_method', 'boleto')

const isPagarmeOrDevAcquirer = either(
  propEq('acquirer_name', 'pagarme'),
  propEq('acquirer_name', 'development')
)

const isRedeAcquirer = propEq('acquirer_name', 'rede')

const isRefundable = (transaction) => {
  const now = moment()

  const checkPaymentMethodAndAcquirers = cond([
    [both(propNotEq('acquirer_name', 'rede'), isCreditOrDebit), T],
    [
      allPass([
        isBoleto,
        isPagarmeOrDevAcquirer,
        propNotEq('status', 'authorized'),
      ]),
      T,
    ],
    [
      allPass([
        isCreditOrDebit,
        isRedeAcquirer,
        always(now.isBefore(moment(transaction.date_created).endOf('day'))),
      ]),
      T,
    ],
    [T, F],
  ])

  const checkStatus = ifElse(
    anyPass([
      propEq('status', 'paid'),
      propEq('status', 'authorized'),
    ]),
    checkPaymentMethodAndAcquirers,
    F
  )

  return checkStatus(transaction)
}

export default isRefundable

