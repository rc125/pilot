import {
  always,
  applySpec,
  head,
  ifElse,
  isNil,
  join,
  juxt,
  last,
  path,
  pipe,
  prop,
} from 'ramda'
import { buildPendingRequest } from '../../bulkAnticipations'

const getWithDv = propName => pipe(
  juxt([
    path(['bank_account', propName]),
    path(['bank_account', `${propName}_dv`]),
  ]),
  ifElse(
    pipe(last, isNil),
    head,
    join('-')
  )
)

const buildRecipient = pipe(
  prop('recipient'),
  applySpec({
    id: prop('id'),
    name: path(['bank_account', 'legal_name']),
    bank_account: {
      account: getWithDv('conta'),
      agency: getWithDv('agencia'),
      bank_code: path(['bank_account', 'bank_code']),
      id: path(['bank_account', 'id']),
      type: path(['bank_account', 'type']),
    },
  })
)

const buildBalance = applySpec({
  amount: path(['balance', 'available', 'amount']),
  available: {
    withdrawal: path(['balance', 'available', 'amount']),
  },
  outcoming: path(['balance', 'waiting_funds', 'amount']),
})

const buildRequests = pipe(
  prop('bulk_anticipations_pending'),
  buildPendingRequest
)

const buildResult = query => applySpec({
  query: always(query),
  result: {
    balance: buildBalance,
    recipient: buildRecipient,
    requests: buildRequests,
  },
})

export default buildResult
