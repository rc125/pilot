import React from 'react'

import GenericError from '../pages/Errors/GenericError'

export default [
  {
    affectedRoutes: [/\/anticipation\/re_\w+/],
    getComponent: localized => (
      <GenericError
        {...localized}
        showActions
        action={({ actions, history }) => {
          actions.clearErrors()

          history.replace('/transactions')
        }}
      />
    ),
    localized: t => ({
      actionText: t('go_back'),
      message: t('pages.balance.adblock_error'),
      title: t('pages.error.unauthorized_title'),
    }),
    message: /./,
    method: /./,
    name: /./,
    status: /./,
    type: /unknown/,
    validation: () => navigator.onLine,
  },
]
