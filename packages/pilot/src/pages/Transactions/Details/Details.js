/* eslint-disable camelcase */
import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'
import {
  equals,
  always,
  complement,
  compose,
  either,
  head,
  ifElse,
  is,
  isEmpty,
  isNil,
  length,
  pipe,
  prop,
  tail,
} from 'ramda'
import moment from 'moment'
import qs from 'qs'
import IconInfo from 'emblematic-icons/svg/Info32.svg'
import { Alert } from 'former-kit'

import {
  requestDetails,
  receiveDetails,
} from './actions'
import Reprocess from '../../Reprocess'
import currencyFormatter from '../../../formatters/decimalCurrency'
import getColumnFormatter from '../../../formatters/columnTranslator'
import installmentTableColumns from '../../../components/RecipientSection/installmentTableColumns'
import ManualReview from '../../ManualReview'
import TransactionDetailsContainer from '../../../containers/TransactionDetails'
import Refund from '../../Refund'
import Capture from '../../Capture'
import { withError } from '../../ErrorBoundary'

const hasPrintInQueryString = pipe(
  tail,
  qs.parse,
  prop('print'),
  equals('true')
)

const mapStateToProps = ({
  account: {
    client,
    user: {
      permission,
    },
  },
  transactionDetails: { loading },
  transactions: { query },
}) => ({
  client,
  loading,
  permission,
  query,
})

const mapDispatchToProps = ({
  onReceiveDetails: receiveDetails,
  onRequestDetails: requestDetails,
})

const enhanced = compose(
  translate(),
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  withRouter,
  withError
)

const copyToClipBoard = (text) => {
  /* eslint-disable no-undef */
  const textarea = document.createElement('textarea')
  textarea.textContent = text
  textarea.style.opacity = 0
  textarea.style.position = 'absolute'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
  /* eslint-enable no-undef */
}

const getTransactionDetailsLabels = t => ({
  acquirer_name: t('pages.transaction.acquirer_name'),
  acquirer_response_code: t('pages.transaction.acquirer_response_code'),
  antifraud_score: t('pages.transaction.antifraud_score'),
  authorization_code: t('pages.transaction.authorization_code'),
  capture_method: t('pages.transaction.capture_method'),
  nsu: t('pages.transaction.nsu'),
  soft_descriptor: t('pages.transaction.soft_descriptor'),
  subscription_id: t('pages.transaction.subscription_id'),
  tid: t('pages.transaction.tid'),
  title: t('pages.transaction.title'),
})

const countCustomerPhones = pipe(
  prop('phones'),
  ifElse(
    either(isNil, complement(is(Array))),
    always(0),
    length
  )
)

const getCustomerLabels = (customer, t) => ({
  birthday: t('models.customer.birthday'),
  city: t('models.customer.city'),
  complementary: t('models.customer.complement'),
  document_number: t('models.customer.document_number'),
  email: t('models.customer.email'),
  name: t('models.customer.name'),
  neighborhood: t('models.customer.neighborhood'),
  phone: t('models.customer.phone', { count: countCustomerPhones(customer) }),
  state: t('models.customer.state'),
  street: t('models.customer.street'),
  street_number: t('models.customer.number'),
  title: t('pages.transaction.customer_card_title'),
  zipcode: t('models.customer.zip_code'),
})

const getEventsLabels = t => ({
  title: t('pages.transaction.events_title'),
})

const getPaymentBoletoLabels = t => ({
  copy: t('pages.transaction.copy'),
  due_date: t('pages.transaction.boleto.due_date'),
  feedback: t('pages.transaction.boleto.feedback'),
  show: t('pages.transaction.boleto.show'),
  title: t('pages.transaction.boleto.title'),
})

const getPaymentCardLabels = t => ({
  title: t('pages.transaction.credit_card'),
})

const getRiskLevelsLabels = t => ({
  high: t('pages.transaction.risk_level.high'),
  low: t('pages.transaction.risk_level.low'),
  moderated: t('pages.transaction.risk_level.moderated'),
  very_high: t('pages.transaction.risk_level.very_high'),
  very_low: t('pages.transaction.risk_level.very_low'),
})

// TODO: Remove this function and it usage when the this issue is solved
// https://github.com/pagarme/pilot/issues/681
const getDefaultPhone = ifElse(
  either(isNil, isEmpty),
  always(null),
  head
)

