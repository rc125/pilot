import {
  __,
  always,
  both,
  cond,
  ifElse,
  includes,
  juxt,
  of as ofRamda,
  pathEq,
  pathOr,
  pathSatisfies,
  pipe,
  propEq,
  reject,
} from 'ramda'

import {
  isNegative,
  transformMovementTypePropTo,
  formatRows,
} from './shared'

const compareMovementTypeTo = type => pathEq(['movement_object', 'type'], type)

export const isRefundOrChargeBack = pathSatisfies(
  includes(__, ['chargeback', 'refund']),
  ['movement_object', 'type']
)

export const refundOrChargeBackOutcoming = juxt([
  transformMovementTypePropTo(['fee'], 'mdr'),
])

export const refundOrChargeBackOutgoing = juxt([
  transformMovementTypePropTo(['amount'], 'payable'),
])

export const isTedTransfer = both(
  propEq('type', 'transfer'),
  compareMovementTypeTo('ted')
)

export const zeroTransferAmount = always({
  amount: 0,
  type: 'payable',
})

export const tedTransferOutgoing = juxt([
  transformMovementTypePropTo(['fee'], 'tedFee'),
  transformMovementTypePropTo(['amount'], 'payable'),
])

export const isInterRecipientTransfer = both(
  propEq('type', 'transfer'),
  compareMovementTypeTo('inter_recipient')
)

export const interRecipientTransferOutcoming = juxt([
  ifElse(
    isNegative('amount'),
    zeroTransferAmount,
    transformMovementTypePropTo(['amount'], 'payable')
  ),
])

export const interRecipientTransferOutgoing = juxt([
  ifElse(
    isNegative('amount'),
    transformMovementTypePropTo(['amount'], 'payable'),
    zeroTransferAmount
  ),
])

export const isBoletoRefund = both(
  propEq('type', 'refund'),
  compareMovementTypeTo('boleto')
)

export const boletoRefundFeeOutgoing = juxt([
  transformMovementTypePropTo(['fee'], 'tedFee'),
])

export const boletoRefundFeeOutcoming = juxt([
  transformMovementTypePropTo(['amount'], 'payable'),
])

export const isCredit = both(
  propEq('type', 'payable'),
  compareMovementTypeTo('credit')
)

export const creditOutcoming = juxt([
  transformMovementTypePropTo(['movement_object', 'amount'], 'payable'),
])

export const creditOutgoing = pipe(
  juxt([
    transformMovementTypePropTo(['movement_object', 'fee'], 'mdr'),
    transformMovementTypePropTo(
      ['movement_object', 'anticipation_fee'],
      'anticipation_fee'
    ),
    transformMovementTypePropTo(
      ['movement_object', 'fraud_coverage_fee'],
      'fraud_coverage_fee'
    ),
  ]),
  reject(propEq('amount', 0))
)

export const buildOutcoming = cond([
  [
    isRefundOrChargeBack,
    refundOrChargeBackOutcoming,
  ],
  [
    isTedTransfer,
    pipe(
      zeroTransferAmount,
      ofRamda
    ),
  ],
  [
    isInterRecipientTransfer,
    interRecipientTransferOutcoming,
  ],
  [
    isBoletoRefund,
    boletoRefundFeeOutcoming,
  ],
  [
    isCredit,
    creditOutcoming,
  ],
])

export const buildOutgoing = cond([
  [
    isRefundOrChargeBack,
    refundOrChargeBackOutgoing,
  ],
  [
    isTedTransfer,
    tedTransferOutgoing,
  ],
  [
    isInterRecipientTransfer,
    interRecipientTransferOutgoing,
  ],
  [
    isBoletoRefund,
    boletoRefundFeeOutgoing,
  ],
  [
    isCredit,
    creditOutgoing,
  ],
])

export const getInstallment = ifElse(
  pathEq(['movement_object', 'payment_method'], 'boleto'),
  always(null),
  pathOr(null, ['movement_object', 'installment'])
)

export default formatRows({
  buildOutcoming,
  buildOutgoing,
  getInstallment,
})
