import React from 'react'

import ApplicationError from '../pages/Errors/ApplicationError'

export default [
  {
    affectedRoutes: [/./],
    getComponent: () => <ApplicationError />,
    message: /./,
    name: /./,
    source: /react/,
  },
]
