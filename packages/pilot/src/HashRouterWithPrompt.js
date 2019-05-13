import React, { Component, Fragment } from 'react'
import { translate } from 'react-i18next'
import PropTypes from 'prop-types'

import { compose } from 'ramda'

import { HashRouter } from 'react-router-dom'

import { Spacing } from 'former-kit'
import ConfirmModal from '../src/components/ConfirmModal'

import style from './style.css'

const enhanced = compose(translate())

class HashRouterWithPrompt extends Component {
  constructor (props) {
    super(props)

    this.state = {
      callback: null,
      message: null,
    }

    this.getUserConfirmation = this.getUserConfirmation.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleConfirmationClick = this.handleClick.bind(this, true)
    this.handleCancelClick = this.handleClick.bind(this, false)
  }

  getUserConfirmation (message, callback) {
    this.setState({
      callback,
      message,
    })
  }

  handleClick (isValid) {
    const { callback } = this.state
    callback(isValid)
    this.setState({
      callback: null,
      message: null,
    })
  }

  render () {
    const {
      children,
      t,
    } = this.props
    const {
      callback,
      message,
    } = this.state

    return (
      <Fragment>
        {callback && message &&
          <ConfirmModal
            isOpen
            onCancel={this.handleCancelClick}
            onConfirm={this.handleConfirmationClick}
            title={t('prompt.title')}
            cancelText={t('prompt.deny')}
            confirmText={t('prompt.confirm')}
          >
            <Spacing />
            <div className={style.messageContainer}>
              {t('prompt.message')}
            </div>
            <Spacing />
          </ConfirmModal>
        }
        <HashRouter getUserConfirmation={this.getUserConfirmation}>
          {children}
        </HashRouter>
      </Fragment>
    )
  }
}

HashRouterWithPrompt.propTypes = {
  children: PropTypes.node.isRequired,
  t: PropTypes.func.isRequired,
}

export default enhanced(HashRouterWithPrompt)
