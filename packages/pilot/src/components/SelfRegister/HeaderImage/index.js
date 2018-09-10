import React from 'react'
import PropTypes from 'prop-types'

import ImageAlreadySell from './already-sell.svg'
import ImageCreateAccount from './create-account.svg'
import ImageCNPJ from './cnpj.svg'
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
  ]).isRequired,
}

export default HeaderImage
