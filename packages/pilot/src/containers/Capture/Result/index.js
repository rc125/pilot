import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import {
  Alert,
  Button,
  Col,
  Grid,
  ModalActions,
  ModalContent,
  Row,
  Spacing,
  Truncate,
} from 'former-kit'
import IconError from 'emblematic-icons/svg/ClearClose32.svg'

import Property from '../../../components/Property'
import currency from '../../../formatters/currency'
import CaptureDetails from '../../../components/CaptureDetails'
import { Message } from '../../../components/Message'
import formatCardNumber from '../../../formatters/cardNumber'

import style from './style.css'

const Result = ({
  authorizedAmount,
  cardBrand,
  cardFirstDigits,
  cardLastDigits,
  customerEmail,
  customerName,
  image,
  installments,
  message,
  onRetry,
  onViewTransaction,
  paidAmount,
  status,
  statusMessage,
  t,
}) => (
  <Fragment>
    <ModalContent>
      { status !== 'error'
        ?
          <div>
            <div className={style.image}>
              <Message
                image={image}
                message={message}
              />
            </div>
            <Grid>
              <CaptureDetails
                labels={{
                  cardBrand: t('models.card.brand'),
                  cardNumber: t('models.card.number'),
                  customerEmail: t('models.customer.email'),
                  customerName: t('models.customer.name'),
                  installments: t('installments'),
                }}
                contents={{
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
                }}
              />
              <Row>
                <Col palm={12} tablet={8} desk={8} tv={8}>
                  <Property
                    title={t('pages.transaction.header.card_amount')}
                    value={currency(authorizedAmount)}
                  />
                </Col>
                <Col palm={12} tablet={4} desk={4} tv={4}>
                  <Property
                    title={t('pages.transaction.paid_amount')}
                    value={
                      <span className={style.capturedAmount}>
                        {currency(paidAmount)}
                      </span>
                    }
                  />
                </Col>
              </Row>
            </Grid>
          </div>
        :
          <Alert
            icon={<IconError height={16} width={16} />}
            type="error"
          >
            {statusMessage}
          </Alert>
      }
    </ModalContent>
    <Spacing />
    <ModalActions>
      { status !== 'error'
        ?
          <Button
            fill="outline"
            onClick={onViewTransaction}
          >
            {t('view_transaction')}
          </Button>
        :
          <Button
            fill="outline"
            onClick={onRetry}
          >
            {t('try_again')}
          </Button>
      }
    </ModalActions>
  </Fragment>
)

Result.propTypes = {
  authorizedAmount: PropTypes.number.isRequired,
  cardBrand: PropTypes.string,
  cardFirstDigits: PropTypes.string,
  cardLastDigits: PropTypes.string,
  customerEmail: PropTypes.string,
  customerName: PropTypes.string,
  image: PropTypes.node.isRequired,
  installments: PropTypes.number,
  message: PropTypes.node.isRequired,
  onRetry: PropTypes.func.isRequired,
  onViewTransaction: PropTypes.func.isRequired,
  paidAmount: PropTypes.number.isRequired,
  status: PropTypes.oneOf([
    'current',
    'error',
    'success',
  ]).isRequired,
  statusMessage: PropTypes.string,
  t: PropTypes.func.isRequired,
}

Result.defaultProps = {
  cardBrand: null,
  cardFirstDigits: null,
  cardLastDigits: null,
  customerEmail: null,
  customerName: null,
  installments: 0,
  statusMessage: null,
}

export default Result
