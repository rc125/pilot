import React from 'react'
import PropTypes from 'prop-types'

import ImageCreateAccount from './create-account.svg'
import ImageCNPJ from './cnpj.svg'
import ImageWithoutCNPJ from './without-cnpj.svg'
import ImageCompanyData from './company-data.svg'

const mapStepToImage = {
  'create-account': <ImageCreateAccount />,
  'check-cnpj': <ImageCNPJ />,
  'type-cnpj': <ImageCNPJ />,
  'without-cnpj': <ImageWithoutCNPJ />,
  'company-data': <ImageCompanyData />,
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
  ]).isRequired,
}

export default HeaderImage
