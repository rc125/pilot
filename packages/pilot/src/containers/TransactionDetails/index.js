/* eslint-disable camelcase */
import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import {
  __,
  always,
  applySpec,
  anyPass,
  both,
  contains,
  either,
  equals,
  flatten,
  head,
  ifElse,
  isEmpty,
  isNil,
  juxt,
  map,
  negate,
  path,
  pathOr,
  pipe,
  prop,
  propEq,
  reject,
  sum,
  unless,
  when,
} from 'ramda'
import {
  Alert,
  Card,
  CardContent,
  CardTitle,
  Col,
  Grid,
  Legend,
  Row,
  Truncate,
} from 'former-kit'
import IconInfo from 'emblematic-icons/svg/Info32.svg'
import IconCheck from 'emblematic-icons/svg/Check24.svg'
import IconClearClose from 'emblematic-icons/svg/ClearClose24.svg'
import DownloadIcon from 'emblematic-icons/svg/Download24.svg'
import IconReverse from 'emblematic-icons/svg/Reverse24.svg'
import CaptureIcon from 'emblematic-icons/svg/Wallet24.svg'
import ReprocessIcon from 'emblematic-icons/svg/Reprocess24.svg'
import currencyFormatter from '../../formatters/currency'
import CustomerCard from '../../components/CustomerCard'
import decimalCurrencyFormatter from '../../formatters/decimalCurrency'
import DetailsHead from '../../components/DetailsHead'
import Event from '../../components/Event'
import PaymentBoleto from '../../components/PaymentBoleto'
import PaymentCard from '../../components/PaymentCard'
import RecipientList from '../../containers/RecipientList'
import RiskLevel from '../../components/RiskLevel'
import statusLegends from '../../models/statusLegends'
import TotalDisplay from '../../components/TotalDisplay'
import TransactionDetailsCard from '../../components/TransactionDetailsCard'
import transactionOperationTypes from '../../models/transactionOperationTypes'
import TreeView from '../../components/TreeView'
import style from './style.css'
import formatCpfCnpj from '../../formatters/cpfCnpj'
import formatDate from '../../formatters/longDate'

const isZeroOrNegative = value => value <= 0

const formatValues = map(when(
  isNil,
  always(0)
))

const getOutAmount = pipe(
  formatValues,
  sum,
  unless(
    isZeroOrNegative,
    negate
  )
)

const getOperationLegendStatus = pipe(
  juxt([
    prop('type'),
    always('status'),
    prop('status'),
  ]),
  pathOr({}, __, transactionOperationTypes)
)

const isEmptyOrNull = anyPass([isEmpty, isNil])

const isChargebackStatus = either(
  contains('chargeback'),
  contains('chargedback')
)

const isChargebackedTransaction = pipe(
  prop('status'),
  isChargebackStatus
)

const isBoletoTransaction = pipe(
  path(['payment', 'method']),
  equals('boleto')
)

const isWaitingPaymentTransaction = pipe(
  prop('status'),
  equals('waiting_payment')
)

const isBoletoWaitingPayment = both(
  isBoletoTransaction,
  isWaitingPaymentTransaction
)

const isPendingReviewTransaction = propEq('status', 'pending_review')

const showStatusAlert = either(
  isChargebackedTransaction,
  isBoletoWaitingPayment
)

const formatDocument = applySpec({
  number: pipe(
    prop('number'),
    formatCpfCnpj
  ),
  type: prop('type'),
})

const formatCustomerBirthDay = customer => ({
  ...customer,
  birthday: !isNil(customer.birthday)
    ? formatDate(customer.birthday)
    : null,
})

const getDefaultDocumentNumber = pipe(
  prop('documents'),
  ifElse(
    either(isNil, isEmpty),
    always(null),
    pipe(
      head,
      formatDocument,
      prop('number')
    )
  )
)

const formatCustomerAddress = (customer) => {
  if (!customer.address) {
    return customer
  }

  const { id, ...address } = customer.address

  return {
    ...address,
    ...customer,
  }
}

const formatCustomerDocuments = customer => ({
  ...customer,
  document_number: getDefaultDocumentNumber(customer),
})

const formatCustomerData = pipe(
  formatCustomerBirthDay,
  formatCustomerDocuments,
  formatCustomerAddress
)

