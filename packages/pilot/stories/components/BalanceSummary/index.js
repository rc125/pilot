import React from 'react'
import Section from '../../Section'
import BalanceSummary from '../../../src/components/BalanceSummary'

const amount = {
  outcoming: {
    title: 'Total de entradas',
    unity: 'R$',
    value: 1400000,
  },
  outgoing: {
    title: 'Total de Saídas',
    unity: 'R$',
    value: -400000,
  },
  net: { // eslint-disable-line sort-keys
    title: 'Total Líquido',
    unity: 'R$',
    value: 1000000,
  },
}

const BalanceSummaryExample = () => (
  <Section>
    <BalanceSummary
      amount={amount}
      loading={false}
    />
  </Section>
)

export default BalanceSummaryExample
