import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import {
  allPass,
  always,
  applySpec,
  both,
  complement,
  anyPass,
  compose,
  cond,
  contains,
  either,
  equals,
  gt,
  head,
  identity,
  ifElse,
  isEmpty,
  isNil,
  map,
  partial,
  path,
  pipe,
  prop,
  propSatisfies,
  startsWith,
} from 'ramda'
import { translate } from 'react-i18next'
import moment from 'moment'
import { Alert } from 'former-kit'
import IconInfo from 'emblematic-icons/svg/Info32.svg'
import {
  destroyAnticipation as destroyAnticipationAction,
  requestLimits,
} from './actions'

import AnticipationContainer from '../../containers/Anticipation'
import env from '../../environment'
import partnersBankCodes from '../../models/partnersBanksCodes'
import { withError } from '../ErrorBoundary'

const mapStateToProps = ({
  account: {
    client,
    company: {
      pricing,
    } = {},
  },
  anticipation: {
    error,
    limits,
    loading,
  },
}) => ({
  client,
  error,
  limits,
  loading,
  pricing,
})

const mapDispatchToProps = {
  destroyAnticipation: destroyAnticipationAction,
  requestAnticipationLimits: requestLimits,
}

const enhanced = compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps),
  withRouter,
  withError
)

const createBulk = (client, {
  automaticTransfer,
  paymentDate,
  recipientId,
  requestedAmount,
  timeframe,
}) => (
  client.bulkAnticipations.create({
    automatic_transfer: automaticTransfer,
    build: true,
    payment_date: paymentDate.valueOf(),
    recipientId,
    requested_amount: requestedAmount,
    timeframe,
  })
)

const updateBulk = (client, {
  automaticTransfer,
  bulkId,
  paymentDate,
  recipientId,
  requestedAmount,
  timeframe,
}) => client.bulkAnticipations.update({
  automatic_transfer: automaticTransfer,
  id: bulkId,
  payment_date: paymentDate.valueOf(),
  recipientId,
  requested_amount: requestedAmount,
  timeframe,
})

const confirmBulk = (client, {
  bulkId,
  recipientId,
}) => (
  client.bulkAnticipations.confirm({
    id: bulkId,
    recipientId,
  })
)

const getBuildingBulkAnticipations = (client, recipientId) =>
  client
    .bulkAnticipations
    .find({
      recipientId,
      status: 'building',
    })

const buildDeleteOptions = applySpec({ anticipationId: prop('id') })

const buildDeleteBuildingBulkAnticipation = destroyFn => pipe(
  map(buildDeleteOptions),
  map(destroyFn)
)

const getDefaultRecipient = client => client
  .company
  .current()
  .then(path(['default_recipient_id', env]))

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

const getErrorMessage = pipe(
  path(['response', 'errors']),
  head,
  prop('message')
)

const isInsuficientPayablesError = pipe(
  path(['response', 'status']),
  equals(409)
)

const getInsuficientPayablesError = t => ifElse(
  isInsuficientPayablesError,
  always(t('pages.anticipation.insuficient_payables')),
  getErrorMessage
)

const isPresent = date =>
  date.isSame(moment(), 'day')

const isFuture = date =>
  date.isAfter(moment())

const isBefore11AM = () =>
  moment().isBefore(moment().hours(11).minutes(0).seconds(0))

const isValidDay = (calendar, client) => allPass([
  either(
    both(
      isPresent,
      isBefore11AM
    ),
    isFuture
  ),
  partial(client.business.isBusinessDay, [calendar]),
])

const stepsId = {
  confirmation: 'confirmation',
  data: 'data',
  result: 'result',
}