const getHeaderAmountLabel = (transaction, headerLabels) => {
  if (isBoletoTransaction(transaction)) {
    return headerLabels.boletoAmountLabel
  }
  return headerLabels.cardAmountLabel
}

const renderLegend = status => (
  <Legend
    color={statusLegends[status].color}
    acronym={statusLegends[status].text}
    hideLabel
  >
    { statusLegends[status].acronym }
  </Legend>
)

const validatePreviousTransactionRedirect = (props, propName) => {
  if (propName === 'onPreviousTransactionRedirect') {
    const {
      onPreviousTransactionRedirect,
      transaction: {
        previousId,
      },
    } = props

    if (previousId && isNil(onPreviousTransactionRedirect)) {
      throw new Error('The prop onPreviousTransactionRedirect must be a function when transaction.previousId is not null')
    }
  }
}

const validateNextTransactionRedirect = (props, propName) => {
  if (propName === 'onNextTransactionRedirect') {
    const {
      nextTransactionId,
      onNextTransactionRedirect,
      transaction: {
        nextId,
      },
    } = props

    if ((nextId || nextTransactionId) && isNil(onNextTransactionRedirect)) {
      throw new Error('The prop onNextTransactionRedirect must be a function when transaction.nextId is not null')
    }
  }
}

const validateCaptureFunction = (props, propName) => {
  if (propName === 'onCapture') {
    const {
      onCapture,
      transaction: {
        capabilities,
      },
    } = props

    if (capabilities && capabilities.capturable && isNil(onCapture)) {
      throw new Error('The prop onCapture must be a function when transaction.capabilities.capturable is true')
    }
  }
}

const validateRefundFunction = (props, propName) => {
  if (propName === 'onRefund') {
    const {
      onRefund,
      transaction: {
        capabilities,
      },
    } = props

    if (capabilities && capabilities.refundable && isNil(onRefund)) {
      throw new Error('The prop onRefund must be a function when transaction.capabilities.refundable is true')
    }
  }
}

const validateReprocessFunction = (props, propName) => {
  if (propName === 'onReprocess') {
    const {
      onReprocess,
      transaction: {
        capabilities,
      },
    } = props

    if (capabilities && capabilities.reprocessable && isNil(onReprocess)) {
      throw new Error('The prop onReprocess must be a function when transaction.capabilities.reprocessable is true')
    }
  }
}

class TransactionDetails extends Component {
  constructor (props) {
    super(props)
    this.getActions = this.getActions.bind(this)
    this.renderAlertInfo = this.renderAlertInfo.bind(this)
    this.renderBoleto = this.renderBoleto.bind(this)
    this.renderEvents = this.renderEvents.bind(this)
    this.renderOutAmountSubTitle = this.renderOutAmountSubTitle.bind(this)
    this.renderPayment = this.renderPayment.bind(this)
    this.renderPaymentCard = this.renderPaymentCard.bind(this)
  }

  getActions () {
    const {
      headerLabels,
      nextTransactionId,
      onCapture,
      onExport,
      onManualReviewApprove,
      onManualReviewRefuse,
      onRefund,
      onReprocess,
      permissions,
      transaction,
      transaction: {
        capabilities,
      },
    } = this.props

    const onCaptureAction = {
      icon: <CaptureIcon width={12} height={12} />,
      onClick: onCapture,
      title: 'Capturar',
    }

    const onExportAction = {
      icon: <DownloadIcon width={12} height={12} />,
      onClick: onExport,
      title: 'Exportar',
    }

    const onReprocessAction = {
      icon: <ReprocessIcon width={12} height={12} />,
      onClick: onReprocess,
      title: 'Reprocessar',
    }

    const onRefundAction = {
      icon: <IconReverse width={12} height={12} />,
      onClick: onRefund,
      title: 'Estornar',
    }

    const getManualReviewTransactionActions = (trx) => {
      if (isPendingReviewTransaction(trx) && permissions.manualReview) {
        return [
          {
            icon: <IconClearClose width={12} height={12} />,
            onClick: onManualReviewRefuse,
            title: headerLabels.refuseLabel,
          },
          {
            icon: <IconCheck width={12} height={12} />,
            onClick: onManualReviewApprove,
            title: headerLabels.approveLabel,
          },
        ]
      }
      return []
    }

    const detailsHeadActions = pipe(
      juxt([
        ifElse(
          propEq('capturable', true),
          always(onCaptureAction),
          always(null)
        ),
        ifElse(
          both(
            propEq('reprocessable', true),
            always(isEmptyOrNull(nextTransactionId))
          ),
          always(onReprocessAction),
          always(null)
        ),
        ifElse(
          propEq('refundable', true),
          always(onRefundAction),
          always(null)
        ),
        always(getManualReviewTransactionActions(transaction)),
        always(onExportAction),
      ]),
      flatten,
      reject(isNil)
    )

    return detailsHeadActions(capabilities)
  }

