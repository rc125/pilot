import { omit } from 'ramda'
import buildRequestPromise from './buildRequest'

const ignoredProps = ['status', 'recipientId']

const operationsData = client => (query) => {
  const requestPromise = buildRequestPromise(client, query)

  return requestPromise.then(data => ({
    query: omit(ignoredProps, query),
    result: {
      search: {
        operations: {
          count: 1000,
          offset: 0,
          rows: data,
          total: 0,
        },
      },
    },
  }))
}

export default operationsData
