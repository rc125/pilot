import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import {
  Button,
  FormInput,
  Col,
  Grid,
  Row,
} from 'former-kit'
import Form from 'react-vanilla-form'

import cpfValidation from '../../../validation/cpf'
import dateValidation from '../../../validation/date'
import { handleMaskField, onFormMaskFieldChange } from '../form-mask-field-helpers'
import HeaderImage from '../../../components/SelfRegister/HeaderImage'
import legalAgeValidation from '../../../validation/legalAge'
import Message from '../../../components/Message'
import phoneValidation from '../../../validation/phone'
import requiredValidation from '../../../validation/required'
import style from '../style.css'

const masks = {
  cpf: '111.111.111-11',
  date: '11/11/1111',
  phone: '(11) 11111-1111',
}

const step = 'partner-data'

const hasLegalAge = t => legalAgeValidation(t('validations.hasLegalAge'))
const isCpf = t => cpfValidation(t('validations.isCpf'))
const isDate = t => dateValidation(t('validations.isDate'))
const isPhone = t => phoneValidation(t('validations.isPhone'))
const isRequired = t => requiredValidation(t('pages.self_register.required_error'))

class SelfRegisterPartnerData extends Component {
  constructor () {
    super()

    this.state = {
      cpf: '',
      birth_date: '',
      phone: '',
    }

    this.handleMaskField = handleMaskField.bind(this)
    this.onFormMaskFieldChange = onFormMaskFieldChange.bind(this)
  }

  render () {
    const { onSubmit, t } = this.props

    return (
      <Fragment>
        <Message
          image={<HeaderImage step={step} />}
          title={
            <p className={style.headerTitle}>
              {t('pages.self_register.partner_data.form_title')}
            </p>
          }
        />

        <Form
          className={style.fillWidth}
          data={{
            ...this.state,
          }}
          onChange={this.onFormMaskFieldChange}
          onSubmit={onSubmit}
          validateOn="blur"
          validation={{
            partner_name: isRequired(t),
            birth_date: [
              isRequired(t),
              isDate(t),
              hasLegalAge(t),
            ],
            cpf: [isRequired(t), isCpf(t)],
            montherName: isRequired(t),
            phone: [isRequired(t), isPhone(t)],
            email: isRequired(t),
          }}
        >
          <Grid>
            <Row>
              <Col tv={12} desk={12} tablet={12} palm={12}>
                <FormInput
                  label={t('pages.self_register.partner_data.partner_name')}
                  name="partner_name"
                />
              </Col>
            </Row>

            <Row>
              <Col tv={4} desk={4} tablet={4} palm={12}>
                <FormInput
                  label={t('pages.self_register.partner_data.cpf')}
                  mask={masks.cpf}
                  name="cpf"
                  onChange={this.handleMaskField('cpf')}
                />
              </Col>
              <Col tv={4} desk={4} tablet={4} palm={12}>
                <FormInput
                  label={t('pages.self_register.partner_data.birth_date')}
                  mask={masks.date}
                  name="birth_date"
                  onChange={this.handleMaskField('birth_date')}
                />
              </Col>
              <Col tv={4} desk={4} tablet={4} palm={12}>
                <FormInput
                  label={t('pages.self_register.partner_data.phone')}
                  mask={masks.phone}
                  name="phone"
                  onChange={this.handleMaskField('phone')}
                />
              </Col>
            </Row>

            <Row>
              <Col tv={12} desk={12} tablet={12} palm={12}>
                <FormInput
                  label={t('pages.self_register.partner_data.monther_name')}
                  name="montherName"
                />
              </Col>
            </Row>

            <span className={style.buttonSubmit}>
              <Button type="submit" size="huge" fill="gradient">
                {t('pages.self_register.partner_data.continue')}
              </Button>
            </span>
          </Grid>
        </Form>
      </Fragment>
    )
  }
}

SelfRegisterPartnerData.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
}

export default SelfRegisterPartnerData
