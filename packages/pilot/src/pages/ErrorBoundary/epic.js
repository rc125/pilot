import { map } from 'rxjs/operators'
import { ofType } from 'redux-observable'
import { LOGOUT_RECEIVE } from '../Account/actions'
import { clearAllErrors } from '.'

const logoutClearEpic = action$ =>
  action$
    .pipe(
      ofType(LOGOUT_RECEIVE),
      map(clearAllErrors)
    )

export default logoutClearEpic
