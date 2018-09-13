import React from 'react'
import PropTypes from 'prop-types'

import HeaderImage from '../../../components/SelfRegister/HeaderImage'
import Message from '../../../components/Message'
import style from './../style.css'

const step = 'waiting-risk-analysis'

const SelfRegisterWaitingRiskAnalysis = ({ t }) => (
  <Message
    image={<HeaderImage step={step} />}
    message={
      <div className={style.headerBody}>
        <p>{t('pages.self_register.waiting_risk_analysis.message_email_sent')}</p>
        <p>{t('pages.self_register.waiting_risk_analysis.message_support')}</p>
      </div>
    }
    title={
      <p className={style.headerTitle}>
        {t('pages.self_register.waiting_risk_analysis.we_are_almost_finish')}
      </p>
    }
  />
)

SelfRegisterWaitingRiskAnalysis.propTypes = {
  t: PropTypes.func.isRequired,
}

export default SelfRegisterWaitingRiskAnalysis
