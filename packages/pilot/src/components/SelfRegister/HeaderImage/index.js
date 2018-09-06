import React from 'react'
import PropTypes from 'prop-types'

import ImageCreateAccount from './create-account.svg'

const mapStepToImage = {
  'create-account': <ImageCreateAccount />,
}

const HeaderImage = ({ step }) =>
  mapStepToImage[step]

HeaderImage.propTypes = {
  step: PropTypes.oneOf([
    'create-account',
  ]).isRequired,
}

export default HeaderImage
