import { getErrorMessage, getErrorName } from './error'

const getReactError = ({ error }) => {
  // eslint-disable-next-line no-undef
  const affectedRoute = window.location.hash.replace(/#/g, '')

  if (error) {
    return {
      affectedRoute,
      message: getErrorMessage(error),
      name: getErrorName(error),
      source: 'react',
    }
  }

  return null
}

export default getReactError
