import React, { Fragment } from 'react'
import PropTypes from 'prop-types'

import {
  Col,
  Grid,
  ModalContent,
  ModalTitle,
  Row,
  Truncate,
} from 'former-kit'

import { mapObjIndexed } from 'ramda'

import formatCardNumber from '../../formatters/cardNumber'
import formatCurrency from '../../formatters/currency'
import Property from '../Property'
import style from './style.css'

const fields = (labels, contents) => mapObjIndexed((label, key) => (
  <Property
    title={label}
    value={contents[key]}
  />
), labels)

const CreditCardRefundDetails = ({ contents, labels, title }) => {
  const {
    amount,
    brand,
    cardFirstDigits,
    cardLastDigits,
    email,
    holderName,
    installments,
  } = contents

  const formattedContent = {
    amount: formatCurrency(amount),
    brand,
    cardNumber: `${formatCardNumber(cardFirstDigits)} ${cardLastDigits}`,
    email: (
      <span className={style.value}>
        <Truncate
          text={email}
        />
      </span>
    ),
    holderName,
    installments,
  }

  const data = fields(labels, formattedContent)

  return (
    <Fragment>
      <ModalTitle
        title={title}
        titleAlign="start"
      />
      <ModalContent>
        <Grid>
          <Row>
            <Col palm={12} tablet={7} desk={7} tv={7}>
              {data.holderName}
            </Col>

            <Col palm={12} tablet={5} desk={5} tv={5}>
              {data.email}
            </Col>

            <Col palm={12} tablet={4} desk={4} tv={4}>
              {data.cardNumber}
            </Col>

            <Col palm={12} tablet={3} desk={3} tv={3}>
              {data.brand}
            </Col>

            <Col palm={12} tablet={5} desk={5} tv={5}>
              {data.installments}
            </Col>

            <Col palm={12} tablet={7} desk={7} tv={7}>
              {data.amount}
            </Col>

            <Col palm={12} tablet={5} desk={5} tv={5}>
              <Property
                title={labels.refundAmount}
                value={
                  <span className={style.refundAmount}>
                    {formatCurrency(contents.refundAmount)}
                  </span>
                }
              />
            </Col>
          </Row>
        </Grid>
      </ModalContent>
    </Fragment>
  )
}

CreditCardRefundDetails.propTypes = {
  contents: PropTypes.shape({
    amount: PropTypes.number.isRequired,
    brand: PropTypes.string.isRequired,
    cardFirstDigits: PropTypes.string.isRequired,
    cardLastDigits: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    holderName: PropTypes.string.isRequired,
    installments: PropTypes.string.isRequired,
    refundAmount: PropTypes.string.isRequired,
  }).isRequired,
  labels: PropTypes.shape({
    amount: PropTypes.string.isRequired,
    brand: PropTypes.string.isRequired,
    cardNumber: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    holderName: PropTypes.string.isRequired,
    installments: PropTypes.string.isRequired,
    refundAmount: PropTypes.string.isRequired,
  }).isRequired,
  title: PropTypes.string.isRequired,
}

export default CreditCardRefundDetails