// TODO: Remove this function and it usage when the this issue is solved
// https://github.com/pagarme/pilot/issues/681
const removeCustomerUnusedPhones = (transaction) => {
  if (!transaction.customer) {
    return transaction
  }
  const { phones, ...customer } = transaction.customer

  return {
    ...transaction,
    customer: {
      ...customer,
      phone: getDefaultPhone(phones),
    },
  }
}

class TransactionDetails extends Component {
  constructor (props) {
    super(props)
    const { t } = this.props
    const formatColumns = getColumnFormatter(t)
    this.state = {
      eventsLabels: getEventsLabels(t),
      expandRecipients: false,
      installmentColumns: formatColumns(installmentTableColumns),
      manualReviewAction: null,
      nextId: null,
      paymentBoletoLabels: getPaymentBoletoLabels(t),
      paymentCardLabels: getPaymentCardLabels(t),
      result: {
        transaction: {},
      },
      riskLevelsLabels: getRiskLevelsLabels(t),
      showCapture: false,
      showManualReview: false,
      showRefund: false,
      showReprocess: false,
      transactionDetailsLabels: getTransactionDetailsLabels(t),
    }

    this.handleAlertDismiss = this.handleAlertDismiss.bind(this)
    this.handleAlertDismiss = this.handleAlertDismiss.bind(this)
    this.handleCapture = this.handleCapture.bind(this)
    this.handleCloseCapture = this.handleCloseCapture.bind(this)
    this.handleCloseManualReview = this.handleCloseManualReview.bind(this)
    this.handleCloseRefund = this.handleCloseRefund.bind(this)
    this.handleCopyBoletoUrlClick = this.handleCopyBoletoUrlClick.bind(this)
    this.handleCopyBoletoUrlClick = this.handleCopyBoletoUrlClick.bind(this)
    this.handleManualReviewApprove = this.handleManualReviewApprove.bind(this)
    this.handleManualReviewRefuse = this.handleManualReviewRefuse.bind(this)
    this.handleNextTransactionRedirect = this
      .handleNextTransactionRedirect
      .bind(this)
    this.handlePreviousTransactionRedirect = this
      .handlePreviousTransactionRedirect
      .bind(this)
    this.handleRefund = this.handleRefund.bind(this)
    this.handleReprocessClose = this.handleReprocessClose.bind(this)
    this.handleReprocessOpen = this.handleReprocessOpen.bind(this)
    this.handleShowBoletoClick = this.handleShowBoletoClick.bind(this)
    this.handleUpdate = this.handleUpdate.bind(this)
    this.requestData = this.requestData.bind(this)
    this.handleAfterPrint = this.handleAfterPrint.bind(this)
    this.handleExport = this.handleExport.bind(this)
  }

  componentDidMount () {
    const {
      match: {
        params: {
          id,
        },
      },
    } = this.props

    this.handleUpdate(id, true)

    this.afterPrintListener = window.addEventListener('afterprint', this.handleAfterPrint) // eslint-disable-line no-undef
  }

  componentWillReceiveProps ({ match: { params: { id } } }) {
    this.handleUpdate(id)
  }

  componentDidUpdate (prevProps) {
    const {
      loading,
      location: {
        search,
      },
    } = this.props

    if ((prevProps.loading && !loading) && hasPrintInQueryString(search)) {
      this.handleExport()
    }
  }

  componentWillUnmount () {
    window.removeEventListener('afterprint', this.afterPrintListener) // eslint-disable-line no-undef
  }

  handleAfterPrint () {
    this.setState({ expandRecipients: false })
  }

  handleExport () {
    this.setState({
      expandRecipients: true,
    }, () => window.print()) // eslint-disable-line no-undef
  }

  handleUpdate (id, forceUpdate) {
    const { history, match: { params } } = this.props
    if (isNil(id)) {
      history.replace('/transactions')
    } else if (id !== params.id || forceUpdate) {
      this.requestData(id)
    }
  }

  requestData (query) {
    this.props.onRequestDetails({ query })

    return this.props.client
      .transactions
      .details(query)
      .then((result) => {
        this.setState({ result })
        this.props.onReceiveDetails(result)
      })
  }

  handleAlertDismiss () {
    const { history } = this.props
    history.push('/')
  }

  handleCapture () {
    this.setState({ showCapture: true })
  }

  handleCloseCapture () {
    this.setState({ showCapture: false })
  }

  handleCopyBoletoUrlClick () {
    const {
      transaction: {
        boleto,
      },
    } = this.state.result
    copyToClipBoard(boleto.barcode)
  }

