import {
  __,
  always,
  apply,
  applySpec,
  assoc,
  either,
  isEmpty,
  isNil,
  map,
  juxt,
  reject,
  path,
  pipe,
  pluck,
  prop,
  propEq,
  subtract,
  sum,
  when,
} from 'ramda'

const transformMovementTypePropTo = (propPath, to) => pipe(
  path(propPath),
  when(either(isNil, isEmpty), always(0)),
  Math.abs,
  assoc('amount', __, { type: to })
)

const buildOperationOutcoming = juxt([
  transformMovementTypePropTo(['amount'], 'payable'),
])

const buildOperationOutgoing = pipe(
  juxt([
    transformMovementTypePropTo(['fraud_coverage_fee'], 'fraud_coverage_fee'),
    transformMovementTypePropTo(['fee'], 'mdr'),
    transformMovementTypePropTo(['anticipation_fee'], 'anticipation_fee'),
  ]),
  reject(propEq('amount', 0))
)

const buildPayableRow = applySpec({
  id: prop('id'),
  installment: prop('installment'),
  type: prop('type'),
  status: prop('status'),
  transactionId: prop('transaction_id'),
  recipientId: prop('recipient_id'),
  paymentMethod: prop('payment_method'),
  anticipationId: prop('bulk_anticipation_id'),
  paymentDate: {
    actual: prop('payment_date'),
    original: prop('original_payment_date'),
  },
  outcoming: buildOperationOutcoming,
  outgoing: buildOperationOutgoing,
  net: pipe(
    juxt([
      pipe(buildOperationOutcoming, pluck('amount'), sum),
      pipe(buildOperationOutgoing, pluck('amount'), sum),
    ]),
    apply(subtract)
  ),
})

export const buildPayableRows = map(buildPayableRow)

const payables = (client, filters) =>
  client.payables.all(filters)
    .then(buildPayableRows)

export default payables
