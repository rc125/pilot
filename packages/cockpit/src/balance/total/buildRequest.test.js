import buildRequest from './buildRequest'
import expectedOperationsTotal from '../mocks/total/operations/expected.json'
import expectedPayablesTotal from '../mocks/total/payables/expected.json'
import receivedOperations from '../mocks/total/operations/received.json'
import receivedPayables from '../mocks/total/payables/received.json'

describe('total request', () => {
  const operationsDays = jest.fn()
    .mockImplementation(() => Promise.resolve(receivedOperations))
  const payablesDays = jest.fn()
    .mockImplementation(() => Promise.resolve(receivedPayables))
  const client = {
    balanceOperations: {
      days: operationsDays,
    },
    payables: {
      days: payablesDays,
    },
  }

  describe('operations request', () => {
    const query = {
      dates: {
        end: '2018-03-20T03:00:00.000Z',
        start: '2018-03-13T03:00:00.000Z',
      },
      recipientId: 're_abc',
      status: 'available',
      timeframe: 'past',
    }
    let operationsTotal
    it('should called the request fucntion', async () => {
      operationsTotal = await buildRequest(client, query)
      expect(operationsDays).toBeCalled()
    })
    it('should created a correct total object', () => {
      expect(operationsTotal).toEqual(expectedOperationsTotal)
    })
  })

  describe('payables request', () => {
    const query = {
      dates: {
        end: '2019-06-24T03:00:00.000Z',
        start: '2019-06-11T03:00:00.000Z',
      },
      recipientId: 're_abc',
      status: 'waiting_funds',
      timeframe: 'future',
    }
    let payablesTotal
    it('should called the request fucntion', async () => {
      payablesTotal = await buildRequest(client, query)
      expect(payablesDays).toBeCalled()
    })
    it('should created a correct total object', () => {
      expect(payablesTotal).toEqual(expectedPayablesTotal)
    })
  })
})
