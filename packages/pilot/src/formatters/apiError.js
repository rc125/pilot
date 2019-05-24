import { path } from 'ramda'
import { getErrorMessage, getErrorName, getErrorType } from './error'

const getResponseErrorStatus = ({ response, status }) => (
  response && response.status
    ? response.status
    : status
)

const getResponseError = (responseError) => {
  // eslint-disable-next-line no-undef
  const affectedRoute = window.location.hash.replace(/#/g, '')

  if (responseError) {
    return {
      affectedRoute,
      message: getErrorMessage(responseError),
      method: path(['response', 'method'], responseError),
      name: getErrorName(responseError),
      source: 'api',
      status: getResponseErrorStatus(responseError),
      type: getErrorType(responseError),
      url: path(['response', 'url'], responseError),
    }
  }

  return null
}

export default getResponseError

export {
  getErrorMessage as getResponseErrorMessage,
  getErrorName as getResponseErrorName,
  getResponseErrorStatus,
}
