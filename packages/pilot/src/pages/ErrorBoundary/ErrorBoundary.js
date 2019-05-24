import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  applyTo,
  both,
  compose,
  complement,
  equals,
  evolve,
  find,
  is,
  isNil,
  pipe,
  prop,
  propEq,
  propSatisfies,
  uncurryN,
  when,
} from 'ramda'
import { withRouter } from 'react-router-dom'
import { translate } from 'react-i18next'

import {
  clearLocalErrors,
  receiveReactError,
} from '.'

const mapStateToProps = ({ errors }) => ({ errors })

const mapDispatchToProps = dispatch => ({
  clearErrors: () => dispatch(clearLocalErrors()),
  receiveError: (error, stack) => {
    dispatch(receiveReactError({ error, stack }))
  },
})

const enhanced = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  withRouter,
  translate()
)

const isAffectedRoute = route => pipe(
  prop('affectedRoute'),
  equals(route)
)

const findInErrorsRoutes = uncurryN(2, route => find(isAffectedRoute(route)))

const isObject = both(is(Object), complement(isNil))

const isNotNilProp = property => propSatisfies(complement(isNil), property)

const isLocalizedError = both(isObject, isNotNilProp('localized'))

const applyLocalizedTranslation = t => evolve({ localized: applyTo(t) })

const localizeError = uncurryN(2, t => when(
  isLocalizedError,
  applyLocalizedTranslation(t)
))

const findPriorityError = find(propEq('priority', true))

class ErrorBoundary extends Component {
  constructor () {
    super()

    this.cloneChild = this.cloneChild.bind(this)
    this.handleError = this.handleError.bind(this)
  }

  componentDidCatch (error) {
    this.props.receiveError(error)
  }

  componentWillUnmount () {
    const {
      clearErrors,
      errors,
      t,
    } = this.props
    const prioritaryError = localizeError(t, findPriorityError(errors))

    if (!prioritaryError) {
      clearErrors()
    }
  }

  handleError (error, affectedRoutes = []) {
    const { location: { pathname } } = this.props

    this.props.receiveError({
      affectedRoutes: [...affectedRoutes, pathname],
      error,
    })
  }

  cloneChild (child) {
    const {
      errors,
      location: { pathname },
      t,
    } = this.props

    const filteredError = localizeError(t, findInErrorsRoutes(pathname, errors))

    return React.cloneElement(
      child,
      {
        error: filteredError,
        throwError: this.handleError,
      }
    )
  }

  render () {
    const {
      children,
      errors,
      t,
    } = this.props
    const prioritaryError = localizeError(t, findPriorityError(errors))

    if (prioritaryError) {
      return prioritaryError.getComponent(prioritaryError.localized)
    }

    return React.Children.map(children, this.cloneChild)
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  clearErrors: PropTypes.func.isRequired,
  errors: PropTypes.arrayOf(PropTypes.shape({
    affectedRoute: PropTypes.string.isRequired,
    getComponent: PropTypes.func,
    localized: PropTypes.func,
    message: PropTypes.string.isRequired,
    method: PropTypes.string,
    name: PropTypes.string.isRequired,
    priority: PropTypes.bool.isRequired,
    source: PropTypes.string.isRequired,
    status: PropTypes.number,
    type: PropTypes.string.isRequired,
    url: PropTypes.string,
  })),
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  receiveError: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
}

ErrorBoundary.defaultProps = {
  errors: null,
}

export default enhanced(ErrorBoundary)
