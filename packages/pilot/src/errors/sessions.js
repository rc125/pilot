import React from 'react'

import GenericError from '../pages/Errors/GenericError'

export default [
  {
    affectedRoutes: [/./],
    getComponent: localized => <GenericError {...localized} />,
    localized: t => ({
      message: t('pages.error.unauthorized'),
      title: t('pages.error.unauthorized_title'),
    }),
    message: /Sessão inválida/,
    method: /get/,
    name: /ApiError/,
    status: /401/,
    type: /action_forbidden/,
  },
  {
    affectedRoutes: [/./],
    localized: t => ({
      message: t('models.user.permission.errors.insufficient_permission.message'),
      title: t('models.user.permission.errors.insufficient_permission.title'),
    }),
    message: /Permissão insuficiente para realizar essa requisição/,
    method: /post/,
    name: /ApiError/,
    status: /403/,
    type: /action_forbidden/,
  },
]
