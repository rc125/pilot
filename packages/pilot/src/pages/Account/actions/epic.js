import pagarme from 'pagarme'
import {
  identity,
  pathOr,
  propEq,
} from 'ramda'
import {
  catchError,
  map,
  mergeMap,
  tap,
} from 'rxjs/operators'
import { of as rxOf } from 'rxjs'
import { combineEpics, ofType } from 'redux-observable'
import cockpit from 'cockpit'
import env from '../../../environment'
import identifyUser from '../../../vendor/identifyUser'
import setCompany from '../../../vendor/setCompany'
import {
  ACCOUNT_RECEIVE,
  COMPANY_RECEIVE,
  failLogin,
  LOGIN_RECEIVE,
  LOGIN_REQUEST,
  LOGOUT_REQUEST,
  receiveAccount,
  receiveCompany,
  receiveLogin,
  receiveLogout,
  receiveRecipientBalance,
} from '.'

import { store } from '../../../App'

import { WITHDRAW_RECEIVE } from '../../Withdraw/actions'
import { receiveError } from '../../ErrorBoundary'
import { activeCompanyLogin, inactiveCompanyLogin } from '../../../vendor/googleTagManager'

const isActiveCompany = propEq('status', 'active')

const getRecipientId = pathOr(null, ['account', 'company', 'default_recipient_id', env])

const errorHandler = (error) => {
  store.dispatch(receiveError(error))
  return Promise.reject(error)
}

const loginEpic = action$ =>
  action$
    .pipe(
      ofType(LOGIN_REQUEST),
      mergeMap(action => pagarme.client.connect(action.payload)
        .then(client => cockpit(client, errorHandler))
        .then(receiveLogin)
        .catch((error) => {
          try {
            // eslint-disable-next-line no-undef
            localStorage.removeItem('redux_localstorage_simple_account.sessionId')
          } catch (err) {
            console.warn(err.message) //eslint-disable-line
          }
          return failLogin(error)
        }))
    )

const accountEpic = action$ =>
  action$
    .pipe(
      ofType(LOGIN_RECEIVE),
      mergeMap((action) => {
        const { error, payload: client } = action

        if (error) {
          return Promise.resolve(action.payload)
        }

        return client.user.current().catch(identity)
      }),
      map(receiveAccount),
      tap(({ error, payload }) => {
        if (error) {
          return
        }

        const {
          date_created: dateCreated,
          email,
          id,
          name,
          permission,
        } = payload

        identifyUser(
          id,
          email,
          name,
          dateCreated,
          permission,
          env
        )
      })
    )

const verifyEnvironmentPermission = (company) => {
  if (env === 'live' && !isActiveCompany(company)) {
    throw new Error('Unauthorized environment')
  }

  return company
}

const companyEpic = (action$, state$) =>
  action$
    .pipe(
      ofType(ACCOUNT_RECEIVE),
      mergeMap(({ error, payload }) => {
        const { value: state } = state$
        const { account: { client } } = state

        if (error) {
          return Promise.resolve(payload)
        }

        return client.company.current()
          .then(verifyEnvironmentPermission)
      }),
      map(receiveCompany),
      tap(({ error, payload }) => {
        if (error) {
          return
        }
        const { value: state } = state$
        const {
          dateCreated,
          id,
          name,
          status,
        } = payload

        const {
          account: {
            user: {
              id: userId,
            },
          },
        } = state

        setCompany(
          id,
          name,
          dateCreated,
          status,
          userId
        )

        if (status === 'active') {
          activeCompanyLogin()
        } else {
          inactiveCompanyLogin()
        }
      }),
      catchError(error => rxOf(receiveError(error)))
    )

const recipientBalanceEpic = (action$, state$) =>
  action$
    .pipe(
      ofType(COMPANY_RECEIVE, WITHDRAW_RECEIVE),
      mergeMap(({ error, payload }) => {
        const state = state$.value
        const recipientId = getRecipientId(state)
        const { account: { client } } = state

        if (error) {
          return Promise.resolve(payload)
        }

        return client.recipient.balance(recipientId).catch(identity)
      }),
      map(receiveRecipientBalance)
    )

const logoutEpic = (action$, state$) =>
  action$
    .pipe(
      ofType(LOGOUT_REQUEST),
      mergeMap(() => {
        const state = state$.value
        const {
          account: {
            client,
            sessionId,
          },
        } = state

        return client.session
          .destroy(sessionId)
      }),
      map(receiveLogout)
    )

export default combineEpics(
  loginEpic,
  accountEpic,
  companyEpic,
  recipientBalanceEpic,
  logoutEpic
)