  renderAlertInfo () {
    const {
      alertLabels,
      boletoWarningMessage,
      transaction,
    } = this.props

    if (isBoletoWaitingPayment(transaction)) {
      return (
        <span>
          {boletoWarningMessage}
        </span>
      )
    }
    return (
      <span>
        <strong> {alertLabels.chargeback_reason_label} </strong>
        <span> {alertLabels.chargeback_reason} </span>
        <strong>
          {alertLabels.reason_code}
        </strong>
      </span>
    )
  }

  renderBoleto () {
    const {
      onCopyBoletoUrl,
      onShowBoleto,
      paymentBoletoLabels,
      transaction: {
        boleto: {
          barcode,
          due_date,
        },
      },
    } = this.props

    return (
      <PaymentBoleto
        barcode={barcode}
        copyBarcodeFeedback={paymentBoletoLabels.feedback}
        copyBarcodeLabel={paymentBoletoLabels.copy}
        dueDate={moment(due_date).format('L')}
        dueDateLabel={paymentBoletoLabels.due_date}
        onCopy={onCopyBoletoUrl}
        onShow={onShowBoleto}
        showBoletoLabel={paymentBoletoLabels.show}
        title={paymentBoletoLabels.title}
      />
    )
  }

  renderPaymentCard () {
    const {
      paymentCardLabels,
      transaction: {
        card: {
          brand_name,
          first_digits,
          holder_name,
          last_digits,
        },
      },
    } = this.props

    return (
      <PaymentCard
        title={paymentCardLabels.title}
        first={first_digits}
        last={last_digits}
        holderName={holder_name}
        brand={brand_name}
      />
    )
  }

  renderPayment () {
    const { payment } = this.props.transaction

    if (payment.method === 'credit_card') {
      return this.renderPaymentCard()
    }
    return this.renderBoleto()
  }

  renderOutAmountSubTitle () {
    const { totalDisplayLabels } = this.props

    return (
      <div className={style.subtitle}>
        <div>
          {totalDisplayLabels.mdr &&
            <span>
              {totalDisplayLabels.mdr}
            </span>
          }
          {totalDisplayLabels.cost &&
            <span>
              {totalDisplayLabels.cost}
            </span>
          }
        </div>
        <div>
          {totalDisplayLabels.refund &&
            <span>
              {totalDisplayLabels.refund}
            </span>
          }
        </div>
      </div>
    )
  }

  renderEvents () {
    const {
      atLabel,
      transaction: { operations },
    } = this.props

    return operations.map((operation, index) => {
      const {
        created_at,
        cycle,
        status,
        type,
      } = operation
      const date = moment(created_at)
      const key = `${type}_${status}_${(cycle || 0)}_${index}`
      const legendStatus = getOperationLegendStatus(operation)
      const number = operations.length - index

      return (
        <Event
          active={index === 0}
          collapsed={index !== 0}
          color={legendStatus.color}
          key={key}
          number={number}
          title={legendStatus.title}
        >
          <section>
            <p>
              {
                `${date.format('L')} ${atLabel} ${date.format('HH:mm')}`
              }
            </p>
          </section>
        </Event>
      )
    })
  }

