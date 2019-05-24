import React from 'react'
import PropTypes from 'prop-types'
import {
  Card,
  CardContent,

  Button,
} from 'former-kit'

import IconCopy from 'emblematic-icons/svg/Copy24.svg'
import IconBarCode from 'emblematic-icons/svg/BarCode24.svg'

import CopyButton from '../CopyButton'

import style from './style.css'

const PaymentBoleto = ({
  barcode,
  copyBarcodeFeedback,
  copyBarcodeLabel,
  dueDate,
  dueDateLabel,
  onCopy,
  onShow,
  showBoletoLabel,
  title,
}) => (
  <Card className={style.card}>
    <CardContent className={style.cardContent}>
      <div className={style.cardTitle}>
        <h2>{title}</h2>
        <Button
          fill="clean"
          size="tiny"
          onClick={onShow}
        >
          {showBoletoLabel}
        </Button>
      </div>
      <div className={style.cardBarCode}>
        <IconBarCode width={25} height={25} />
        <strong>{barcode}</strong>
      </div>
      <div className={style.cardDueDate}>
        <p>{dueDateLabel} {dueDate}</p>
        <CopyButton
          feedbackText={copyBarcodeFeedback}
          feedbackTimeout={3000}
          fill="clean"
          icon={<IconCopy width="12px" height="12px" />}
          onClick={() => onCopy(barcode)}
          size="tiny"
          title={copyBarcodeLabel}
        />
      </div>
    </CardContent>
  </Card>
)

PaymentBoleto.propTypes = {
  barcode: PropTypes.string,
  copyBarcodeFeedback: PropTypes.string.isRequired,
  copyBarcodeLabel: PropTypes.string.isRequired,
  dueDate: PropTypes.string.isRequired,
  dueDateLabel: PropTypes.string.isRequired,
  onCopy: PropTypes.func.isRequired,
  onShow: PropTypes.func.isRequired,
  showBoletoLabel: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
}

PaymentBoleto.defaultProps = {
  barcode: null,
}

export default PaymentBoleto

