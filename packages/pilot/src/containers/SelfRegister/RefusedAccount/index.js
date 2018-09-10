import React from 'react'
import PropTypes from 'prop-types'

import HeaderImage from '../../../components/SelfRegister/HeaderImage'
import Message from '../../../components/Message'
import style from '../style.css'

const step = 'refused-account'

const SelfRegisterRefusedAccount = ({ t }) => (
  <Message
    image={<HeaderImage step={step} />}
    message={
      <div className={style.headerBody}>
        <p>{t('pages.self_register.refused_account.description')}</p>
      </div>
    }
    title={
      <p className={style.headerTitle}>
        {t('pages.self_register.refused_account.title')}
      </p>
    }
  />
)

SelfRegisterRefusedAccount.propTypes = {
  t: PropTypes.func.isRequired,
}

export default SelfRegisterRefusedAccount