const initialState = {
  approximateRequested: undefined,
  bulkAnticipationStatus: null,
  bulkId: null,
  calendar: {},
  currentStep: stepsId.data,
  error: null,
  feesValues: {
    anticipation: 0,
    fraud: 0,
    otherFee: 0,
  },
  invalidDays: [],
  isAutomaticTransfer: true,
  loading: false,
  needsRecalculation: false,
  paymentDate: moment(),
  requestedAmount: undefined,
  statusMessage: '',
  stepsStatus: {
    [stepsId.data]: 'current',
    [stepsId.confirmation]: 'pending',
    [stepsId.result]: 'pending',
  },
  timeframe: 'start',
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

const isInvalidRecipientId = anyPass([
  isNil,
  equals('undefined'),
  complement(startsWith('re_')),
])

const areNilLimits = both(
  propSatisfies(isNil, 'max'),
  propSatisfies(isNil, 'min')
)

const areEmptyLimits = both(
  propSatisfies(either(isNil, equals(0)), 'max'),
  propSatisfies(either(isNil, equals(0)), 'min')
)

const getMinLimit = ifElse(
  gt(100),
  () => 100,
  identity
)

class Anticipation extends Component {
  constructor (props) {
    super(props)

    this.state = {
      ...initialState,
      bulkId: null,
    }

    this.calculateLimits = this.calculateLimits.bind(this)
    this.confirmAnticipation = this.confirmAnticipation.bind(this)
    this.createAnticipation = this.createAnticipation.bind(this)
    this.createOrUpdateAnticipation = this.createOrUpdateAnticipation.bind(this)
    this.destroyBuildingAnticipations =
      this.destroyBuildingAnticipations.bind(this)
    this.getBuildingAnticipations = this.getBuildingAnticipations.bind(this)
    this.getTransferCost = this.getTransferCost.bind(this)
    this.goTo = this.goTo.bind(this)
    this.goToBalance = this.goToBalance.bind(this)
    this.handleCalculateSubmit = this.handleCalculateSubmit.bind(this)
    this.handleConfirmationConfirm = this.handleConfirmationConfirm.bind(this)
    this.handleFormChange = this.handleFormChange.bind(this)
    this.resetAnticipation = this.resetAnticipation.bind(this)
    this.updateAnticipation = this.updateAnticipation.bind(this)
    this.updateRecipient = this.updateRecipient.bind(this)
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

    client
      .business
      .requestBusinessCalendar(moment().get('year'))
      .then((calendar) => {
        const nextAnticipableDay = client
          .business
          .nextAnticipableBusinessDay(
            calendar,
            { hour: 10, minute: 20 },
            moment()
          )

        this.setState({
          calendar,
          paymentDate: nextAnticipableDay,
        })
      })

    if (isInvalidRecipientId(id)) {
      getDefaultRecipient(client)
        .then(recipientId => history.replace(`/anticipation/${recipientId}`))
    } else {
      this.updateRecipient(id)
        .then(() => {
          const { limits, loading } = this.props

          this.getBuildingAnticipations(id)
            .then((buildings) => {
              if (!isEmpty(buildings)) {
                this.destroyBuildingAnticipations(buildings)
              } else if (areNilLimits(limits)) {
                this.calculateLimits()
              }
            })

          if (
            !areEmptyLimits(limits)
            && !loading
            && isNil(this.state.approximateRequested)
          ) {
            this.createOrUpdateAnticipation(limits.max)
          }
        })
    }
  }

  componentDidUpdate (prevProps, prevState) {
    const {
      history,
      limits,
      loading: loadingLimits,
      match: {
        params: {
          id,
        },
      },
    } = this.props

    const {
      match: {
        params: {
          id: oldId,
        },
      },
    } = prevProps

    const {
      isAutomaticTransfer: prevIsAutomaticTransfer,
      recipient: prevRecipient,
    } = prevState

    const {
      isAutomaticTransfer,
      loading,
      recipient,
      requestedAmount,
    } = this.state

    if (isInvalidRecipientId(id) && oldId) {
      return history.replace(`/anticipation/${oldId}`)
    }

    if ((id && id !== oldId) || (!recipient && !loading)) {
      return this.updateRecipient(id)
    }

    if (
      recipient
      && !prevRecipient
      && !loading
      && !loadingLimits
      && limits.max === null
    ) {
      return this.calculateLimits()
    }

    const emptyLimits = areEmptyLimits(limits)

    if (!emptyLimits) {
      if (isNil(requestedAmount) || requestedAmount > limits.max) {
        this.setState({ // eslint-disable-line react/no-did-update-set-state
          requestedAmount: limits.max,
        })
      }

      const hasReceivedLimits = recipient && areEmptyLimits(prevProps.limits)
      const hasTransferModeChanged = (
        isAutomaticTransfer !== prevIsAutomaticTransfer
      )

      if (hasTransferModeChanged) {
        this.setState({ // eslint-disable-line react/no-did-update-set-state
          needsRecalculation: true,
        })
      } else if (hasReceivedLimits) {
        this.createOrUpdateAnticipation(limits.max)
      }
    }

    return undefined
  }

  componentWillUnmount () {
    const {
      bulkAnticipationStatus,
      bulkId,
    } = this.state

    const {
      destroyAnticipation,
      error,
      match: {
        params: {
          id: recipientId,
        },
      },
    } = this.props

    if (!error && bulkAnticipationStatus && bulkAnticipationStatus !== 'pending') {
      destroyAnticipation({
        anticipationId: bulkId,
        recipientId,
      })
    }
  }

  getTransferCost (recipientObject) {
    const { pricing } = this.props
    if (pricing) {
      const {
        recipient: stateRecipient,
      } = this.state

      const {
        transfers: {
          credito_em_conta: creditoEmConta,
          ted,
        },
      } = pricing

      const recipient = recipientObject || stateRecipient

      const bankCode = path(['bank_account', 'bank_code'], recipient)

      if (recipient && bankCode) {
        if (contains(partnersBankCodes, bankCode)) {
          return creditoEmConta
        }

        return -ted
      }
    }

    return 0
  }

  getBuildingAnticipations (id) {
    const { client } = this.props

    return getBuildingBulkAnticipations(client, id)
  }

  destroyBuildingAnticipations (anticipations) {
    const { destroyAnticipation } = this.props

    return Promise.resolve(anticipations)
      .then(buildDeleteBuildingBulkAnticipation(destroyAnticipation))
      .then(deletePromises => Promise.all(deletePromises))
  }

  updateRecipient (id) {
    const {
      client,
    } = this.props

    this.setState({
      loading: true,
    })

    return getRecipientById(id, client)
      .then((recipient) => {
        this.setState({
          loading: false,
          recipient,
          transferCost: this.getTransferCost(recipient),
        })
      })
  }

  calculateLimits () {
    const { requestAnticipationLimits } = this.props
    const {
      paymentDate,
      recipientId,
      timeframe,
    } = this.state

    return requestAnticipationLimits({
      paymentDate,
      recipientId,
      timeframe,
    })
  }

  resetAnticipation () {
    const { limits: { min } } = this.props

    return this.createOrUpdateAnticipation(getMinLimit(min))
      .then(this.calculateLimits)
      .catch(pipe(getErrorMessage, error => this.setState({
        error,
        loading: false,
      })))
  }

  handleCalculateSubmit ({
    date,
    isAutomaticTransfer,
    requested,
    timeframe,
  }) {
    this.setState({
      loading: true,
    })

    const { t } = this.props

    this.updateAnticipation(requested)
      .then(({
        amount,
        anticipation_fee: anticipationFee,
        fee,
        fraud_coverage_fee: fraudCoverageFee,
        status,
      }) => {
        this.setState({
          approximateRequested: amount,
          bulkAnticipationStatus: status,
          error: null,
          feesValues: {
            anticipation: anticipationFee,
            fraud: fraudCoverageFee,
            otherFee: fee,
          },
          isAutomaticTransfer,
          needsRecalculation: false,
          paymentDate: date,
          requestedAmount: requested,
          timeframe,
          transferCost: isAutomaticTransfer
            ? this.getTransferCost()
            : 0,
        })
      })
      .catch(pipe(
        getInsuficientPayablesError(t),
        message => this.setState({
          error: message,
          loading: false,
        })
      ))
  }

  createOrUpdateAnticipation (minValue) {
    const {
      bulkId,
      requestedAmount,
    } = this.state

    this.setState({ loading: true })

    if (!bulkId) {
      return this.createAnticipation(minValue)
    }

    return this.updateAnticipation(minValue || requestedAmount)
  }

  handleConfirmationConfirm (password) {
    const {
      client,
      t,
    } = this.props

    const { session_id: sessionId } = client.authentication

    this.setState({
      loading: true,
    })

    client.session.verify({
      id: sessionId,
      password,
    })
      .then(({ valid }) => {
        if (valid) {
          this.setState({
            error: '',
          })

          this.confirmAnticipation()
            .then(this.calculateLimits)
        } else {
          this.setState({
            error: t('pages.anticipation.wrong_pass'),
            loading: false,
          })
        }
      })
  }

  handleFormChange (
    {
      dates: { start },
      requested,
      timeframe,
      transfer,
    },
    { requested: requestedError }
  ) {
    const isAutomaticTransfer = transfer === 'yes'
    const {
      paymentDate,
      requestedAmount: oldRequestedAmount,
      timeframe: oldTimeframe,
    } = this.state
    const mustReset = timeframe !== oldTimeframe || !paymentDate.isSame(start)
    const hasRequestedAmountChanged = +requested !== oldRequestedAmount

    this.setState(
      {
        error: requestedError,
        isAutomaticTransfer,
        needsRecalculation: hasRequestedAmountChanged,
        paymentDate: start,
        requestedAmount: +requested,
        timeframe,
        transferCost: isAutomaticTransfer
          ? this.getTransferCost()
          : 0,
      },
      () => mustReset && this.resetAnticipation()
    )
  }

  goTo (nextStep, nextStepStatus) {
    this.setState({
      currentStep: nextStep,
      stepsStatus: getStepsStatus(nextStep, nextStepStatus),
    })
  }

  goToBalance () {
    const {
      recipient: {
        id,
      },
    } = this.state

    const {
      history,
    } = this.props
    history.push(`/balance/${id}`)
  }

  updateAnticipation (value) {
    const {
      bulkId,
      isAutomaticTransfer,
      paymentDate,
      recipient: {
        id: recipientId,
      },
      requestedAmount,
      timeframe,
    } = this.state

    const { client } = this.props

    return updateBulk(client, {
      automaticTransfer: isAutomaticTransfer,
      bulkId,
      paymentDate,
      recipientId,
      requestedAmount: value || requestedAmount,
      timeframe,
    }).then((bulk) => {
      const {
        amount,
        anticipation_fee: anticipationFee,
        fee,
        fraud_coverage_fee: fraudCovarageFee,
      } = bulk

      this.setState({
        approximateRequested: amount,
        error: null,
        feesValues: {
          anticipation: anticipationFee,
          fraud: fraudCovarageFee,
          otherFee: fee,
        },
        loading: false,
        needsRecalculation: false,
        requestedAmount: amount,
      })

      return bulk
    })
  }

  confirmAnticipation () {
    const {
      bulkId,
      recipient: {
        id: recipientId,
      },
    } = this.state

    const {
      client,
      t,
    } = this.props

    return confirmBulk(client, {
      bulkId,
      recipientId,
    })
      .then(({ status }) => {
        this.setState({
          bulkAnticipationStatus: status,
          currentStep: 'result',
          loading: false,
          statusMessage: t('pages.anticipation.anticipation_success'),
          stepsStatus: getStepsStatus('result', 'success'),
        })
      })
      .catch(pipe(getErrorMessage, error => this.setState({
        currentStep: 'result',
        loading: false,
        statusMessage: error,
        stepsStatus: getStepsStatus('result', 'error'),
      })))
  }

  createAnticipation (value) {
    const {
      isAutomaticTransfer,
      paymentDate,
      recipient: {
        id: recipientId,
      },
      requestedAmount,
      timeframe,
    } = this.state

    const {
      client,
      limits: {
        max,
      },
    } = this.props

    return createBulk(client, {
      automaticTransfer: isAutomaticTransfer,
      paymentDate,
      recipientId,
      requestedAmount: value || requestedAmount,
      timeframe,
    })
      .then(({
        amount,
        anticipation_fee: anticipationFee,
        fee,
        fraud_coverage_fee: fraudCovarageFee,
        id,
        status,
      }) => {
        this.setState({
          approximateRequested: amount,
          bulkAnticipationStatus: status,
          bulkId: id,
          error: null,
          feesValues: {
            anticipation: anticipationFee,
            fraud: fraudCovarageFee,
            otherFee: fee,
          },
          loading: false,
          requestedAmount: max,
        })
      })
  }

  render () {
    const {
      approximateRequested,
      calendar,
      currentStep,
      error,
      feesValues: {
        anticipation,
        fraud,
        otherFee,
      },
      isAutomaticTransfer,
      loading,
      needsRecalculation,
      paymentDate,
      recipient,
      requestedAmount,
      statusMessage,
      stepsStatus,
      timeframe,
      transferCost,
    } = this.state

    const {
      client,
      error: requestError,
      limits: {
        max,
        min,
      },
      limitsError,
      loading: limitsLoading,
      t,
    } = this.props

    const totalCost = -(anticipation + fraud + otherFee)
    const totalCostAndTransfer = totalCost + transferCost
    const amount = approximateRequested
      ? approximateRequested + totalCostAndTransfer
      : totalCostAndTransfer

    if (requestError) {
      const message = requestError.localized
        ? requestError.localized.message
        : requestError.message

      return (
        <Alert
          icon={<IconInfo height={16} width={16} />}
          type="error"
        >
          <span>{message}</span>
        </Alert>
      )
    }

    if (limitsError) {
      return (
        <Alert
          icon={<IconInfo height={16} width={16} />}
          type="error"
        >
          <span>
            {limitsError && limitsError}
          </span>
        </Alert>
      )
    }

    return (
      <Fragment>
        {!isNil(recipient) &&
          <AnticipationContainer
            amount={amount}
            approximateRequested={approximateRequested}
            automaticTransfer={isAutomaticTransfer}
            currentStep={currentStep}
            date={paymentDate}
            error={error}
            loading={loading || limitsLoading}
            maximum={max}
            minimum={getMinLimit(min)}
            needsRecalculation={needsRecalculation}
            onCalculateSubmit={this.handleCalculateSubmit}
            onCancel={this.goToBalance}
            onConfirmationConfirm={this.handleConfirmationConfirm}
            onConfirmationReturn={() => this.goTo('data', 'current')}
            onDataConfirm={() => this.goTo('confirmation', 'current')}
            onFormChange={this.handleFormChange}
            onTryAgain={() => this.goTo('data', 'current')}
            onViewStatement={this.goToBalance}
            recipient={recipient}
            requested={requestedAmount}
            statusMessage={statusMessage}
            stepsStatus={stepsStatus}
            t={t}
            timeframe={timeframe}
            totalCost={totalCost}
            transferCost={isAutomaticTransfer && transferCost
              ? transferCost
              : 0
            }
            validateDay={isValidDay(calendar, client)}
          />
        }
      </Fragment>
    )
  }
}

Anticipation.propTypes = {
  client: PropTypes.shape({
    bulkAnticipations: PropTypes.shape({
      limits: PropTypes.func,
    }).isRequired,
  }).isRequired,
  destroyAnticipation: PropTypes.func.isRequired,
  error: PropTypes.shape({
    localized: PropTypes.shape({
      message: PropTypes.string.isRequired,
    }),
    message: PropTypes.string.isRequired,
  }),
  history: PropTypes.shape({
    goBack: PropTypes.func,
    push: PropTypes.func,
    replace: PropTypes.func,
  }).isRequired,
  limits: PropTypes.shape({
    max: PropTypes.number,
    min: PropTypes.number,
  }).isRequired,
  limitsError: PropTypes.string,
  loading: PropTypes.bool,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }).isRequired,
  }).isRequired,
  pricing: PropTypes.shape({
    transfers: PropTypes.shape({
      credito_em_conta: PropTypes.number,
      ted: PropTypes.number,
    }),
  }),
  requestAnticipationLimits: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
}

Anticipation.defaultProps = {
  error: null,
  limitsError: '',
  loading: false,
  pricing: null,
}

export default enhanced(Anticipation)
