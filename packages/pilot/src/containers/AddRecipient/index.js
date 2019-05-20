import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Card, Steps } from 'former-kit'

import IdentificationStep from './IdentificationStep'
import BankAccountStep from './BankAccountStep'
import ConfigurationStep from './ConfigurationStep'
import ConfirmStep from './ConfirmStep'
import ConclusionStep from './ConclusionStep'
import ErrorStep from './ErrorStep'
import Loader from '../../components/Loader'
import style from './style.css'

import {
  errorType,
  PERMISSION_ERROR,
} from '../../formatters/errorType'

import {
  BANK_ACCOUNT,
  CONCLUSION,
  CONFIGURATION,
  CONFIRMATION,
  IDENTIFICATION,
} from './stepIds'

const initialStepStatus = [
  { id: IDENTIFICATION, status: 'current' },
  { id: BANK_ACCOUNT, status: 'pending' },
  { id: CONFIGURATION, status: 'pending' },
  { id: CONFIRMATION, status: 'pending' },
  { id: CONCLUSION, status: 'pending' },
]

class AddRecipients extends Component {
  constructor (props) {
    super(props)
    const { userPermission } = props.options

    const error = (userPermission === 'read_only')
      ? PERMISSION_ERROR
      : null

    this.state = {
      currentStepNumber: 0,
      data: {},
      error,
      fetchData: {},
      isLoading: false,
      stepsStatus: [...initialStepStatus],
    }

    this.createNewStepStatus = this.createNewStepStatus.bind(this)
    this.createSteps = this.createSteps.bind(this)
    this.fetchAndSetNextStepData = this.fetchAndSetNextStepData.bind(this)
    this.handleAsyncNextStep = this.handleAsyncNextStep.bind(this)
    this.handleBackNavigation = this.handleBackNavigation.bind(this)
    this.handleContinueNavigation = this.handleContinueNavigation.bind(this)
    this.handleEdit = this.handleEdit.bind(this)
    this.handleNextStep = this.handleNextStep.bind(this)
    this.handleTryAgain = this.handleTryAgain.bind(this)
    this.handleViewDetails = this.handleViewDetails.bind(this)
    this.renderError = this.renderError.bind(this)
    this.renderStep = this.renderStep.bind(this)

    this.steps = this.createSteps(props)
  }

  handleContinueNavigation (stepData) {
    const {
      currentStepNumber,
      data,
    } = this.state
    const currentStep = this.steps[currentStepNumber]
    const nextStepNumber = currentStepNumber + 1
    const nextStep = this.steps[nextStepNumber]

    const newData = { ...data }
    if (stepData) newData[currentStep.id] = stepData

    if (nextStep.fetch) {
      this.handleAsyncNextStep(newData)
    } else {
      this.handleNextStep(newData)
    }
  }

  handleNextStep (newData) {
    const { currentStepNumber } = this.state
    const nextStepNumber = currentStepNumber + 1
    const stepsStatus = this.createNewStepStatus(nextStepNumber)

    this.setState({
      currentStepNumber: nextStepNumber,
      data: newData,
      stepsStatus,
    })
  }

  handleAsyncNextStep (newData) {
    this.setState({
      data: newData,
      isLoading: true,
    }, () => {
      this.fetchAndSetNextStepData()
    })
  }

  fetchAndSetNextStepData () {
    const { currentStepNumber, fetchData } = this.state
    const nextStepNumber = currentStepNumber + 1
    const nextStep = this.steps[nextStepNumber]
    const stepsStatus = this.createNewStepStatus(nextStepNumber)

    nextStep.fetch()
      .then((nextStepFetchData) => {
        this.setState({
          currentStepNumber: nextStepNumber,
          fetchData: {
            ...fetchData,
            [nextStep.id]: nextStepFetchData,
          },
          isLoading: false,
          stepsStatus,
        })
      })
      .catch((fetchError) => {
        this.setState({
          currentStepNumber: nextStepNumber,
          error: errorType(fetchError),
          isLoading: false,
          stepsStatus,
        })
      })
  }

  handleBackNavigation () {
    const { currentStepNumber } = this.state
    const previousStepNumber = currentStepNumber - 1
    const stepsStatus = this.createNewStepStatus(previousStepNumber)

    this.setState({
      currentStepNumber: previousStepNumber,
      stepsStatus,
    })
  }

  handleTryAgain () {
    this.setState({
      currentStepNumber: 0,
      data: {},
      error: null,
      fetchData: {},
      stepsStatus: [...initialStepStatus],
    })
  }

