import React from 'react'
import PropTypes from 'prop-types'

import SelfRegisterForm from './Form'
import SelfRegisterWaiting from './Waiting'

const isForm = (step) => {
  const forms = [
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
  ]

  return forms.includes(step)
}

const SelfRegister = ({
  onPreviousButton,
  onRedirectToHome,
  onSubmit,
  step,
  t,
}) => {
  if (isForm(step)) {
    return (
      <SelfRegisterForm
        onPreviousButton={onPreviousButton}
        onRedirectToHome={onRedirectToHome}
        onSubmit={onSubmit}
        step={step}
        t={t}
      />
    )
  }

  return (
    <SelfRegisterWaiting
      onRedirectToHome={onRedirectToHome}
      step={step}
      t={t}
    />
  )
}

SelfRegister.propTypes = {
  onPreviousButton: PropTypes.func.isRequired,
  onRedirectToHome: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
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
  ]),
  t: PropTypes.func.isRequired,
}

SelfRegister.defaultProps = {
  step: 'create-account',
}

export default SelfRegister
