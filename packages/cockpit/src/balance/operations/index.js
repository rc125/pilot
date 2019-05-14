import buildRequestPromise from './buildRequest'

const operationsData = client => (query) => {
  const {
    count,
    dates: {
      end: endDate,
      start: startDate,
    },
    page,
    status,
  } = query

  const requestPromise = buildRequestPromise(client, query)

  return requestPromise.then(data => ({
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
