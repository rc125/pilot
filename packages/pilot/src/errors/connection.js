import React from 'react'

import NoConnection from '../pages/Errors/NoConnection'
import GenericError from '../pages/Errors/GenericError'

export default [
  {
    affectedRoutes: [/./],
    getComponent: () => <NoConnection />,
    message: /./,
    method: /./,
    name: 'TypeError',
    status: undefined,
    type: /unknown/,
    validation: () => !navigator.onLine,
  },
  {
    affectedRoutes: [/./],
    getComponent: localized => (
      <GenericError
        {...localized}
        showActions
        action={({ actions, history }) => {
          actions.clearErrors()
          history.replace('/balance')
        }}
      />
    ),
    localized: t => ({
      actionText: t('go_back'),
      message: t('pages.error.internal_message'),
      title: t('pages.error.internal_title'),
    }),
    message: /./,
    method: /./,
    name: /./,
    status: /500/,
    type: /./,
  },
  {
    affectedRoutes: [/./],
    getComponent: localized => (
      <GenericError
        {...localized}
        showActions
        action={({ actions, history }) => {
          actions.clearErrors()
          history.replace('/balance')
        }}
      />
    ),
    localized: t => ({
      actionText: t('go_back'),
      message: t('pages.error.rate_limit_message'),
      title: t('pages.error.rate_limit_title'),
    }),
    message: /./,
    method: /./,
    name: /./,
    status: /429/,
    type: /./,
  },
]
