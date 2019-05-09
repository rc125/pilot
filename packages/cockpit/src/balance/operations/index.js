import moment from 'moment'
import fetchPayables from './payables'

const operationsData = client => ({
  count,
  dates: {
    end: endDate,
    start: startDate,
  },
  page,
  recipientId,
  status,
  type,
}) => fetchPayables(client, {
  count,
  end_date: moment(endDate).valueOf(),
  page,
  recipient_id: recipientId,
  status,
  start_date: moment(startDate).valueOf(),
  type,
})
  .then(data => ({
    query: {
      count,
      dates: {
        end: endDate,
        start: startDate,
      },
      page,
      status,
    },
    result: {
      search: {
        operations: {
          count: 0,
          offset: 0,
          rows: data,
          total: 0,
        },
      },
    },
  }))

export default operationsData