  renderReprocessAlerts () {
    const {
      nextTransactionId,
      onNextTransactionRedirect,
      onPreviousTransactionRedirect,
      reprocessLabels,
      transaction,
    } = this.props
    const nextId = transaction.nextId || nextTransactionId

    return (
      <Fragment>
        {(nextId && nextId !== transaction.id) &&
          <Row className={style.alertCustom}>
            <Col
              desk={12}
              palm={12}
              tablet={12}
              tv={12}
            >
              <Alert
                action={reprocessLabels.showNext}
                icon={<IconInfo height={16} width={16} />}
                onDismiss={onNextTransactionRedirect}
                type="info"
              >
                <span className={style.reprocessAlertCustom}>
                  {reprocessLabels.nextAlert}
                  <strong> {nextId} </strong>
                </span>
              </Alert>
            </Col>
          </Row>
        }
        {transaction.previousId &&
          <Row className={style.alertCustom}>
            <Col
              desk={12}
              tv={12}
              tablet={12}
              palm={12}
            >
              <Alert
                action={reprocessLabels.showPrevious}
                icon={<IconInfo height={16} width={16} />}
                onDismiss={onPreviousTransactionRedirect}
                type="info"
              >
                <span className={style.reprocessAlertCustom}>
                  {reprocessLabels.previousAlert}
                  <strong> {transaction.previousId} </strong>
                </span>
              </Alert>
            </Col>
          </Row>
        }
      </Fragment>
    )
  }

