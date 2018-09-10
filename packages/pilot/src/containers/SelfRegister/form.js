import React from 'react'
import PropTypes from 'prop-types'

import AlreadySell from './AlreadySell'
import BusinessDetailPresent from './BusinessDetailPresent'
import BusinessDetailFuture from './BusinessDetailFuture'
import CreateAccount from './CreateAccount'
import CheckCNPJ from './CheckCNPJ'
import TypeCNPJ from './TypeCNPJ'
import WithoutCNPJ from './WithoutCNPJ'
import CompanyData from './CompanyData'
import PartnerAddress from './PartnerAddress'
import PartnerData from './PartnerData'

const mapStepToContainer = {
  'create-account': CreateAccount,
  'check-cnpj': CheckCNPJ,
  'type-cnpj': TypeCNPJ,
  'without-cnpj': WithoutCNPJ,
  'company-data': CompanyData,
  'partner-data': PartnerData,
  'partner-address': PartnerAddress,
  'already-sell': AlreadySell,
  'business-detail-present': BusinessDetailPresent,
  'business-detail-future': BusinessDetailFuture,
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
    'check-cnpj',
    'type-cnpj',
    'without-cnpj',
    'company-data',
    'partner-data',
    'partner-address',
    'already-sell',
    'business-detail-present',
    'business-detail-future',
  ]).isRequired,
  t: PropTypes.func.isRequired,
}

export default SelfRegisterForm