  handleViewDetails () {
    const { id } = this.state.fetchData[CONCLUSION]
    const { onViewDetails } = this.props
    return onViewDetails(id)
  }

  handleEdit (stepId) {
    const editStep = this.steps.find(step => step.id === stepId)
    const stepIndex = this.steps.indexOf(editStep)
    const stepsStatus = this.createNewStepStatus(stepIndex)

    this.setState({
      currentStepNumber: stepIndex,
      stepsStatus,
    })
  }

  createSteps ({ fetchAccounts, submitRecipient, t }) {
    return [
      {
        id: IDENTIFICATION,
        title: t('pages.add_recipient.data'),
      },
      {
        fetch: () => fetchAccounts(this.state.data[IDENTIFICATION]),
        id: BANK_ACCOUNT,
        title: t('pages.add_recipient.bank_account'),
      },
      {
        id: CONFIGURATION,
        title: t('pages.add_recipient.configurations'),
      },
      {
        id: CONFIRMATION,
        title: t('pages.add_recipient.confirmation'),
      },
      {
        fetch: () => submitRecipient(this.state.data),
        id: CONCLUSION,
        title: t('pages.add_recipient.conclusion'),
      },
    ]
  }

  createNewStepStatus (nextStepNumber) {
    return this.steps.map((step, index) => {
      let status = 'current'

      if (index < nextStepNumber) {
        status = 'success'
      }

      if (index > nextStepNumber) {
        status = 'pending'
      }

      return {
        id: step.id,
        status,
      }
    })
  }

  renderStep () {
    const {
      currentStepNumber,
      data,
      fetchData,
    } = this.state

    const {
      onExit,
      options,
      t,
    } = this.props

    const currentStep = this.steps[currentStepNumber]
    const currentFetchData = fetchData[currentStep.id] || {}

    const stepProps = {
      ...currentFetchData,
      ...options,
      data: data[currentStep.id],
      onBack: this.handleBackNavigation,
      onCancel: onExit,
      onContinue: this.handleContinueNavigation,
      onEdit: this.handleEdit,
      onExit,
      onViewDetails: this.handleViewDetails,
      t,
    }

    switch (currentStep.id) {
      case IDENTIFICATION:
        return <IdentificationStep {...stepProps} />

      case BANK_ACCOUNT:
        return <BankAccountStep {...stepProps} sharedData={data} />

      case CONFIGURATION:
        return <ConfigurationStep {...stepProps} />

      case CONFIRMATION:
        return <ConfirmStep {...stepProps} data={data} />

      case CONCLUSION:
        return <ConclusionStep {...stepProps} />

      default:
        return null
    }
  }

  renderError (error) {
    const {
      onExit,
      onLoginAgain,
      t,
    } = this.props

    return (
      <ErrorStep
        error={error}
        onExit={onExit}
        onLoginAgain={onLoginAgain}
        onTryAgain={this.handleTryAgain}
        t={t}
      />
    )
  }

  render () {
    const {
      currentStepNumber,
      error,
      isLoading,
      stepsStatus,
    } = this.state

    const isConclusion = this.steps[currentStepNumber].id === CONCLUSION
    const shouldRemoveCardBorder = (error || isConclusion)

    const cardStyle = shouldRemoveCardBorder
      ? style.noBorder
      : style.marginTop

    return (
      <Fragment>
        { isLoading && <Loader visible /> }
        <Card>
          <Steps
            status={stepsStatus}
            steps={this.steps}
          />
        </Card>
        <Card className={cardStyle}>
          {
            (error)
              ? this.renderError(error)
              : this.renderStep()
          }
        </Card>
      </Fragment>
    )
  }
}

AddRecipients.propTypes = {
  fetchAccounts: PropTypes.func.isRequired,
  onExit: PropTypes.func.isRequired,
  onLoginAgain: PropTypes.func.isRequired,
  onViewDetails: PropTypes.func.isRequired,
  options: PropTypes.shape({
    canConfigureAnticipation: PropTypes.bool,
    maximumAnticipationDays: PropTypes.number,
    minimumAnticipationDelay: PropTypes.number,
    userPermission: PropTypes.string,
  }),
  submitRecipient: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
}

AddRecipients.defaultProps = {
  options: {
    canConfigureAnticipation: true,
    maximumAnticipationDays: 31,
    minimumAnticipationDelay: 15,
    userPermission: 'admin',
  },
}

export default AddRecipients
