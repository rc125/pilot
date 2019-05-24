import { isNil } from 'ramda'
import Intl from 'intl'
import 'intl/locale-data/jsonp/pt'

const formatter = new Intl.NumberFormat('pt-BR', {
  currency: 'BRL',
  style: 'currency',
})

const numberFormatter = (amount) => {
  const valueFormat = Number(amount) / 100
  const [symbol, ...others] = formatter.formatToParts(valueFormat)
  return {
    symbol: symbol.value,
    value: others.map(({ value }) => value).join(''),
  }
}

const currencyToParts = (value) => {
  if (isNil(value)) {
    return null
  }

  return numberFormatter(value)
}

export default currencyToParts
