import { pathOr, propOr } from 'ramda'

const getErrorMessage = ({ message, response }) => {
  if (response && response.errors) {
    const error = response.errors[0]
    return error.message
      ? error.message
      : message
  }

  return message
}

const getErrorName = propOr('unknown', 'name')

const getErrorType = pathOr('unknown', ['response', 'errors', 0, 'type'])

export {
  getErrorMessage,
  getErrorName,
  getErrorType,
}
