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

const step = {
  present: 'sales-amount-present',
  future: 'sales-amount-future',
}

const questionMessagePath = {
  present: 'question_present',
  future: 'question_future',
}

// eslint-disable-next-line react/prop-types
const SelfRegisterFormSalesAmount = presentOrFuture => ({ onSubmit, t }) => {
  const submitAmount = amount => () => onSubmit({ amount })

  return (
    <Fragment>
      <Message
        image={<HeaderImage step={step[presentOrFuture]} />}
        title={
          <p className={style.headerTitle}>
            {t(`pages.self_register.sales_amount.${questionMessagePath[presentOrFuture]}`)}
          </p>
        }
      />

      <Grid>
        <Row>
          <Col tv={6} desk={6} tablet={6} palm={6}>
            <span className={style.buttonSubmit}>
              <Button
                fill="outline"
                onClick={submitAmount('19000')}
                size="huge"
                type="submit"
              >
                {t('pages.self_register.sales_amount.from0to20')}
              </Button>
            </span>
          </Col>

          <Col tv={6} desk={6} tablet={6} palm={6}>
            <span className={style.buttonSubmit}>
              <Button
                fill="outline"
                onClick={submitAmount('29000')}
                size="huge"
                type="submit"
              >
                {t('pages.self_register.sales_amount.from20to30')}
              </Button>
            </span>
          </Col>
        </Row>

        <Row>
          <Col tv={6} desk={6} tablet={6} palm={6}>
            <span className={style.buttonSubmit}>
              <Button
                fill="outline"
                onClick={submitAmount('50000')}
                size="huge"
                type="submit"
              >
                {t('pages.self_register.sales_amount.from30to50')}
              </Button>
            </span>
          </Col>

          <Col tv={6} desk={6} tablet={6} palm={6}>
            <span className={style.buttonSubmit}>
              <Button
                fill="outline"
                onClick={submitAmount('higher')}
                size="huge"
                type="submit"
              >
                {t('pages.self_register.sales_amount.higher')}
              </Button>
            </span>
          </Col>
        </Row>
      </Grid>
    </Fragment>
  )
}

SelfRegisterFormSalesAmount.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
}

export default SelfRegisterFormSalesAmount
