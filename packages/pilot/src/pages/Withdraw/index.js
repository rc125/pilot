import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import moment from 'moment'
import {
  always,
  compose,
  cond,
  contains,
  equals,
  isNil,
  path,
  pathOr,
} from 'ramda'
import { translate } from 'react-i18next'
import { Alert } from 'former-kit'
import IconError from 'emblematic-icons/svg/ClearClose32.svg'
import WithdrawContainer from '../../containers/Withdraw'
import partnersBankCodes from '../../models/partnersBanksCodes'
import env from '../../environment'

import { receiveWithdraw } from './actions/'
import { withError } from '../ErrorBoundary'

const mapStateToProps = ({
  account: {
    client,
    company: {
      pricing,
    } = {},
  },
}) => ({
  client,
  pricing,
})

const mapDispatchToProps = ({
  onWithdrawReceive: receiveWithdraw,
})

const enhanced = compose(
  translate('translations'),
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  withRouter,
  withError
)

const getDefaultRecipient = client => (
  client.company.current()
    .then(path(['default_recipient_id', env]))
    .then(id => (
      Promise.all([
        client.recipients.find({ id }),
        client.recipient.balance(id),
      ])
        .then(([recipientData, balance]) => (
          { ...recipientData, balance }
        ))
    ))
)

const getRecipientById = (id, client) => (
  client.recipients.find({ id })
    .then(recipient => (
      Promise.all([
        Promise.resolve(recipient),
        client.recipient.balance(id),
      ])
        .then(([recipientData, balance]) => (
          { ...recipientData, balance }
        ))
    ))
)

const getAvailableAmount = pathOr(null, ['balance', 'available', 'amount'])

const stepsId = {
  confirmation: 'confirmation',
  data: 'data',
  result: 'result',
}

const defaultStepsState = {
  currentStep: stepsId.data,
  statusMessage: '',
  stepsStatus: {
    [stepsId.data]: 'current',
    [stepsId.confirmation]: 'pending',
    [stepsId.result]: 'pending',
  },
}

const getStepsStatus = (nextStep, nextStepStatus) => {
  const buildStepsStatus = cond([
    [
      equals(stepsId.data),
      always({
        confirmation: 'pending',
        data: nextStepStatus,
        result: 'pending',
      }),
    ],
    [
      equals(stepsId.confirmation),
      always({
        confirmation: nextStepStatus,
        data: 'success',
        result: 'pending',
      }),
    ],
    [
      equals(stepsId.result),
      always({
        confirmation: 'success',
        data: 'success',
        result: nextStepStatus,
      }),
    ],
  ])

  return buildStepsStatus(nextStep)
}

class Withdraw extends Component {
  constructor (props) {
    super(props)

    this.state = {
      ...defaultStepsState,
      confirmationDisabledButtons: false,
      confirmationPasswordError: '',
      requested: '0',
    }

    this.createTransfer = this.createTransfer.bind(this)
    this.goTo = this.goTo.bind(this)
    this.handleConfirmationConfirm = this.handleConfirmationConfirm.bind(this)
    this.handleRequestChange = this.handleRequestChange.bind(this)
    this.handleTryAgain = this.handleTryAgain.bind(this)
    this.getTransferCost = this.getTransferCost.bind(this)
  }

  componentDidMount () {
    const {
      client,
      history,
      match: {
        params: {
          id,
        },
      },
    } = this.props

    let recipientPromise

    if (!id) {
      recipientPromise = getDefaultRecipient(client)
    } else {
      recipientPromise = getRecipientById(id, client)
    }

    recipientPromise
      .then((recipient) => {
        this.setState({
          recipient,
        })

        if (!id) {
          history.replace(`/withdraw/${recipient.id}`)
        }
      })
  }

  getTransferCost () {
    const { recipient } = this.state
    const bankCode = path(['bank_account', 'bank_code'], recipient)

    if (recipient && bankCode) {
      // eslint-disable-next-line camelcase
      const { pricing: { transfers: { credito_em_conta, ted } } } = this.props

      if (contains(partnersBankCodes, bankCode)) {
        return -credito_em_conta // eslint-disable-line camelcase
      }

      return -ted
    }

    return 0
  }

