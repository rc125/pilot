export default [
  {
    affectedRoutes: [/\/(withdraw|anticipation|balance)\/re_\w+/],
    localized: t => ({
      message: t('pages.withdraw.no_recipient'),
    }),
    message: /Recipient não encontrado/,
    method: /get/,
    name: /ApiError/,
    status: 404,
    type: /not_found/,
  },
]
