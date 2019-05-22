import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  Button,
  ModalActions,
  Truncate,
} from 'former-kit'

import CreditCardRefundDetails from '../../../components/CreditCardRefundDetails'

import style from './style.css'

class CardConfirmation extends Component {
  constructor (props) {
    super(props)

    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit (e) {
    e.preventDefault()
    this.props.onConfirm()
  }

  render () {
    const {
      amount,
      brand,
      cardFirstDigits,
      cardLastDigits,
      disabled,
      email,
      holderName,
      installments,
      onBack,
      refundAmount,
      t,
    } = this.props

    return (
      <form onSubmit={this.handleSubmit}>
        <CreditCardRefundDetails
          contents={{
            amount,
            brand,
            cardFirstDigits,
            cardLastDigits,
            email: (
              <span className={style.value}>
                <Truncate
                  text={email}
                />
              </span>
            ),
            holderName,
            installments: t(
              'models.transaction.installments_count',
              { count: installments }
            ),
            refundAmount,
          }}
          labels={{
            amount: t('models.transaction.amount'),
            brand: t('models.card.brand'),
            cardNumber: t('models.card.number'),
            email: t('models.customer.email'),
            holderName: t('models.card.holder_name'),
            installments: t('models.transaction.installments'),
            refundAmount: t('pages.refund.refund_amount'),
          }}
          title={t('pages.refund.refund_data')}
        />
        <ModalActions>
          <Button
            disabled={disabled}
            fill="outline"
            onClick={onBack}
            type="button"
          >
            {t('pages.refund.go_back')}
          </Button>
          <Button
            disabled={disabled}
            fill="gradient"
            type="submit"
          >
            {t('pages.refund.confirm')}
          </Button>
        </ModalActions>
      </form>
    )
  }
}

CardConfirmation.propTypes = {
  amount: PropTypes.number.isRequired,
  brand: PropTypes.string.isRequired,
  cardFirstDigits: PropTypes.string.isRequired,
  cardLastDigits: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  email: PropTypes.string.isRequired,
  holderName: PropTypes.string.isRequired,
  installments: PropTypes.number.isRequired,
  onBack: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  refundAmount: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
}

CardConfirmation.defaultProps = {
  disabled: false,
}

export default CardConfirmation
