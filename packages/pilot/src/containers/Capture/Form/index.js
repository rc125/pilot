import React from 'react'
import PropTypes from 'prop-types'
import {
  Alert,
  Button,
  Col,
  Flexbox,
  FormInput,
  Grid,
  ModalActions,
  ModalContent,
  Row,
  Spacing,
  Truncate,
} from 'former-kit'
import { equals } from 'ramda'
import Form from 'react-vanilla-form'
import WarningIcon from 'emblematic-icons/svg/Warning32.svg'

import Property from '../../../components/Property'
import currency from '../../../formatters/currency'
import CaptureDetails from '../../../components/CaptureDetails'
import CurrencyInput from '../../../components/CurrencyInput'
import formatCardNumber from '../../../formatters/cardNumber'
import numberValidation from '../../../validation/number'
import requiredValidation from '../../../validation/required'
import greaterThanValidation from '../../../validation/greaterThan'
import lessThanOrEqualValidation from '../../../validation/lessThanOrEqual'

import style from './style.css'

const isRequired = t => requiredValidation(t('pages.required_error'))
const isNumber = t => numberValidation(t('pages.capture.number'))

const greaterThanAuthorized = (authorizedAmount, t) =>
  greaterThanValidation(authorizedAmount, t('pages.capture.invalid_amount'))
const lessThanOrEqualZero = t =>
  lessThanOrEqualValidation(0, t('pages.capture.greater_than_zero'))

const isBoleto = equals('boleto')

const CaptureForm = ({
  authorizedAmount,
  captureAmount,
  cardBrand,
  cardFirstDigits,
  cardLastDigits,
  customerEmail,
  customerName,
  disabled,
  installments,
  isFromCheckout,
  onConfirm,
  paymentMethod,
  t,
}) => {
  const labels = {
    amount: t('pages.transaction.header.card_amount'),
    captureAmount: t('pages.capture.value_to_capture'),
    cardBrand: t('models.card.brand'),
    cardNumber: t('models.card.number'),
    customerEmail: t('models.customer.email'),
    customerName: t('models.customer.name'),
    installments: t('installments'),
  }

  const contents = {
    cardBrand,
    cardNumber: cardFirstDigits && cardLastDigits
      ? `${formatCardNumber(cardFirstDigits)} ${cardLastDigits}`
      : '',
    customerEmail: (
      <span className={style.value}>
        <Truncate
          text={customerEmail}
        />
      </span>
    ),
    customerName,
    installments,
  }

  const isBoletoOrFromCheckout = isFromCheckout || isBoleto(paymentMethod)

  const renderCaptureAmount = () => (
    isBoletoOrFromCheckout
      ? (
        <Property
          title={t('pages.capture.value_to_capture')}
          value={
            <span className={style.captureAmount}>
              {currency(captureAmount)}
            </span>
          }
        />
      )
      : (
        <FormInput
          disabled={disabled}
          label={t('pages.transaction.paid_amount')}
          name="captureAmount"
          renderer={props => (
            <CurrencyInput
              {...props}
              max={authorizedAmount}
            />
          )}
          type="text"
          value={captureAmount}
        />
      )
  )

  const renderCaptureWarning = () => (
    isFromCheckout
      ? (
        <Row>
          <Col palm={12} tablet={12} desk={12} tv={12}>
            <Alert
              icon={
                <WarningIcon
                  height={16}
                  width={16}
                />
              }
              type="warning"
            >
              <Flexbox
                alignItems="center"
                justifyContent="space-between"
              >
                <span className={style.captureWarning}>
                  {t('pages.capture.token_capture_warning')}
                  {' '}
                  <a href="https://docs.pagar.me/v3/docs/captura-manual-de-transa%C3%A7%C3%B5es-criadas-pelo-checkout-pagarme">
                    {t('pages.capture.token_capture_link')}
                  </a>
                </span>
              </Flexbox>
            </Alert>
          </Col>
        </Row>
      ) : null
  )

  return (
    <Form
      data={{
        captureAmount,
      }}
      validation={{
        captureAmount: [
          isRequired(t),
          isNumber(t),
          greaterThanAuthorized(authorizedAmount, t),
          lessThanOrEqualZero(t),
        ],
      }}
      onSubmit={onConfirm}
    >
      <ModalContent>
        <Grid>
          <CaptureDetails labels={labels} contents={contents} />
          <Row>
            <Col palm={12} tablet={8} desk={8} tv={8}>
              <Property
                title={t('pages.transaction.header.card_amount')}
                value={currency(authorizedAmount)}
              />
            </Col>
            <Col palm={12} tablet={4} desk={4} tv={4}>
              { renderCaptureAmount() }
            </Col>
          </Row>
          { renderCaptureWarning() }
        </Grid>
      </ModalContent>
      <Spacing />
      <ModalActions>
        <Button
          disabled={disabled}
          type="submit"
        >
          {t('pages.capture.capture_action')}
        </Button>
      </ModalActions>
    </Form>
  )
}

const mustEqualAuthorizedAmountOnCheckoutCapture = (props, propName) => {
  const {
    authorizedAmount,
    captureAmount,
    isFromCheckout,
  } = props

  if (propName === 'captureAmount' && isFromCheckout && authorizedAmount !== Number(captureAmount)) {
    throw new Error('Prop captureAmount should equals authorizedAmount')
  }
}

const requiredOnCheckoutCapture = (props, propName) => {
  const {
    isFromCheckout,
  } = props

  if (!props[propName] && isFromCheckout) {
    throw new Error(`Prop ${propName} is needed when isFromCheckout equals true`)
  }
}

const captureAmountPropType = (props, propName) => {
  requiredOnCheckoutCapture(props, propName)
  mustEqualAuthorizedAmountOnCheckoutCapture(props, propName)
}

CaptureForm.propTypes = {
  authorizedAmount: PropTypes.number.isRequired,
  captureAmount: captureAmountPropType,
  cardBrand: PropTypes.string,
  cardFirstDigits: PropTypes.string,
  cardLastDigits: PropTypes.string,
  customerEmail: PropTypes.string,
  customerName: PropTypes.string,
  disabled: PropTypes.bool,
  installments: PropTypes.number,
  isFromCheckout: PropTypes.bool.isRequired,
  onConfirm: PropTypes.func.isRequired,
  paymentMethod: PropTypes.oneOf([
    'boleto',
    'debit_card',
    'credit_card',
  ]).isRequired,
  t: PropTypes.func.isRequired,
}

CaptureForm.defaultProps = {
  captureAmount: '0',
  cardBrand: null,
  cardFirstDigits: '',
  cardLastDigits: '',
  customerEmail: null,
  customerName: null,
  disabled: false,
  installments: null,
}

export default CaptureForm
