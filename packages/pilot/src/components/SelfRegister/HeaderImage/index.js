import React from 'react'
import PropTypes from 'prop-types'

import ImageAlreadySell from './already-sell.svg'
import ImageBusinessDetail from './business-detail.svg'
import ImageContract from './contract.svg'
import ImageCreateAccount from './create-account.svg'
import ImageCNPJ from './cnpj.svg'
import ImageSalesAmount from './sales-amount.svg'
import ImageWithoutCNPJ from './without-cnpj.svg'
import ImageCompanyData from './company-data.svg'
import ImagePartnerAddress from './partner-address.svg'
import ImagePartnerData from './partner-data.svg'

const mapStepToImage = {
  'create-account': <ImageCreateAccount />,
  'check-cnpj': <ImageCNPJ />,
  'type-cnpj': <ImageCNPJ />,
  'without-cnpj': <ImageWithoutCNPJ />,
  'company-data': <ImageCompanyData />,
  'partner-data': <ImagePartnerData />,
  'partner-address': <ImagePartnerAddress />,
  'already-sell': <ImageAlreadySell />,
  'business-detail-present': <ImageBusinessDetail />,
  'business-detail-future': <ImageBusinessDetail />,
  'sales-amount-present': <ImageSalesAmount />,
  'sales-amount-future': <ImageSalesAmount />,
  contract: <ImageContract />,
}

const HeaderImage = ({ step }) =>
  mapStepToImage[step]

HeaderImage.propTypes = {
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

export default HeaderImage
