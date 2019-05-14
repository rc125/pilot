import buildRequest from './buildRequest'
import operationsExpectedMock from '../mocks/operations/expected.json'
import operationsMock from '../mocks/operations/received.json'
import payablesExpectedMock from '../mocks/payables/expected.json'
import payablesMock from '../mocks/payables/received.json'

describe('Build request promise', () => {
  it('should return a operations promise when the time frame is not future', async () => {
    const find = jest.fn()
      .mockImplementation(() => Promise.resolve(operationsMock))
    const client = {
      balanceOperations: {
        find,
      },
    }
    const query = {
      count: 10,
      dates: {
        end: '2019-05-14T20:21:31.019Z',
        start: '2019-05-07T20:21:31.019Z',
      },
      page: 1,
      recipientId: 're_abc',
      timeframe: 'past',
    }
    const rows = await buildRequest(client, query)

    expect(find).toBeCalled()
    expect(rows).toEqual(operationsExpectedMock)
  })

  it('should return a payables promise when the time frame is future', async () => {
    const all = jest.fn()
      .mockImplementation(() => Promise.resolve(payablesMock))
    const client = {
      payables: {
        all,
      },
    }
    const query = {
      count: 10,
      dates: {
        end: '2019-05-14T20:21:31.019Z',
        start: '2019-05-07T20:21:31.019Z',
      },
      page: 1,
      recipientId: 're_abc',
      timeframe: 'future',
    }
    const rows = await buildRequest(client, query)

    expect(all).toBeCalled()
    expect(rows).toEqual(payablesExpectedMock)
  })
})
