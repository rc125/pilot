import React from 'react'
import PropTypes from 'prop-types'
import {
  Button,
  Card,
  CardContent,
  CardTitle,
} from 'former-kit'
import currencyToParts from '../../formatters/currencyToParts'

import style from './style.css'

const BalanceTotalDisplay = ({
  action,
  amount,
  detail,
  disabled,
  title,
}) => {
  const { symbol, value } = currencyToParts(Math.abs(amount))
  return (
    <Card>
      <CardTitle
        className={style.title}
        title={title}
      />
      <CardContent>
        <span className={style.symbol}>
          {symbol}
        </span>
        <span className={style.amount}>
          {value}
        </span>
        <div className={style.detail}>
          {detail}
        </div>
        {
          action &&
          <Button
            disabled={disabled}
            fill="gradient"
            onClick={action.onClick}
            size="default"
          >
            {action.title}
          </Button>
        }
      </CardContent>
    </Card>
  )
}

BalanceTotalDisplay.propTypes = {
  action: PropTypes.shape({
    onClick: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
  }),
  amount: PropTypes.number.isRequired,
  detail: PropTypes.node,
  // The detail property was changed to not be required
  // because of issue #1159 (https://github.com/pagarme/pilot/issues/1159)
  // This component is imported in Balance container and need to
  // not pass this property until this issue is reverted
  // This code will be used again in the future when ATLAS project implements the anticipation flow
  // More details in issue #1159
  // detail: PropTypes.node.isRequired,
  disabled: PropTypes.bool,
  title: PropTypes.string.isRequired,
}

BalanceTotalDisplay.defaultProps = {
  action: null,
  // The detail property was changed to not be required
  // because of issue #1159 (https://github.com/pagarme/pilot/issues/1159)
  // This component is imported in Balance container and need to
  // not pass this property until this issue is reverted
  // This code will be used again in the future when ATLAS project implements the anticipation flow
  // More details in issue #1159
  // detail: PropTypes.node.isRequired,
  detail: null,
  disabled: false,
}

export default BalanceTotalDisplay
