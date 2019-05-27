import {
  juxt,
  reject,
  pipe,
  prop,
  propEq,
} from 'ramda'
import {
  formatRows,
  transformMovementTypePropTo,
} from './shared'

export const buildOutcoming = juxt([
  transformMovementTypePropTo(['amount'], 'payable'),
])

export const buildOutgoing = pipe(
  juxt([
    transformMovementTypePropTo(['fraud_coverage_fee'], 'fraud_coverage_fee'),
    transformMovementTypePropTo(['fee'], 'mdr'),
    transformMovementTypePropTo(['anticipation_fee'], 'anticipation_fee'),
  ]),
  reject(propEq('amount', 0))
)

export const getInstallment = prop('installment')

export default formatRows({
  buildOutcoming,
  buildOutgoing,
  getInstallment,
})
