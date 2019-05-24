import {
  apply,
  applySpec,
  juxt,
  negate,
  pipe,
  reduce,
  subtract,
} from 'ramda'

const buildTotal = direction => reduce((acc, val) => {
  const available = val.available.amount[direction]
  const fee = val.available.fee[direction]

  return acc + (available - fee)
}, 0)

const getOutgoing = pipe(
  buildTotal('out'),
  negate
)

const buildBalanceTotal = applySpec({
  net: pipe(
    juxt([buildTotal('in'), getOutgoing]),
    apply(subtract)
  ),
  outcoming: buildTotal('in'),
  outgoing: getOutgoing,
})

export default buildBalanceTotal
