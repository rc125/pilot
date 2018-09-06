import React, { Fragment } from 'react'
import PropTypes from 'prop-types'

import {
  Button,
  Col,
  Grid,
  Row,
} from 'former-kit'

import HeaderImage from '../../../components/SelfRegister/HeaderImage'
import Message from '../../../components/Message'
import style from './../style.css'

const step = 'check-cnpj'

const SelfRegisterFormCheckCNPJ = ({ onSubmit, t }) => {
  const submitNo = () => onSubmit({ hasCNPJ: false })
  const submitYes = () => onSubmit({ hasCNPJ: true })

  return (
    <Fragment>
      <Message
        image={<HeaderImage step={step} />}
        message={
          <div className={style.headerBody}>
            <p>{t('pages.self_register.check_cnpj.description_part_1')}</p>
            <p>{t('pages.self_register.check_cnpj.description_part_2')}</p>
          </div>
        }
        title={
          <p className={style.headerTitle}>
            {t('pages.self_register.check_cnpj.question')}
          </p>
        }
      />

      <Grid>
        <Row>
          <Col tv={6} desk={6} tablet={6} palm={6}>
            <span className={style.buttonSubmit}>
              <Button
                type="submit"
                size="huge"
                fill="outline"
                onClick={submitNo}
              >
                {t('pages.self_register.check_cnpj.no')}
              </Button>
            </span>
          </Col>

          <Col tv={6} desk={6} tablet={6} palm={6}>
            <span className={style.buttonSubmit}>
              <Button
                type="submit"
                size="huge"
                fill="gradient"
                onClick={submitYes}
              >
                {t('pages.self_register.check_cnpj.yes')}
              </Button>
            </span>
          </Col>
        </Row>
      </Grid>
    </Fragment>
  )
}

SelfRegisterFormCheckCNPJ.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
}

export default SelfRegisterFormCheckCNPJ
