import React from 'react'
import GenericError from '../pages/Errors/GenericError'

export default [
  {
    affectedRoutes: [/./],
    getComponent: localized => (
      <GenericError
        {...localized}
      />
    ),
    localized: t => ({
      message: t('pages.error.unauthorized_live_environment'),
      title: t('pages.error.unauthorized_live_environment_title'),
    }),
    message: /Unauthorized environment/,
    method: /./,
    name: /./,
    status: /./,
    type: /unknown/,
  },
]
