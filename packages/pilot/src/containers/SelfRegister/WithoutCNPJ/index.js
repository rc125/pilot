import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { Button } from 'former-kit'

import HeaderImage from '../../../components/SelfRegister/HeaderImage'
import Message from '../../../components/Message'
import style from '../style.css'

const step = 'without-cnpj'

const SelfRegisterWithoutCNPJ = ({ onRedirectToHome, t }) => (
  <Fragment>
    <Message
      image={<HeaderImage step={step} />}
      message={
        <div className={style.headerBody}>
          <p>{t('pages.self_register.without_cnpj.description_part_1')}</p>
          <p>{t('pages.self_register.without_cnpj.description_part_2')}</p>
        </div>
      }
      title={
        <p className={style.headerTitle}>
          {t('pages.self_register.without_cnpj.what_a_pity')}
        </p>
      }
    />

    <span className={style.buttonSubmit}>
      <Button
        type="submit"
        fill="outline"
        size="huge"
        onClick={onRedirectToHome}
      >
        {t('pages.self_register.without_cnpj.go_to_start_page')}
      </Button>
    </span>
  </Fragment>
)

SelfRegisterWithoutCNPJ.propTypes = {
  onRedirectToHome: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
}

export default SelfRegisterWithoutCNPJ
