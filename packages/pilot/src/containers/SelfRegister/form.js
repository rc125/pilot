import React from 'react'
import PropTypes from 'prop-types'

import CreateAccount from './CreateAccount'

const mapStepToContainer = {
  'create-account': CreateAccount,
}

const SelfRegisterForm = ({
  onRedirectToHome,
  onSubmit,
  step,
  t,
}) => {
  const container = mapStepToContainer[step]

  return React.createElement(container, {
    onRedirectToHome,
    onSubmit,
    t,
  })
}

SelfRegisterForm.propTypes = {
  onRedirectToHome: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  step: PropTypes.oneOf([
    'create-account',
  ]).isRequired,
  t: PropTypes.func.isRequired,
}

export default SelfRegisterForm