  handleManualReviewApprove () {
    this.setState({
      manualReviewAction: 'approve',
      showManualReview: true,
    })
  }

  handleManualReviewRefuse () {
    this.setState({
      manualReviewAction: 'refuse',
      showManualReview: true,
    })
  }

  handleCloseManualReview () {
    this.setState({ showManualReview: false })
  }

  handleRefund () {
    this.setState({ showRefund: true })
  }

  handleCloseRefund () {
    this.setState({ showRefund: false })
  }

  handleNextTransactionRedirect () {
    const {
      nextId,
      result: {
        transaction,
      },
    } = this.state
    const nextTransactionId = transaction.nextId || nextId
    const { history } = this.props
    history.push(`/transactions/${nextTransactionId}`)
  }

  handlePreviousTransactionRedirect () {
    const {
      result: {
        transaction: {
          previousId,
        },
      },
    } = this.state
    const { history } = this.props

    history.push(`/transactions/${previousId}`)
  }

  handleReprocessClose (nextId) {
    this.setState({
      nextId,
      showReprocess: false,
    })
  }

  handleReprocessOpen () {
    this.setState({
      showReprocess: true,
    })
  }

  handleShowBoletoClick () {
    const {
      transaction: {
        boleto,
      },
    } = this.state.result

    // eslint-disable-next-line no-undef
    window.open(boleto.url)
  }

