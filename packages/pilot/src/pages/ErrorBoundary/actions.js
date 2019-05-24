import { createAction } from 'redux-actions'

export const API_ERROR_RECEIVE = 'pilot/error/API_ERROR_RECEIVE'
export const receiveError = createAction(API_ERROR_RECEIVE)

export const REACT_ERROR_RECEIVE = 'pilot/error/REACT_ERROR_RECEIVE'
export const receiveReactError = createAction(REACT_ERROR_RECEIVE)

export const CLEAR_ERROR = 'pilot/error/CLEAR_ERROR'
export const clearError = createAction(CLEAR_ERROR)

export const CLEAR_ALL_ERRORS = 'pilot/error/CLEAR_ALL_ERRORS'
export const clearAllErrors = createAction(CLEAR_ALL_ERRORS)

export const CLEAR_LOCAL_ERRORS = 'pilot/error/CLEAR_LOCAL_ERRORS'
export const clearLocalErrors = createAction(CLEAR_LOCAL_ERRORS)
