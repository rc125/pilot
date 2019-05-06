import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import ContentLoader from 'react-content-loader'

import DataDisplay from '../DataDisplay'
import withLoading from '../withLoader'
import currencyToParts from '../../formatters/currencyToParts'

import style from './style.css'

const Skeleton = (
  <ContentLoader
    speed={2}
    primaryColor="#d9d9d9"
    secondaryColor="#ecebeb"
    className={style.overlay}
  >
    <rect x={0} y={50} rx={4} ry={4} width="100%" height={60} />
  </ContentLoader>
)

const withSkeleton = withLoading(Skeleton)

const renderSymbol = (value) => {
  if (value < 0) {
    return '-'
  }

  if (value > 0) {
    return '+'
  }

  return null
}

const renderValue = (amount, amountSize, color) => {
  const { symbol, value } = currencyToParts(Math.abs(amount))
  return (
    <div className={style.amount}>
      <small style={{ color }}>
        {renderSymbol(amount)}
      </small>
      {
        !value || value === 'NaN'
        ? <div className={style.empty} />
        : (
          <div className={style.value}>
            <span className={style.symbol}>{symbol}</span>
            <span className={
              classNames({
                [style[amountSize]]: amountSize,
              })}
            >
              {value}
            </span>
          </div>
        )
      }
    </div>
  )
}

const renderTitle = (title, titleColor, color, titleSize) => (
  <span
    className={
      classNames({
        [style[titleSize]]: titleSize,
    })}
    style={{
      color: titleColor || color,
     }}
  >
    {title}
  </span>
)

const TotalDisplay = ({
  align,
  amount,
  amountSize,
  color,
  subtitle,
  title,
  titleColor,
  titleSize,
  valueSize,
}) => (
  <DataDisplay
    align={align}
    color={color}
    subtitle={subtitle}
    title={renderTitle(title, titleColor, color, titleSize)}
    titleSize={titleSize}
    valueSize={valueSize}
  >
    {renderValue(amount, amountSize, color)}
  </DataDisplay>
)

const sizePropType = PropTypes.oneOf(['small', 'medium', 'large', 'huge'])

TotalDisplay.propTypes = {
  align: PropTypes.oneOf([
    'center',
    'end',
    'start',
  ]),
  amount: PropTypes.number.isRequired,
  amountSize: (sizePropType),
  color: PropTypes.string.isRequired,
  subtitle: PropTypes.node,
  title: PropTypes.node.isRequired,
  titleColor: PropTypes.string,
  titleSize: (sizePropType),
  valueSize: (sizePropType),
}

TotalDisplay.defaultProps = {
  align: 'center',
  amountSize: 'large',
  subtitle: null,
  titleColor: null,
  titleSize: 'small',
  valueSize: 'medium',
}

export default withSkeleton(TotalDisplay)
