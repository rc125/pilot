import {
  append,
  concat,
  defaultTo,
  difference,
  equals,
  head,
  ifElse,
  includes,
  is,
  pipe,
  prop,
  reduce,
  reject,
  test,
  uncurryN,
  unless,
  when,
  where,
} from 'ramda'

import {
  API_ERROR_RECEIVE,
  CLEAR_ALL_ERRORS,
  CLEAR_ERROR,
  CLEAR_LOCAL_ERRORS,
  REACT_ERROR_RECEIVE,
} from './actions'
import getResponseError from '../../formatters/apiError'
import getReactError from '../../formatters/reactError'
import errorTemplates from '../../errors'

const initialState = []

const addNewError = uncurryN(2, err => unless(
  includes(err),
  append(err)
))

const removeError = uncurryN(2, err => when(
  includes(err),
  reject(equals(err))
))

const removeRouteQuery = route =>
  head(route.split('?'))

const passAnyRoute = uncurryN(2, route => reduce(
  (passedAnyRoute, item) => passedAnyRoute || item.test(route),
  false
))

const passExactRoute = uncurryN(2, route => reduce(
  pipe(
    (passedAnyRoute, regex) => passedAnyRoute || regex.exec(route),
    defaultTo([]),
    head,
    equals(route)
  ),
  false
))

const regexTest = uncurryN(2, propName => pipe(
  prop(propName),
  ifElse(
    is(RegExp),
    test,
    equals
  )
))

const regexApiErrorTests = uncurryN(2, errorTemplate => where({
  message: regexTest('message', errorTemplate),
  method: regexTest('method', errorTemplate),
  name: regexTest('name', errorTemplate),
  status: regexTest('status', errorTemplate),
  type: regexTest('type', errorTemplate),
}))

const matchesApiError = (error, errorTemplate) => {
  const hasRoute = is(Array, errorTemplate.affectedRoutes)
    ? passAnyRoute(error.affectedRoute, errorTemplate.affectedRoutes)
    : true

  const validationPasses = errorTemplate.validation
    ? errorTemplate.validation()
    : true

  if (!hasRoute || !validationPasses) return false

  return regexApiErrorTests(errorTemplate, error)
}

const regexReactErrorTests = uncurryN(2, errorTemplate => where({
  message: regexTest('message', errorTemplate),
  name: regexTest('name', errorTemplate),
  source: regexTest('source', errorTemplate),
}))

const matchesReactError = (error, errorTemplate) => {
  const hasRoute = is(Array, errorTemplate.affectedRoutes)
    ? passAnyRoute(error.affectedRoute, errorTemplate.affectedRoutes)
    : true

  if (!hasRoute) return false

  return regexReactErrorTests(errorTemplate, error)
}

const findError = (error, errors) => {
  const sameRouteErrors = errors.filter(({ affectedRoutes }) =>
    passExactRoute(error.affectedRoute, affectedRoutes))

  const differentRouteErrors = difference(errors, sameRouteErrors)
  const sameRouteErrorsFirst = concat(sameRouteErrors, differentRouteErrors)

  const foundError = sameRouteErrorsFirst.find((errorTemplate) => {
    if (error.source === 'api') {
      return matchesApiError(error, errorTemplate)
    }

    return matchesReactError(error, errorTemplate)
  })

  return foundError
}

const addErrorComponent = (error) => {
  const errorTemplate = findError(error, errorTemplates)

  if (errorTemplate) {
    const { getComponent } = errorTemplate

    const localized = error.source === 'react'
      ? t => ({
        message: t(error.message),
        title: t('pages.error.application_title'),
      })
      : errorTemplate.localized

    return {
      ...error,
      getComponent,
      localized,
      priority: !!getComponent,
    }
  }

  return error
}

const addError = (error, state) => {
  const errorWithoutQuery = {
    ...error,
    affectedRoute: removeRouteQuery(error.affectedRoute),
  }

  const errorWithComponent = addErrorComponent(errorWithoutQuery)
  return addNewError(errorWithComponent, state)
}

export default function errorReducer (state = initialState, action) {
  switch (action.type) {
    case API_ERROR_RECEIVE: {
      const error = getResponseError(action.payload)

      return addError(
        error,
        state
      )
    }

    case REACT_ERROR_RECEIVE: {
      const error = getReactError(action.payload)

      return addError(
        error,
        state
      )
    }

    case CLEAR_ERROR: {
      const error = action.payload

      const errorTemplate = findError(error, state)

      const newState = removeError(errorTemplate, state)

      return newState
    }

    case CLEAR_LOCAL_ERRORS: {
      const priorityErrors = state.filter(error => error.priority)
      return priorityErrors
    }

    case CLEAR_ALL_ERRORS:
      return initialState

    default:
      return state
  }
}
