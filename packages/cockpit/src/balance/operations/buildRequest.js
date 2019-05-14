import moment from 'moment'
import {
  curry,
  ifElse,
  propEq,
  uncurryN,
} from 'ramda'
import formatPayablesRows from './payables'
import formatOperationsRows from './operations'

export const buildBaseQuery = ({
  count,
  dates: {
    end: endDate,
    start: startDate,
  },
  page,
  recipientId,
}) => ({
  count,
  end_date: moment(endDate).valueOf(),
  page,
  recipient_id: recipientId,
  start_date: moment(startDate).valueOf(),
})

export const buildPayablesQuery = query => ({
  ...buildBaseQuery(query),
  status: ['waiting_funds', 'pre_paid'],
})

export const buildPayablesRequest = curry((client, query) => {
  const payablesQuery = buildPayablesQuery(query)

  return client.payables
    .all(payablesQuery)
    .then(formatPayablesRows)
})

export const buildOperationsRequest = curry((client, query) => {
  const operationsQuery = buildBaseQuery(query)

  return client.balanceOperations
    .find(operationsQuery)
    .then(formatOperationsRows)
})

const buildRequestPromise = uncurryN(2, client => ifElse(
  propEq('timeframe', 'future'),
  buildPayablesRequest(client),
  buildOperationsRequest(client)
))

export default buildRequestPromise
