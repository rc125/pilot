import {
  call,
  path,
} from 'ramda'

import {
  ANTICIPABLE_LIMITS_REQUEST,
  ANTICIPABLE_LIMITS_RECEIVE,
  ANTICIPABLE_LIMITS_FAIL,
  DESTROY_ANTICIPATION_REQUEST,
} from './actions'

const initialState = {
  limits: {
    max: null,
    min: null,
  },
  limitsError: null,
  loading: true,
}

const getLimitsProp = propName => path([propName, 'amount'])

export default function anticipationReducer (state = initialState, action) {
  switch (action.type) {
    case ANTICIPABLE_LIMITS_REQUEST: {
      return {
        limits: state.limits,
        limitsError: null,
        loading: true,
      }
    }

    case ANTICIPABLE_LIMITS_RECEIVE: {
      const {
        payload,
      } = action

      return {
        limits: {
          max: call(getLimitsProp('maximum'), payload),
          min: call(getLimitsProp('minimum'), payload),
        },
        limitsError: null,
        loading: false,
      }
    }

    case ANTICIPABLE_LIMITS_FAIL: {
      const {
        payload,
      } = action

      return {
        ...state,
        limitsError: payload,
        loading: false,
      }
    }

    case DESTROY_ANTICIPATION_REQUEST: {
      return {
        ...state,
        loading: true,
      }
    }

    default: {
      return state
    }
  }
}
