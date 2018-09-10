import React from 'react'
import PropTypes from 'prop-types'

import AlreadySell from './AlreadySell'
import BusinessDetailPresent from './BusinessDetailPresent'
import BusinessDetailFuture from './BusinessDetailFuture'
import CreateAccount from './CreateAccount'
import CheckCNPJ from './CheckCNPJ'
import Contract from './Contract'
import SalesAmount from './SalesAmount'
import TypeCNPJ from './TypeCNPJ'
import WithoutCNPJ from './WithoutCNPJ'
import CompanyData from './CompanyData'
import PartnerAddress from './PartnerAddress'
import PartnerData from './PartnerData'
import WaitingRiskAnalysis from './WaitingRiskAnalysis'
import RefusedAccount from './RefusedAccount'

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
  'sales-amount-present': SalesAmount('present'),
  'sales-amount-future': SalesAmount('future'),
  contract: Contract,
  'waiting-risk-analysis': WaitingRiskAnalysis,
  'refused-account': RefusedAccount,
}

const SelfRegisterContainer = ({
  registerData,
  onRedirectToHome,
  onSubmit,
  step,
  t,
}) => {
  const container = mapStepToContainer[step]

  return React.createElement(container, {
    registerData,
    onRedirectToHome,
    onSubmit,
    t,
  })
}

SelfRegisterContainer.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  registerData: PropTypes.object,
  onRedirectToHome: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
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
    'waiting-risk-analysis',
    'refused-account',
  ]).isRequired,
  t: PropTypes.func.isRequired,
}

SelfRegisterContainer.defaultProps = {
  registerData: {},
  onSubmit: null,
}

export default SelfRegisterContainer
