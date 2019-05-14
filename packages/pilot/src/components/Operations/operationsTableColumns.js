import React from 'react'
import {
  all,
  always,
  any,
  either,
  equals,
  isNil,
  map,
  pipe,
  prop,
  propSatisfies,
  lt,
  when,
  __,
} from 'ramda'
import classNames from 'classnames'
import { Tooltip } from 'former-kit'
import IconAnticipation from 'emblematic-icons/svg/Undo24.svg'
import currencyFormatter from '../../formatters/currency'
import style from './style.css'
import dateFormatter from '../../../src/formatters/longDate'

const isPayable = equals('payable')

const getValueClass = (value) => {
  if (value > 0) {
    return style.positive
  }
  if (value < 0) {
    return style.negative
  }

  return style.zero
}

const renderValueAndOperator = (value) => {
  if (value > 0) {
    return (
      <span className={classNames(style.operator, style.positive)}>
        +
      </span>
    )
  }
  if (value < 0) {
    return (
      <span className={classNames(style.operator, style.negative)}>
        -
      </span>
    )
  }

  return null
}

const getTypeLabel = (type, labels) => {
  if (!isNil(type) && !isPayable(type)) {
    return labels[type]
  }

  return null
}

const isNotAnticipation = propSatisfies(isNil, 'original')

const isTransferSource = lt(__, 0)

const renderTargetOrSource = (type, net, targetId, sourceId, labels) => {
  if (type === 'inter_recipient' && isTransferSource(net)) {
    return (<div>{`${labels.to} ${targetId}`}</div>)
  }

  if (type === 'inter_recipient' && !isTransferSource(net)) {
    return (<div>{`${labels.from} ${sourceId}`}</div>)
  }

  return null
}

/* eslint-disable react/prop-types */
const renderDescription = ({
  installment,
  net,
  sourceId,
  targetId,
  type,
}, labels) => (
  <div className={style.descriptionColumn}>
    <div className={style.type}>{getTypeLabel(type, labels)}</div>
    {!isNil(installment) &&
      <div>{`${labels.installment} ${installment}`}</div>
    }
    {renderTargetOrSource(type, net, targetId, sourceId, labels)}
  </div>
)
/* eslint-enable react/prop-types */

const getAbsoluteValue = Math.abs

const renderNet = net => ( // eslint-disable-line react/prop-types
  <span className={classNames(style.net, getValueClass(net))}>
    {renderValueAndOperator(net)}
    {currencyFormatter(getAbsoluteValue(net))}
  </span>
)

// eslint-disable-next-line react/prop-types
const renderOperationAmount = (labels, isNegative) => ({ amount, type }) => {
  if (amount === 0) {
    return null
  }

  const absoluteAmount = getAbsoluteValue(amount)
  const outAmount = currencyFormatter(absoluteAmount)
  const outType = getTypeLabel(type, labels)
  return (
    <div
      key={`${amount}_${type}`}
      className={style.outAmount}
    >
      {outType && <span>({ outType })</span>}
      {
        renderValueAndOperator(isNegative
          ? -absoluteAmount
          : absoluteAmount)
      }
      <span>
        {outAmount}
      </span>
    </div>
  )
}

const isInvalidAmount = pipe(prop('amount'), either(isNil, Number.isNaN))

const hasInvalidAmount = any(isInvalidAmount)

const buildOperationsAmount = when(
  all(isNil),
  always(null)
)

const renderOperationAmounts = (amounts, labels, isNegative) => {
  if (hasInvalidAmount(amounts)) {
    return null
  }

  const operationAmounts = map(
    renderOperationAmount(labels, isNegative),
    amounts
  )

  return buildOperationsAmount(operationAmounts)
}

const renderOutcoming = (amounts, labels) =>
  renderOperationAmounts(amounts, labels)

const renderOutgoing = (amounts, labels) =>
  renderOperationAmounts(amounts, labels, true)

const renderPaymentDate = (paymentDate, toolTipText) => {
  if (isNotAnticipation(paymentDate)) {
    return dateFormatter(paymentDate.actual)
  }
  return (
    <Tooltip
      content={toolTipText}
      placement="rightMiddle"
    >
      <div className={style.payment}>
        <div>
          <div className={style.anticipationDate}>
            {dateFormatter(paymentDate.actual)}
          </div>
          <div>{dateFormatter(paymentDate.original)}</div>
        </div>
        <span className={style.anticipationIcon}>
          <IconAnticipation width={12} height={12} />
        </span>
      </div>
    </Tooltip>
  )
}

const getColumns = labels => ([
  {
    accessor: ['paymentDate', 'actual'],
    align: 'center',
    orderable: false,
    renderer: ({ paymentDate }) =>
      renderPaymentDate(paymentDate, labels.anticipationMessage),
    title: 'models.operations.payment_date',
  },
  {
    accessor: ['id'],
    align: 'center',
    orderable: false,
    title: 'models.operations.id',
  },
  {
    accessor: ['transactionId'],
    align: 'center',
    orderable: false,
    title: 'models.operations.transaction_id',
  },
  {
    accessor: ['type'],
    align: 'start',
    orderable: false,
    renderer: operation => renderDescription(operation, labels),
    title: 'models.operations.description',
  },
  {
    accessor: ['outcoming', 'amount'],
    align: 'end',
    orderable: false,
    renderer: ({ outcoming }) => renderOutcoming(outcoming, labels),
    title: 'models.operations.outcoming',
  },
  {
    accessor: ['outgoing', 'amount'],
    align: 'end',
    orderable: false,
    renderer: ({ outgoing }) => renderOutgoing(outgoing, labels),
    title: 'models.operations.outgoing',
  },
  {
    accessor: ['net'],
    align: 'end',
    orderable: false,
    renderer: ({ net }) => renderNet(net),
    title: 'models.operations.net',
  },
])

export default getColumns
