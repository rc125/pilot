import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import {
  Alert,
  Button,
  ModalActions,
  ModalContent,
  Truncate,
} from 'former-kit'

import IconError from 'emblematic-icons/svg/ClearClose32.svg'
import IconSuccess from 'emblematic-icons/svg/Check32.svg'

import CreditCardRefundDetails from '../../../components/CreditCardRefundDetails'

import style from './style.css'

const CardResult = ({
  amount,
  brand,
  cardFirstDigits,
  cardLastDigits,
  email,
  holderName,
  installments,
  onTryAgain,
  onViewTransaction,
  refundAmount,
  status,
  statusMessage,
  t,
}) => (
  <Fragment>
    <ModalContent>
      <Alert
        icon={
          status === 'success'
            ? <IconSuccess width={16} height={16} />
            : <IconError width={16} height={16} />
        }
        type={status}
      >
        <span>
          {statusMessage}
        </span>
      </Alert>
    </ModalContent>
    {status === 'success' &&
      (
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
      )
    }
    <ModalActions>
      {status === 'success'
        ? (
          <Button
            fill="outline"
            onClick={onViewTransaction}
          >
            {t('pages.refund.view_transaction')}
          </Button>
        )
        : (
          <Button
            fill="outline"
            onClick={onTryAgain}
          >
            {t('pages.refund.try_again')}
          </Button>
        )
      }
    </ModalActions>
  </Fragment>
)

CardResult.propTypes = {
  amount: PropTypes.number.isRequired,
  brand: PropTypes.string.isRequired,
  cardFirstDigits: PropTypes.string.isRequired,
  cardLastDigits: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  holderName: PropTypes.string.isRequired,
  installments: PropTypes.number.isRequired,
  onTryAgain: PropTypes.func.isRequired,
  onViewTransaction: PropTypes.func.isRequired,
  refundAmount: PropTypes.string.isRequired,
  status: PropTypes.oneOf([
    'error',
    'success',
  ]).isRequired,
  statusMessage: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
}

export default CardResult
