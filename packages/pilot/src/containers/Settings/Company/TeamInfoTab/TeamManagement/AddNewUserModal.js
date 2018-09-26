/* eslint-disable */
import React from 'react'
import PropTypes from 'prop-types'
import Form from 'react-vanilla-form'
import {
  Alert,
  Button,
  FormInput,
  Modal,
  ModalTitle,
  ModalContent,
  ModalActions,
  RadioGroup,
} from 'former-kit'
import IconWarning from 'emblematic-icons/svg/Warning32.svg'
import IconInfo from 'emblematic-icons/svg/Info32.svg'
import Close from 'emblematic-icons/svg/ClearClose32.svg'

import emailValidation from '../../../../../validation/email'

const isEmail = t => emailValidation(t('validations.isEmail'))
const required = t => value => (value ? null : t('pages.settings.user.card.access.field_required'))
const permissions = [
  {
    name: 'Administrador',
    value: 'admin',
  },
  {
    name: 'Apenas leitura',
    value: 'read_only',
  },
  {
    name: 'Leitura e escrita',
    value: 'read_write',
  },
]

class AddNewUserModal extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      currentData: {
        email: '',
        permission: '',
      },
      submittedEmail: null,
    }
    this.handleFormSubmit = this.handleFormSubmit.bind(this)
    this.handleFormOnChange = this.handleFormOnChange.bind(this)
  }

  componentWillReceiveProps (nextProps) {
    const { status: { success } } = nextProps

    if (success) {
      this.setState({
        currentData: {
          email: '',
          permission: '',
        },
      })
    }
  }

  handleFormSubmit (data, errors) {
    if (!errors) {
      this.setState({
        submittedEmail: data.email,
      })
      this.props.handleCreateUser(data)
    }
  }

  handleFormOnChange (currentData) {
    this.setState({
      currentData,
    })
  }

  render () {
    const {
      handleCloseModal,
      isOpen,
      status,
      t,
    } = this.props

    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={handleCloseModal}
      >
        <Form
          data={this.state.currentData}
          customErrorProp="error"
          onSubmit={this.handleFormSubmit}
          validation={
            {
              email: [
                required(t),
                isEmail(t),
              ],
              permission: required(t),
            }
          }
          onChange={this.handleFormOnChange}
        >
          <ModalTitle
            title={t('pages.settings.company.card.team.table.add_user')}
            titleAlign="center"
            onClose={handleCloseModal}
            closeIcon={<Close height={16} width={16} />}
          />
          <hr />
          <ModalContent>
            <p>
              {t('pages.settings.company.card.team.modal.identification')}
            </p>

            <FormInput
              label={t('email')}
              name="email"
            />

            <p>
              <small>
                {t('pages.settings.company.card.team.modal.access_level')}
              </small>
            </p>

            <RadioGroup
              options={permissions}
              name="permission"
            />

            {status.error &&
              <Alert
                type="error"
                icon={<IconWarning height={16} width={16} />}
              >
                <p>{status.error}</p>
              </Alert>
            }
            {status.success &&
              <Alert
                type="info"
                icon={<IconInfo height={16} width={16} />}
              >
                {t('pages.settings.company.card.team.modal.success',
                  { email: this.state.submittedEmail })
                }
              </Alert>
            }
          </ModalContent>

          <ModalActions>
            <Button
              fill="outline"
              size="default"
              onClick={handleCloseModal}
              disabled={status.loading}
            >
              Cancelar
            </Button>

            <Button
              size="default"
              type="submit"
              disabled={status.loading}
            >
              Confirmar
            </Button>
          </ModalActions>
        </Form>
      </Modal>
    )
  }
}

AddNewUserModal.propTypes = {
  handleCloseModal: PropTypes.func.isRequired,
  handleCreateUser: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  status: PropTypes.shape({
    error: PropTypes.string,
    loading: PropTypes.bool,
    success: PropTypes.bool,
  }).isRequired,
  t: PropTypes.func.isRequired,
}

export default AddNewUserModal
