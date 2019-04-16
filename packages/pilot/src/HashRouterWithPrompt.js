import React, { Component, Fragment } from 'react'
import { translate } from 'react-i18next'
import PropTypes from 'prop-types'
import IconClose from 'emblematic-icons/svg/ClearClose32.svg'

import { compose } from 'ramda'

import {
  Button,
  Modal,
  ModalActions,
  ModalContent,
  ModalTitle,
  Spacing,
} from 'former-kit'

import { HashRouter } from 'react-router-dom'

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
          <Modal
            isOpen
            onRequestClose={this.handleCancelClick}
          >
            <ModalTitle
              title={t('prompt.title')}
              closeIcon={<IconClose width={16} height={16} />}
              onClose={this.handleCancelClick}
            />
            <ModalContent>
              <hr />
              <div className={style.messageContainer}>
                { message }
              </div>
            </ModalContent>
            <Spacing />
            <ModalActions>
              <Spacing />
              <Button
                onClick={this.handleCancelClick}
                fill="outline"
              >
                {t('prompt.deny')}
              </Button>
              <Button
                onClick={this.handleConfirmationClick}
                fill="gradient"
              >
                {t('prompt.confirm')}
              </Button>
              <Spacing />
            </ModalActions>
          </Modal>
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
