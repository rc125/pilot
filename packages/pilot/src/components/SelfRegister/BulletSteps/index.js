import React from 'react'
import PropTypes from 'prop-types'
import { BulletSteps } from 'former-kit'

const mapStepToPosition = {
  'create-account': 1,
  'check-cnpj': 2,
  'type-cnpj': 2,
  'without-cnpj': 2,
  'company-data': 3,
  'partner-data': 4,
  'partner-address': 5,
  'already-sell': 6,
  'business-detail-present': 7,
  'business-detail-future': 7,
  'sales-amount-present': 8,
  'sales-amount-future': 8,
  contract: 9,
}

const getStatus = (step, currentStep) => {
  if (step < currentStep) {
    return 'previous'
  }

  if (step === currentStep) {
    return 'current'
  }

  return 'next'
}

const SelfRegisterBulletSteps = ({ step }) => {
  const position = mapStepToPosition[step]

  return (
    <BulletSteps
      status={[
        { id: 'create-account', status: getStatus(1, position) },
        { id: 'cnpj', status: getStatus(2, position) },
        { id: 'company-data', status: getStatus(3, position) },
        { id: 'partner-data', status: getStatus(4, position) },
        { id: 'partner-address', status: getStatus(5, position) },
        { id: 'already-sell', status: getStatus(6, position) },
        { id: 'business-detail', status: getStatus(7, position) },
        { id: 'sales-amount', status: getStatus(8, position) },
        { id: 'contract', status: getStatus(9, position) },
      ]}
      steps={[
        { id: 'create-account' },
        { id: 'cnpj' },
        { id: 'company-data' },
        { id: 'partner-data' },
        { id: 'partner-address' },
        { id: 'already-sell' },
        { id: 'business-detail' },
        { id: 'sales-amount' },
        { id: 'contract' },
      ]}
    />
  )
}

SelfRegisterBulletSteps.propTypes = {
  step: PropTypes.oneOf([
    'create-account',
    'check-cnpj',
    'type-cnpj',
    'without-cnpj',
    'company-data',
    'partner-data',
    'partner-address',
    'already-sell',
    'business-detail-present',
    'business-detail-future',
    'sales-amount-present',
    'sales-amount-future',
    'contract',
  ]).isRequired,
}

export default SelfRegisterBulletSteps
