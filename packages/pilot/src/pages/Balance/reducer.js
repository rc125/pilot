import {
  BALANCE_REQUEST,
  BALANCE_RECEIVE,
} from './actions'

const initialState = {
  balanceError: null,
  loading: true,
  query: null,
}

export default function balanceReducer (state, action) {
  switch (action.type) {
    case BALANCE_REQUEST: {
      const {
        payload: {
          query,
        },
      } = action

      return {
        balanceError: null,
        loading: true,
        query,
      }
    }

    case BALANCE_RECEIVE: {
      const {
        balanceError,
        payload,
        payload: {
          query,
        },
      } = action

      if (balanceError) {
        return {
          balanceError: payload.response || {},
          loading: false,
          query,
        }
      }

      return {
        balanceError: null,
        loading: false,
        query,
      }
    }

    default:
      return state || initialState
  }
}