  render () {
    const {
      error,
      match: { params: { id } },
      permission,
      t,
    } = this.props
    const {
      eventsLabels,
      expandRecipients,
      installmentColumns,
      manualReviewAction,
      nextId,
      paymentBoletoLabels,
      paymentCardLabels,
      result,
      riskLevelsLabels,
      showCapture,
      showManualReview,
      showRefund,
      showReprocess,
      transactionDetailsLabels,
    } = this.state

    if (error) {
      const message = error.localized
        ? error.localized.message
        : error.message

      return (
        <Alert
          icon={<IconInfo height={16} width={16} />}
          type="error"
        >
          <span>{message}</span>
        </Alert>
      )
    }

    const transaction = removeCustomerUnusedPhones(result.transaction)

    const {
      captured_at,
      customer,
      payment = { installments: [] },
      reason_code,
      recipients = [],
    } = transaction

    const alertLabels = {
      chargeback_reason: t(`pages.transaction.chargeback.code.${reason_code || 'unknown'}`),
      chargeback_reason_label: t('pages.transaction.alert.chargeback_reason'),
      reason_code: t('pages.transaction.alert.reason_code', { code: reason_code || '-' }),
      resubmit: t('pages.transaction.alert.resubmit'),
    }

    const customerLabels = getCustomerLabels(customer, t)

    const headerLabels = {
      approveLabel: t('pages.transaction.header.approve'),
      boletoAmountLabel: t('pages.transaction.header.boleto_amount'),
      cardAmountLabel: t('pages.transaction.header.card_amount'),
      installments: t('pages.transaction.header.installment', {
        count: payment.installments,
      }),
      installmentsLabel: t('pages.transaction.header.installment_title'),
      refuseLabel: t('pages.transaction.header.refuse'),
      statusLabel: t('pages.transaction.header.status'),
      title: t('pages.transaction.header.title'),
    }

    const recipientsLabels = {
      collapseInstallmentTitle: t('pages.transaction.recipients.collapsedInstallments'),
      expandInstallmentTitle: t('pages.transaction.recipients.expandedInstallments'),
      installmentTotalLabel: t('pages.transaction.recipients.amount'),
      liabilitiesLabel: t('pages.transaction.recipients.liabilities'),
      netAmountLabel: t('pages.transaction.recipients.net_amount'),
      noRecipientLabel: t('pages.transaction.recipients.empty'),
      outAmountLabel: t('pages.transaction.recipients.out_amount', { symbol: t('currency_symbol') }),
      statusLabel: t('pages.transaction.recipients.status'),
      title: t('pages.transaction.recipients.title', {
        count: recipients.length,
      }),
      totalRecipientsLabel: t('pages.transaction.recipients.total_recipient', {
        count: recipients.length,
      }),
      totalTitle: t('pages.transaction.recipients.total_amount'),
    }

    const reprocessLabels = {
      nextAlert: t('pages.transaction.reprocess.next'),
      previousAlert: t('pages.transaction.reprocess.previous'),
      showNext: t('pages.transaction.reprocess.showNext'),
      showPrevious: t('pages.transaction.reprocess.showPrevious'),
    }

    const totalDisplayLabels = {
      captured_at: captured_at
        ? t('captured_at', { date: moment(captured_at).format('L') })
        : t('pages.transaction.not_captured'),
      cost: t('models.payment.cost', {
        value: currencyFormatter(payment.cost_amount || 0),
      }),
      mdr: t('models.payment.mdr', {
        value: currencyFormatter(payment.mdr_amount || 0),
      }),
      net_amount: t('pages.transaction.net_amount'),
      out_amount: t('pages.transaction.out_amount'),
      paid_amount: t('pages.transaction.paid_amount'),
      refund: t('models.payment.refund', {
        value: currencyFormatter(payment.refund_amount || 0),
      }),
    }

    const nextTransactionId = transaction.nextId || nextId

    return (
      <Fragment>
        <TransactionDetailsContainer
          alertLabels={alertLabels}
          atLabel={t('at')}
          boletoWarningMessage={t('pages.transaction.boleto.waiting_payment_warning')}
          customerLabels={customerLabels}
          eventsLabels={eventsLabels}
          expandRecipients={expandRecipients}
          headerLabels={headerLabels}
          installmentColumns={installmentColumns}
          metadataTitle={t('pages.transaction.metadata')}
          nextTransactionId={nextTransactionId}
          onCapture={this.handleCapture}
          onCopyBoletoUrl={this.handleCopyBoletoUrlClick}
          onDismissAlert={this.handleAlertDismiss}
          onManualReviewApprove={this.handleManualReviewApprove}
          onManualReviewRefuse={this.handleManualReviewRefuse}
          onRefund={this.handleRefund}
          onExport={this.handleExport}
          onNextTransactionRedirect={this.handleNextTransactionRedirect}
          onPreviousTransactionRedirect={this.handlePreviousTransactionRedirect}
          onReprocess={this.handleReprocessOpen}
          onShowBoleto={this.handleShowBoletoClick}
          paymentBoletoLabels={paymentBoletoLabels}
          paymentCardLabels={paymentCardLabels}
          permissions={{
            capture: permission !== 'read_only',
            manualReview: permission !== 'read_only',
            refund: permission !== 'read_only',
            reprocess: permission !== 'read_only',
          }}
          recipientsLabels={recipientsLabels}
          riskLevelsLabels={riskLevelsLabels}
          reprocessLabels={reprocessLabels}
          totalDisplayLabels={totalDisplayLabels}
          transaction={transaction}
          transactionDetailsLabels={transactionDetailsLabels}
        />
        {showCapture &&
          <Capture
            isFromCheckout={transaction.referer === 'encryption_key'}
            isOpen={showCapture}
            onClose={this.handleCloseCapture}
            onSuccess={this.handleUpdate}
            t={t}
            transaction={transaction}
          />
        }
        {showManualReview &&
          <ManualReview
            action={manualReviewAction}
            isOpen={showManualReview}
            onClose={this.handleCloseManualReview}
            onFinish={() => { this.handleUpdate(transaction.id) }}
            t={t}
            transactionId={transaction.id}
          />
        }
        <Refund
          isOpen={showRefund}
          onClose={this.handleCloseRefund}
          onSuccess={this.handleUpdate}
          transaction={transaction}
        />
        <Reprocess
          isOpen={showReprocess}
          onClose={this.handleReprocessClose}
          transactionId={id}
          transaction={transaction}
        />
      </Fragment>
    )
  }
}

TransactionDetails.propTypes = {
  client: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  error: PropTypes.shape({
    localized: PropTypes.shape({
      message: PropTypes.string,
      title: PropTypes.string,
    }),
    message: PropTypes.string,
    method: PropTypes.string,
    status: PropTypes.number,
    type: PropTypes.string,
  }),
  history: PropTypes.shape({
    push: PropTypes.func,
    replace: PropTypes.func,
  }).isRequired,
  loading: PropTypes.bool.isRequired,
  location: PropTypes.shape({
    search: PropTypes.string,
  }).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }).isRequired,
  }).isRequired,
  onReceiveDetails: PropTypes.func.isRequired,
  onRequestDetails: PropTypes.func.isRequired,
  permission: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
}

TransactionDetails.defaultProps = {
  error: undefined,
}

export default enhanced(TransactionDetails)
