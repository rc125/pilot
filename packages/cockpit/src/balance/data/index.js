import Promise from 'bluebird'
import {
  always,
  isNil,
  when,
} from 'ramda'

import buildResult from './result'

const getValidStatus = when(
  isNil,
  always('available')
)

const data = client => (recipientId, {
  count,
  dates: {
    end: endDate,
    start: startDate,
  },
  page,
  status,
} = {}) =>
  Promise.props({
    balance: client.balance.find({ recipientId }),
    bulk_anticipations_pending: client.bulkAnticipations.find({
      recipientId,
      status: 'pending',
    }),
    recipient: client.recipients.find({ id: recipientId }),
  })
    .then(buildResult({
      count,
      dates: {
        end: endDate,
        start: startDate,
      },
      page,
      status: getValidStatus(status),
    }))


export default data
