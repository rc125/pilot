import React from 'react'
import PropTypes from 'prop-types'
import { translate } from 'react-i18next'
import {
  Button,
  Modal,
  ModalContent,
} from 'former-kit'
import {
  Message,
  MessageActions,
} from '../../../components/Message'
import Icon from './Icon.svg'

const enhanced = translate()

const ApplicationError = ({
  t,
}) => (
  <Modal isOpen>
    <ModalContent>
      <Message
        image={<Icon width={365} height={148} />}
        message={t('pages.error.application_message')}
        title={t('pages.error.application_title')}
      >
        <MessageActions>
          <Button
            fill="gradient"
            // eslint-disable-next-line no-restricted-globals
            onClick={() => location.reload()}
          >
            {t('pages.error.page_refresh')}
          </Button>
        </MessageActions>
      </Message>
    </ModalContent>
  </Modal>
)

ApplicationError.propTypes = {
  t: PropTypes.func.isRequired,
}

export default enhanced(ApplicationError)
