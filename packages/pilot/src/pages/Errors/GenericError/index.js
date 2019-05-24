import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { translate } from 'react-i18next'
import { compose } from 'ramda'
import { connect } from 'react-redux'
import {
  Button,
  Modal,
  ModalContent,
} from 'former-kit'

import { Message, MessageActions } from '../../../components/Message'
import Icon from './Icon.svg'
import { receiveLogout } from '../../Account/actions'
import { clearAllErrors } from '../../ErrorBoundary'

const mapDispatchToProps = dispatch => ({
  clearErrors: () => dispatch(clearAllErrors()),
  logout: () => dispatch(receiveLogout()),
})

const enhanced = compose(
  connect(null, mapDispatchToProps),
  withRouter,
  translate()
)

const GenericError = ({
  action,
  actionText,
  clearErrors,
  history,
  image,
  logout,
  message,
  showActions,
  t,
  title,
}) => (
  <Modal isOpen>
    <ModalContent>
      <Message
        image={image || <Icon width={365} height={148} />}
        message={message}
        title={title}
      >
        { showActions &&
          <MessageActions>
            <Button
              fill="gradient"
              onClick={() => {
                if (action) {
                  return action({
                    actions: {
                      clearErrors,
                      logout,
                    },
                    history,
                  })
                }

                return logout()
              }}
            >
              {actionText || t('pages.error.back_to_login')}
            </Button>
          </MessageActions>
        }
      </Message>
    </ModalContent>
  </Modal>
)

GenericError.propTypes = {
  action: PropTypes.func,
  actionText: PropTypes.string,
  clearErrors: PropTypes.func.isRequired,
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
    location: PropTypes.shape({
      hash: PropTypes.string.isRequired,
      pathname: PropTypes.string.isRequired,
      search: PropTypes.string.isRequired,
    }),
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
  }).isRequired,
  image: PropTypes.element,
  logout: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired,
  showActions: PropTypes.bool,
  t: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
}

GenericError.defaultProps = {
  action: undefined,
  actionText: undefined,
  image: undefined,
  showActions: true,
}

export default enhanced(GenericError)
