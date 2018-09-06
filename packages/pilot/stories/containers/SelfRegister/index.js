import React from 'react'
import { identity } from 'ramda'
import { action } from '@storybook/addon-actions'
import SelfRegister from '../../../src/containers/SelfRegister'

const actionPrevious = action('Previous')
const actionRedirectToHome = action('Go to Home')
const actionSubmit = action('Submit')

const SelfRegisterCreateAccount = () => (
  <SelfRegister
    onPreviousButton={actionPrevious}
    onRedirectToHome={actionRedirectToHome}
    onSubmit={actionSubmit}
    step="create-account"
    t={identity}
  />
)

export { SelfRegisterCreateAccount }