  createTransfer () {
    const {
      client,
      onWithdrawReceive,
      t,
    } = this.props

    const {
      recipient,
      requested,
    } = this.state

    const taxedAmount = requested + this.getTransferCost()

    client.transfers.create({
      amount: taxedAmount,
      recipient_id: recipient.id,
    })
      .then(() => {
        this.setState({
          confirmationDisabledButtons: false,
          currentStep: 'result',
          statusMessage: t('pages.withdraw.withdraw_success'),
          stepsStatus: getStepsStatus('result', 'success'),
        })

        onWithdrawReceive()
      })
      .catch(() => {
        this.setState({
          confirmationDisabledButtons: false,
          currentStep: 'result',
          statusMessage: t('pages.withdraw.withdraw_error'),
          stepsStatus: getStepsStatus('result', 'error'),
        })
      })
  }

  goTo (nextStep, nextStepStatus) {
    this.setState({
      currentStep: nextStep,
      stepsStatus: getStepsStatus(nextStep, nextStepStatus),
    })
  }

  handleConfirmationConfirm (password) {
    const {
      client,
      t,
    } = this.props

    const {
      recipient,
      requested,
    } = this.state

    const { session_id: sessionId } = client.authentication

    this.setState({
      confirmationDisabledButtons: true,
      confirmationPasswordError: '',
    })

    client.session.verify({
      id: sessionId,
      password,
    })
      .then(({ valid }) => {
        if (valid) {
          this.setState({
            confirmationPasswordError: '',
          })

          this.createTransfer({
            client,
            recipient,
            requested,
            t,
          })
        } else {
          this.setState({
            confirmationDisabledButtons: false,
            confirmationPasswordError: t('pages.withdraw.wrong_pass'),
          })
        }
      })
  }

  handleRequestChange (requested) {
    this.setState({ requested })
  }

  handleTryAgain () {
    this.goTo('data', 'current')
  }

  render () {
    const {
      confirmationDisabledButtons,
      confirmationPasswordError,
      currentStep,
      recipient,
      requested,
      statusMessage,
      stepsStatus,
    } = this.state

    const {
      error,
      history,
      t,
    } = this.props

    const transferCost = this.getTransferCost()

    return (
      <Fragment>
        {!isNil(recipient) &&
          <WithdrawContainer
            amount={Number(requested) + transferCost}
            available={getAvailableAmount(recipient)}
            confirmationPasswordError={confirmationPasswordError}
            currentStep={currentStep}
            date={moment()}
            disabled={confirmationDisabledButtons}
            maximum={getAvailableAmount(recipient)}
            onConfirmationConfirm={this.handleConfirmationConfirm}
            onConfirmationReturn={() => this.goTo('data', 'current')}
            onFormSubmit={() => this.goTo('confirmation', 'current')}
            onRequestedChange={this.handleRequestChange}
            onTryAgain={this.handleTryAgain}
            onViewStatement={() => history.push(`/balance/${recipient.id}`)}
            recipient={recipient}
            requested={Number(requested)}
            statusMessage={statusMessage}
            stepsStatus={stepsStatus}
            t={t}
            transferCost={transferCost}
          />
        }
        {error &&
          <Alert
            icon={<IconError height={16} width={16} />}
            type="error"
          >
            <span>
              {
                error.localized
                  ? error.localized.message
                  : error.message
              }
            </span>
          </Alert>
        }
      </Fragment>
    )
  }
}

Withdraw.propTypes = {
  client: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  error: PropTypes.shape({
    affectedRoute: PropTypes.string.isRequired,
    localized: PropTypes.shape({
      message: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    }),
    message: PropTypes.string.isRequired,
  }),
  history: PropTypes.shape({
    goBack: PropTypes.func,
    push: PropTypes.func,
    replace: PropTypes.func,
  }).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }).isRequired,
  }).isRequired,
  onWithdrawReceive: PropTypes.func.isRequired,
  pricing: PropTypes.shape({
    transfers: PropTypes.shape({
      credito_em_conta: PropTypes.number,
      ted: PropTypes.number,
    }),
  }),
  t: PropTypes.func.isRequired,
}

Withdraw.defaultProps = {
  error: null,
  pricing: {},
}

export default enhanced(Withdraw)
