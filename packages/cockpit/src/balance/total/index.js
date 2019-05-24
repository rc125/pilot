import buildRequest from './buildRequest'

const total = client => (recipientId, query) =>
  buildRequest(client, { recipientId, ...query })

export default total
