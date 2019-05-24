import { flatten } from 'ramda'
import connection from './connection'
import sessions from './sessions'
import unauthorizedEnvironment from './unauthorizedEnvironment'
import transactions from './transactions'
import react from './react'
import anticipation from './anticipation'
import recipient from './recipient'

export default flatten([
  anticipation,
  connection,
  sessions,
  unauthorizedEnvironment,
  transactions,
  react,
  recipient,
])
