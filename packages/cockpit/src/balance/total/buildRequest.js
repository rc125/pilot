import moment from 'moment'
import {
  always,
  curry,
  ifElse,
  isNil,
  propEq,
  uncurryN,
  when,
} from 'ramda'
import formatPayablesRows from './payables'
import formatOperationsRows from './operations'

const buildBaseQuery = ({
  dates: {
    end,
    start,
  },
  recipientId,
}) => ({
  recipient_id: recipientId,
  end_date: moment(end).valueOf(),
  start_date: moment(start).valueOf(),
})

const getValidStatus = when(
  isNil,
  always('available')
)

const buildOperationsQuery = query => ({
  ...buildBaseQuery(query),
  status: getValidStatus(query.status),
})

const buildPayablesQuery = query => ({
  ...buildBaseQuery(query),
  /*
    Este parametro de status vai ficar fixo como waiting_funds
    até que o a issue https://github.com/pagarme/pagarme-core/issues/1973 do
    pagarme-core seja resolvida, isso deve acontecer no próximo RT.
    O valor que deverá ser utilizado é o seguinte
    ['waiting_funds', 'pre_paid']
  */
  status: 'waiting_funds',
})

const buildPayablesRequest = curry((client, query) => {
  const payablesQuery = buildPayablesQuery(query)

  return client.payables
    .days(payablesQuery)
    .then(formatPayablesRows)
})

const buildOperationsRequest = curry((client, query) => {
  const operationsQuery = buildOperationsQuery(query)

  return client.balanceOperations
    .days(operationsQuery)
    .then(formatOperationsRows)
})

const buildRequestPromise = uncurryN(2, client => ifElse(
  propEq('timeframe', 'future'),
  buildPayablesRequest(client),
  buildOperationsRequest(client)
))

export default buildRequestPromise