  render () {
    const {
      alertLabels,
      customerLabels,
      eventsLabels,
      expandRecipients,
      headerLabels,
      installmentColumns,
      metadataTitle,
      recipientsLabels,
      riskLevelsLabels,
      totalDisplayLabels,
      transaction,
      transactionDetailsLabels,
    } = this.props

    const {
      acquirer,
      amount,
      card,
      customer,
      id,
      metadata,
      payment,
      recipients,
      soft_descriptor,
      status,
      subscription,
    } = transaction

    const transactionDetailsContent = {
      acquirer_name: acquirer
        ? acquirer.name
        : null,
      acquirer_response_code: acquirer
        ? acquirer.response_code
        : null,
      authorization_code: acquirer
        ? acquirer.response_code
        : null,
      capture_method: card
        ? card.capture_method
        : null,
      nsu: acquirer
        ? acquirer.sequence_number
        : null,
      soft_descriptor,
      subscription_id: subscription
        ? subscription.id
        : null,
      tid: id,
    }

    const formattedCustomer = formatCustomerData(customer || {})

    const applyTruncateCustomerEmail = (
      <span className={style.value}>
        <Truncate
          text={formattedCustomer.email}
        />
      </span>
    )

    const customerDetailsContent = {
      birthday: formattedCustomer && formattedCustomer.birthday,
      city: formattedCustomer && formattedCustomer.city,
      complementary: formattedCustomer && formattedCustomer.complementary,
      document_number: formattedCustomer && formattedCustomer.document_number,
      email: formattedCustomer.email && applyTruncateCustomerEmail,
      name: formattedCustomer && formattedCustomer.name,
      neighborhood: formattedCustomer && formattedCustomer.neighborhood,
      phone: formattedCustomer && formattedCustomer.phone,
      state: formattedCustomer && formattedCustomer.state,
      street: formattedCustomer && formattedCustomer.street,
      street_number: formattedCustomer && formattedCustomer.street_number,
      zipcode: formattedCustomer && formattedCustomer.zipcode,
    }

    if (isEmpty(transaction)) {
      return (<div />)
    }

    const detailsHeadProperties = [
      {
        children: renderLegend(status),
        title: headerLabels.statusLabel,
      },
      {
        children: headerLabels.installments,
        title: headerLabels.installmentsLabel,
      },
      {
        children: (
          <strong className={style.children}>
            {currencyFormatter(amount)}
          </strong>
        ),
        title: getHeaderAmountLabel(transaction, headerLabels),
      },
    ]

    if (transaction.risk_level !== 'unknown') {
      detailsHeadProperties.push({
        children: <RiskLevel level={transaction.risk_level} />,
        title: riskLevelsLabels[transaction.risk_level],
      })
    }

    return (
      <Grid className={style.grid}>
        <Row stretch className={style.transactionInfo}>
          <Col
            desk={12}
            tv={12}
            tablet={12}
            palm={12}
          >
            <Card>
              <CardContent>
                <DetailsHead
                  actions={this.getActions()}
                  identifier={`#${id}`}
                  properties={detailsHeadProperties}
                  title={headerLabels.title}
                />
              </CardContent>
            </Card>
          </Col>
        </Row>

        {this.renderReprocessAlerts()}

        <Row stretch className={style.paymentInfo}>
          <Col
            desk={3}
            palm={12}
            tablet={6}
            tv={3}
          >
            { this.renderPayment() }
          </Col>
          <Col
            desk={3}
            palm={12}
            tablet={6}
            tv={3}
          >
            <Card className={style.paidAmountValue}>
              <CardContent className={style.content}>
                <TotalDisplay
                  amount={payment.paid_amount}
                  amountSize="huge"
                  color="#37cc9a"
                  subtitle={
                    <div className={style.subtitle}>
                      {totalDisplayLabels.captured_at}
                    </div>
                  }
                  title={totalDisplayLabels.paid_amount}
                  titleSize="medium"
                />
              </CardContent>
            </Card>
          </Col>
          <Col
            desk={3}
            palm={12}
            tablet={6}
            tv={3}
          >
            <Card className={style.outAmountValue}>
              <CardContent className={style.content}>
                <TotalDisplay
                  amount={
                    getOutAmount([
                      payment.refund_amount,
                      payment.cost_amount,
                      payment.mdr_amount,
                    ])
                  }
                  amountSize="huge"
                  color="#ff796f"
                  subtitle={
                    <div className={style.subtitle}>
                      {this.renderOutAmountSubTitle()}
                    </div>
                  }
                  title={totalDisplayLabels.out_amount}
                  titleSize="medium"
                />
              </CardContent>
            </Card>
          </Col>
          <Col
            desk={3}
            palm={12}
            tablet={6}
            tv={3}
          >
            <Card className={style.netAmountValue}>
              <CardContent className={style.content}>
                <TotalDisplay
                  amount={payment.net_amount}
                  amountSize="huge"
                  color="#4ca9d7"
                  subtitle={
                    <div className={style.subtitle}>
                      {totalDisplayLabels.receive_date}
                    </div>
                  }
                  title={totalDisplayLabels.net_amount}
                  titleSize="medium"
                />
              </CardContent>
            </Card>
          </Col>
        </Row>

        {showStatusAlert(transaction) &&
          <Row className={style.alertCustom}>
            <Col
              desk={12}
              palm={12}
              tablet={12}
              tv={12}
            >
              <Alert
                action={alertLabels.resubmit}
                icon={<IconInfo height={16} width={16} />}
                type="info"
              >
                {this.renderAlertInfo()}
              </Alert>
            </Col>
          </Row>
        }

        <Row>
          <Col
            desk={9}
            palm={12}
            tablet={12}
            tv={9}
          >
            <Grid className={style.detailsInfo}>
              {!isEmptyOrNull(recipients) &&
                <Row className={style.recipientsInfo}>
                  <Col
                    desk={12}
                    palm={12}
                    tablet={12}
                    tv={12}
                  >
                    <RecipientList
                      collapseInstallmentTitle={
                        recipientsLabels.collapseInstallmentTitle
                      }
                      expandAllRecipients={expandRecipients}
                      expandInstallmentTitle={
                        recipientsLabels.expandInstallmentTitle
                      }
                      installmentsTableColumns={installmentColumns}
                      installmentTotalLabel={
                        recipientsLabels.installmentTotalLabel
                      }
                      liabilitiesLabel={recipientsLabels.liabilitiesLabel}
                      netAmountLabel={recipientsLabels.netAmountLabel}
                      noRecipientLabel={recipientsLabels.noRecipientLabel}
                      outAmountLabel={recipientsLabels.outAmountLabel}
                      paymentMethod={payment.method}
                      recipients={recipients}
                      statusLabel={recipientsLabels.statusLabel}
                      title={recipientsLabels.title}
                      total={decimalCurrencyFormatter(payment.paid_amount)}
                      totalRecipientsLabel={
                        recipientsLabels.totalRecipientsLabel
                      }
                      totalTitle={recipientsLabels.totalTitle}
                    />
                  </Col>
                </Row>
              }
              {!isEmptyOrNull(customer) &&
                <Row className={style.customerInfo}>
                  <Col
                    desk={12}
                    palm={12}
                    tablet={12}
                    tv={12}
                  >
                    <CustomerCard
                      contents={customerDetailsContent}
                      labels={customerLabels}
                      title={customerLabels.title}
                    />
                  </Col>
                </Row>
              }
              <Row className={style.transactionCardInfo}>
                <Col
                  desk={12}
                  palm={12}
                  tablet={12}
                  tv={12}
                >
                  <TransactionDetailsCard
                    contents={transactionDetailsContent}
                    labels={transactionDetailsLabels}
                    title={transactionDetailsLabels.title}
                  />
                </Col>
              </Row>
              {!isEmptyOrNull(metadata) &&
                <Row className={style.metadataInfo}>
                  <Col
                    desk={12}
                    palm={12}
                    tablet={12}
                    tv={12}
                  >
                    <TreeView
                      data={metadata}
                      title={metadataTitle}
                    />
                  </Col>
                </Row>
              }
            </Grid>
          </Col>
          <Col
            desk={3}
            palm={12}
            tablet={12}
            tv={3}
            className={style.eventsList}
          >
            <Card>
              <CardTitle title={eventsLabels.title} />
              <div>
                {this.renderEvents()}
              </div>
            </Card>
          </Col>
        </Row>
      </Grid>
    )
  }
}

