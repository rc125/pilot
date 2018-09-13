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
import style from '../style.css'
import contract from './contract'

const step = 'contract'

const SelfRegisterContract = ({ onSubmit, t }) => (
  <Fragment>
    <Message
      image={<HeaderImage step={step} />}
      title={
        <p className={style.headerTitle}>
          {t('pages.self_register.contract.form_title')}
        </p>
      }
    />

    <Grid>
      <Row className={style.contract}>
        <Col tv={12} desk={12} tablet={12} palm={12}>
          <p>
            {contract}
          </p>
        </Col>
      </Row>

      <Row>
        <Col tv={12} desk={12} tablet={12} palm={12}>
          <span className={style.buttonSubmit}>
            <Button
              fill="gradient"
              onClick={onSubmit}
              size="huge"
              type="submit"
            >
              {t('pages.self_register.contract.agree')}
            </Button>
          </span>
        </Col>
      </Row>
    </Grid>
  </Fragment>
)

SelfRegisterContract.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
}

export default SelfRegisterContract
