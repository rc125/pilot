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

const step = 'already-sell'

const SelfRegisterFormAlreadySell = ({ onSubmit, t }) => {
  const submitNo = () => onSubmit({ alreadySell: false })
  const submitYes = () => onSubmit({ alreadySell: true })

  return (
    <Fragment>
      <Message
        image={<HeaderImage step={step} />}
        title={
          <p className={style.headerTitle}>
            {t('pages.self_register.already_sell.question')}
          </p>
        }
      />

      <Grid>
        <Row>
          <Col tv={6} desk={6} tablet={6} palm={6}>
            <span className={style.buttonSubmit}>
              <Button
                fill="outline"
                onClick={submitNo}
                size="huge"
                type="submit"
              >
                {t('pages.self_register.already_sell.no')}
              </Button>
            </span>
          </Col>

          <Col tv={6} desk={6} tablet={6} palm={6}>
            <span className={style.buttonSubmit}>
              <Button
                fill="gradient"
                onClick={submitYes}
                size="huge"
                type="submit"
              >
                {t('pages.self_register.already_sell.yes')}
              </Button>
            </span>
          </Col>
        </Row>
      </Grid>
    </Fragment>
  )
}

SelfRegisterFormAlreadySell.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
}

export default SelfRegisterFormAlreadySell
