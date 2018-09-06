import React from 'react'
import PropTypes from 'prop-types'

import ImageCreateAccount from './create-account.svg'
import ImageCNPJ from './cnpj.svg'

const mapStepToImage = {
  'create-account': <ImageCreateAccount />,
  'check-cnpj': <ImageCNPJ />,
}

const HeaderImage = ({ step }) =>
  mapStepToImage[step]

HeaderImage.propTypes = {
  step: PropTypes.oneOf([
    'create-account',
    'check-cnpj',
  ]).isRequired,
}

export default HeaderImage