TransactionDetails.propTypes = {
  alertLabels: PropTypes.shape({
    chargeback_reason: PropTypes.string,
    chargeback_reason_label: PropTypes.string,
    reason_code: PropTypes.string,
    resubmit: PropTypes.string,
  }).isRequired,
  atLabel: PropTypes.string.isRequired,
  boletoWarningMessage: PropTypes.string.isRequired,
  customerLabels: PropTypes.shape({
    birthday: PropTypes.string,
    city: PropTypes.string,
    complement: PropTypes.string,
    document_number: PropTypes.string,
    email: PropTypes.string,
    name: PropTypes.string,
    neighborhood: PropTypes.string,
    number: PropTypes.string,
    phone: PropTypes.string,
    state: PropTypes.string,
    street: PropTypes.string,
    title: PropTypes.string,
    zip_code: PropTypes.string,
  }).isRequired,
  eventsLabels: PropTypes.shape({
    title: PropTypes.string,
  }).isRequired,
  expandRecipients: PropTypes.bool,
  headerLabels: PropTypes.shape({
    installments: PropTypes.string,
    status: PropTypes.string,
    title: PropTypes.string,
  }).isRequired,
  installmentColumns: PropTypes.arrayOf(PropTypes.shape({
    costs: PropTypes.shape({
      anticipation: PropTypes.number,
      chargeback: PropTypes.number,
      mdr: PropTypes.number,
      refund: PropTypes.number,
    }),
    net_amount: PropTypes.number,
    number: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    original_payment_date: PropTypes.instanceOf(moment),
    payment_date: PropTypes.instanceOf(moment),
    status: PropTypes.string,
  })).isRequired,
  metadataTitle: PropTypes.string.isRequired,
  nextTransactionId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onCapture: validateCaptureFunction,
  onCopyBoletoUrl: PropTypes.func,
  onDismissAlert: PropTypes.func, // eslint-disable-line react/no-unused-prop-types
  onExport: PropTypes.func,
  onManualReviewApprove: PropTypes.func,
  onManualReviewRefuse: PropTypes.func,
  onNextTransactionRedirect: validateNextTransactionRedirect,
  onPreviousTransactionRedirect: validatePreviousTransactionRedirect,
  onRefund: validateRefundFunction,
  onReprocess: validateReprocessFunction,
  onShowBoleto: PropTypes.func,
  paymentBoletoLabels: PropTypes.shape({
    copy: PropTypes.string,
    due_date: PropTypes.string,
    feedback: PropTypes.string,
    show: PropTypes.string,
    title: PropTypes.string,
  }).isRequired,
  paymentCardLabels: PropTypes.shape({
    title: PropTypes.string,
  }).isRequired,
  permissions: PropTypes.shape({
    manualReview: PropTypes.bool.isRequired,
    refund: PropTypes.bool.isRequired,
    reprocess: PropTypes.bool.isRequired,
  }).isRequired,
  recipientsLabels: PropTypes.shape({
    collapseInstallmentTitle: PropTypes.string,
    expandInstallmentTitle: PropTypes.string,
    installmentTotalLabel: PropTypes.string,
    liabilitiesLabel: PropTypes.string,
    netAmountLabel: PropTypes.string,
    noRecipientLabel: PropTypes.string,
    outAmountLabel: PropTypes.string,
    statusLabel: PropTypes.string,
    title: PropTypes.string,
    totalRecipientsLabel: PropTypes.string,
    totalTitle: PropTypes.string,
  }).isRequired,
  reprocessLabels: PropTypes.shape({
    nextAlert: PropTypes.string,
    previousAlert: PropTypes.string,
    showNext: PropTypes.string,
    showPrevious: PropTypes.string,
  }).isRequired,
  riskLevelsLabels: PropTypes.shape({
    high: PropTypes.string,
    low: PropTypes.string,
    moderated: PropTypes.string,
    very_high: PropTypes.string,
    very_low: PropTypes.string,
  }).isRequired,
  totalDisplayLabels: PropTypes.shape({
    captured_at: PropTypes.string,
    cost: PropTypes.string,
    mdr: PropTypes.string,
    net_amount: PropTypes.string,
    out_amount: PropTypes.string,
    paid_amount: PropTypes.string,
    receive_date: PropTypes.string,
    refund: PropTypes.string,
  }).isRequired,
  transaction: PropTypes.shape({
    acquirer: PropTypes.shape({
      name: PropTypes.string,
      response_code: PropTypes.string,
      sequence_number: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
      ]),
      transaction_id: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
      ]),
    }),
    antifraud: PropTypes.object,
    boleto: PropTypes.shape({
      barcode: PropTypes.string,
      due_date: PropTypes.instanceOf(moment),
      url: PropTypes.string,
    }),
    capabilities: PropTypes.shape({
      capturable: PropTypes.bool,
      refundable: PropTypes.bool,
      reprocessable: PropTypes.bool,
    }),
    card: PropTypes.shape({
      brand_name: PropTypes.string,
      first_digits: PropTypes.string,
      holder_name: PropTypes.string,
      international: PropTypes.bool,
      last_digits: PropTypes.string,
      pin_mode: PropTypes.string,
    }),
    created_at: PropTypes.instanceOf(moment),
    customer: PropTypes.shape({
      birth_date: PropTypes.string,
      country: PropTypes.string,
      document_number: PropTypes.string,
      document_type: PropTypes.string,
      email: PropTypes.string,
      name: PropTypes.string,
      phones: PropTypes.arrayOf(PropTypes.string),
    }),
    external_id: PropTypes.string,
    id: PropTypes.number,
    metadata: PropTypes.object, // eslint-disable-line
    operations: PropTypes.arrayOf(PropTypes.shape({
      created_at: PropTypes.instanceOf(moment),
      cycle: PropTypes.number,
      status: PropTypes.string,
      type: PropTypes.string,
    })),
    payment: PropTypes.shape({
      cost_amount: PropTypes.number,
      installments: PropTypes.number,
      method: PropTypes.string,
      net_amount: PropTypes.number,
      paid_amount: PropTypes.number,
      refund_amount: PropTypes.number,
    }),
    recipients: PropTypes.arrayOf(PropTypes.shape({
      amount: PropTypes.number,
      installments: PropTypes.arrayOf(PropTypes.shape({
        amount: PropTypes.number,
        costs: PropTypes.shape({
          anticipation: PropTypes.number,
          mdr: PropTypes.number,
        }),
        created_at: PropTypes.instanceOf(moment),
        net_amount: PropTypes.number,
        number: PropTypes.number,
        original_payment_date: PropTypes.instanceOf(moment),
        payment_date: PropTypes.instanceOf(moment),
      })),
      liabilities: PropTypes.arrayOf(PropTypes.string),
      name: PropTypes.string,
      net_amount: PropTypes.number,
    })),
    soft_descriptor: PropTypes.string,
    status: PropTypes.string,
    status_reason: PropTypes.string,
    updated_at: PropTypes.instanceOf(moment),
  }).isRequired,
  transactionDetailsLabels: PropTypes.shape({
    acquirer_name: PropTypes.string,
    acquirer_response_code: PropTypes.string,
    authorization_code: PropTypes.string,
    capture_method: PropTypes.string,
    nsu: PropTypes.string,
    soft_descriptor: PropTypes.string,
    subscription_id: PropTypes.string,
    tid: PropTypes.string,
    title: PropTypes.string,
  }).isRequired,
}

TransactionDetails.defaultProps = {
  expandRecipients: false,
  nextTransactionId: null,
  onCapture: null,
  onCopyBoletoUrl: null,
  onDismissAlert: null,
  onExport: null,
  onManualReviewApprove: null,
  onManualReviewRefuse: null,
  onNextTransactionRedirect: null,
  onPreviousTransactionRedirect: null,
  onRefund: null,
  onReprocess: null,
  onShowBoleto: null,
}

export default TransactionDetails
