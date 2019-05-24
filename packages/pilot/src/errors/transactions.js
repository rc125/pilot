export default [
  {
    affectedRoutes: [/\/transactions\/\w+/],
    localized: t => ({
      message: t('pages.transaction.errors.not_found'),
      title: t('error'),
    }),
    message: /./,
    method: /./,
    name: /./,
    status: /400|404|500/,
    type: /not_found|invalid_parameter|internal_error|unknown/,
  },
]
