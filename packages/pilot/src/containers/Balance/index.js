import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import {
  complement,
  either,
  isEmpty,
  isNil,
  keys,
  map,
  path,
  pipe,
  prop,
  propSatisfies,
  take,
  when,
} from 'ramda'
import {
  Button,
  Card,
  CardContent,
  Col,
  Grid,
  Modal,
  ModalActions,
  ModalContent,
  ModalTitle,
  Row,
  Spacing,
  TabBar,
  TabItem,
  // This block of code is commented because of issue #1159 (https://github.com/pagarme/pilot/issues/1159)
  // It was commented on to remove the anticipation limits call on Balance page
  // This code will be used again in the future when ATLAS project implements the anticipation flow
  // More details in issue #1159
  // Tooltip,
} from 'former-kit'
import IconClose from 'emblematic-icons/svg/ClearClose32.svg'
// This block of code is commented because of issue #1159 (https://github.com/pagarme/pilot/issues/1159)
// It was commented on to remove the anticipation limits call on Balance page
// This code will be used again in the future when ATLAS project implements the anticipation flow
// More details in issue #1159
// import IconInfo from 'emblematic-icons/svg/Info32.svg'

import BalanceTotalDisplay from '../../components/BalanceTotalDisplay'
import bulkAnticipationsLabels from '../../models/bulkAnticipationTypes'
import currencyFormatter from '../../formatters/currency'
import dateFormatter from '../../formatters/longDate'
import DetailsHead from '../../components/DetailsHead'
import PendingRequests from '../../components/PendingRequests'
import BalanceOperations from '../BalanceOperations'

import style from './style.css'

const datesEqual = (left, right) => {
  if (left.start === right.start && left.end === right.end) {
    return true
  }

  return (
    moment(left.start).diff(moment(right.start), 'days') === 0
    && moment(left.end).diff(moment(right.end), 'days') === 0
  )
}

const isEmptyDates = either(
  propSatisfies(isNil, 'end'),
  propSatisfies(isNil, 'start')
)

const isSameDay = date =>
  moment(date).isSame(moment(), 'day')

const isNotNullOrEmpty = complement(either(isNil, isEmpty))

const isValidDateAndSameDay = when(
  isNotNullOrEmpty,
  pipe(
    prop('payment_date'),
    isSameDay
  )
)

/*
 * TODO: remove this limits when the 'any date' option is removed
 * from the DateSelector.
*/
const anyDateRange = {
  end: moment(),
  start: moment().subtract(3, 'months'),
}

const getTransfersPricing = path(['pricing', 'transfers'])

const MINIMUM_API_VALUE = 100

class Balance extends Component {
  constructor (props) {
    super(props)

    this.getHeadProp = this.getHeadProp.bind(this)
    this.getHeadProperties = this.getHeadProperties.bind(this)
    this.getPendingRequest = this.getPendingRequest.bind(this)
    this.getPendingRequests = this.getPendingRequests.bind(this)
    this.getSummaryTotal = this.getSummaryTotal.bind(this)
    this.handleFilterClick = this.handleFilterClick.bind(this)
    this.handleDatesChange = this.handleDatesChange.bind(this)
    this.handleOperationsPageChange = this.handleOperationsPageChange.bind(this)
    this.handlePresetChange = this.handlePresetChange.bind(this)
    this.handleRequestCancelClick = this.handleRequestCancelClick.bind(this)
    // This block of code is commented because of issue #1159 (https://github.com/pagarme/pilot/issues/1159)
    // It was commented on to remove the anticipation limits call on Balance page
    // This code will be used again in the future when ATLAS project implements the anticipation flow
    // More details in issue #1159
    // this.renderAnticipation = this.renderAnticipation.bind(this)
    this.renderOperations = this.renderOperations.bind(this)

    this.state = {
      dates: {
        end: props.dates.end,
        start: props.dates.start,
      },
      showDateInputCalendar: false,
    }
  }

  getHeadProp (key) {
    const {
      recipient: {
        bank_account, // eslint-disable-line camelcase
        id,
      },
      t,
    } = this.props
    const getTranslatedChild = () => {
      const childrenValue = bank_account[key]
      if (key === 'bank_code') {
        return t(`models.${key}.${childrenValue}`)
      }
      if (key === 'type') {
        return t(childrenValue)
      }
      if (key === 'id') {
        return id
      }
      return childrenValue
    }

    return ({
      children: <span>{getTranslatedChild()}</span>,
      title: t(`pages.balance.${key}`),
    })
  }

  getHeadProperties () {
    const {
      recipient: {
        bank_account: {
          account,
          agency,
          bank_code, // eslint-disable-line camelcase
          type,
        },
        id,
      },
    } = this.props

    return map(this.getHeadProp, keys({
      account,
      agency,
      bank_code,
      id,
      type,
    }))
  }

  getPendingRequest ({
    amount,
    automaticTransfer,
    created_at, // eslint-disable-line camelcase
    status,
    type,
  }) {
    const {
      company: { pricing },
      t,
    } = this.props

    const { statuses, types } = bulkAnticipationsLabels
    const title =
      `${t(types[type])} ${t(statuses[status])}` || '-'

    const ted = pricing
      ? path(['transfers', 'ted'], pricing)
      : 0

    const netAmount = automaticTransfer
      ? amount - ted
      : amount

    return {
      amount: currencyFormatter(netAmount),
      created_at: dateFormatter(created_at),
      title,
    }
  }

  getPendingRequests () {
    const {
      requests,
    } = this.props

    const getRequests = pipe(
      take(3),
      map(this.getPendingRequest)
    )

    return getRequests(requests)
  }

  getSummaryTotal () {
    const {
      disabled,
      t,
      total,
    } = this.props

    if (!isEmpty(total)) {
      return {
        outcoming: {
          title: t('pages.balance.total.outcoming'),
          unit: t('currency'),
          value: disabled
            ? 0
            : total.outcoming,
        },
        outgoing: {
          title: t('pages.balance.total.outgoing'),
          unit: t('currency'),
          value: disabled
            ? 0
            : -total.outgoing,
        },
        net: { // eslint-disable-line sort-keys
          title: t('pages.balance.total.net'),
          unit: t('currency'),
          value: disabled
            ? 0
            : total.net,
        },
      }
    }

    return null
  }

  handleDatesChange (dates) {
    this.setState({ dates })
  }

  handleFilterClick () {
    if (isEmptyDates(this.state.dates)) {
      this.props.onFilterClick(anyDateRange)
    } else {
      this.props.onFilterClick(this.state.dates)
    }
  }

  handleOperationsPageChange (pageIndex) {
    const { onPageChange } = this.props
    onPageChange(pageIndex)
  }

  handlePresetChange () {
    this.setState({
      showDateInputCalendar: true,
    })
  }

  handleRequestCancelClick (requestIndex) {
    const {
      onCancelRequestClick,
      requests,
    } = this.props

    onCancelRequestClick(requests[requestIndex])
  }

  // This block of code is commented because of issue #1159 (https://github.com/pagarme/pilot/issues/1159)
  // It was commented on to remove the anticipation limits call on Balance page
  // This code will be used again in the future when ATLAS project implements the anticipation flow
  // More details in issue #1159
  // renderAnticipation () {
  //   const {
  //     anticipation: {
  //       available,
  //       error,
  //       loading,
  //     },
  //     t,
  //   } = this.props

  //   if (loading) {
  //     return (
  //       <span>
  //         {t('pages.balance.anticipation_loading')}
  //       </span>
  //     )
  //   }

  //   if (error) {
  //     return (
  //       <span>
  //         {t('pages.balance.anticipation_error')}
  //         <Spacing size="tiny" />
  //         <Tooltip
  //           placement="rightMiddle"
  //           content={t('pages.balance.anticipation_error_info')}
  //         >
  //           <IconInfo height={16} width={16} />
  //         </Tooltip>
  //       </span>
  //     )
  //   }

  //   return (
  //     <span>
  //       {t('pages.balance.available_anticipation')}
  //       <strong> {formatAmount(available)} </strong>
  //     </span>
  //   )
  // }

  renderOperations () {
    const {
      currentPage,
      dates,
      disabled,
      exporting,
      loading,
      onExport,
      search: {
        operations,
      },
      t,
    } = this.props

    const filterDatesEqualCurrent = datesEqual(this.state.dates, dates)

    return (
      <BalanceOperations
        amount={this.getSummaryTotal()}
        currentPage={currentPage}
        dates={this.state.dates}
        disabled={disabled}
        exporting={exporting}
        isFilterActive={filterDatesEqualCurrent}
        loading={loading}
        onDateChange={this.handleDatesChange}
        onDatePresetChange={this.handlePresetChange}
        onExport={onExport}
        onFilterClick={this.handleFilterClick}
        onPageChange={this.handleOperationsPageChange}
        operations={operations}
        selectedPreset="last-7"
        showDateInputCalendar={this.state.showDateInputCalendar}
        t={t}
      />
    )
  }

  render () {
    const {
      // This block of code is commented because of issue #1159 (https://github.com/pagarme/pilot/issues/1159)
      // It was commented on to remove the anticipation limits call on Balance page
      // This code will be used again in the future when ATLAS project implements the anticipation flow
      // More details in issue #1159
      // anticipation: {
      //   available,
      //   error: anticipationError,
      //   loading: anticipationLoading,
      // },
      anticipationCancel,
      balance: {
        amount,
        available: {
          withdrawal,
        },
        outcoming,
      },
      company,
      disabled,
      modalConfirmOpened,
      onAnticipationClick,
      onCancelRequestClick,
      onCancelRequestClose,
      onConfirmCancelPendingRequest,
      onTimeframeChange,
      onWithdrawClick,
      selectedTab,
      t,
    } = this.props

    const anticipationAction = {
      disabled,
      onClick: onAnticipationClick,
      title: t('pages.balance.anticipation'),
    }

    const withdrawalAction = {
      disabled,
      onClick: onWithdrawClick,
      title: t('pages.balance.withdraw'),
    }

    const { ted } = getTransfersPricing(company)

    return (
      <Fragment>
        <Grid>
          <Row stretch>
            <Col
              desk={12}
              palm={12}
              tablet={12}
              tv={12}
            >
              <Card>
                <CardContent>
                  <DetailsHead
                    identifier={company.name}
                    properties={this.getHeadProperties()}
                    title={t('pages.balance.recipient')}
                  />
                </CardContent>
              </Card>
            </Col>
          </Row>
          <Row stretch>
            <Col
              desk={4}
              palm={12}
              tablet={6}
              tv={4}
            >
              <BalanceTotalDisplay
                action={
                  isNil(onWithdrawClick)
                    ? null
                    : withdrawalAction
                }
                amount={amount}
                detail={
                  <span>
                    {t('pages.balance.available_withdrawal')}
                    <strong> {currencyFormatter(withdrawal)} </strong>
                  </span>
                }
                disabled={
                  disabled || withdrawal <= ted + MINIMUM_API_VALUE
                }
                title={t('pages.balance.withdrawal_title')}
              />
            </Col>
            <Col
              desk={4}
              palm={12}
              tablet={6}
              tv={4}
            >
              <BalanceTotalDisplay
                action={
                  isNil(onAnticipationClick)
                  ? null
                  : anticipationAction
                }
                amount={outcoming}
                // This block of code is commented because of issue #1159 (https://github.com/pagarme/pilot/issues/1159)
                // It was commented on to remove the anticipation limits call on Balance page
                // This code will be used again in the future when ATLAS project implements the anticipation flow
                // More details in issue #1159
                // detail={this.renderAnticipation()}
                // disabled={
                //   disabled
                //   || anticipationLoading
                //   || anticipationError
                //   || available < MINIMUM_API_VALUE
                // }
                detail={
                  <span>
                    {t('pages.balance.anticipation_call')}
                  </span>
                }
                disabled={disabled}
                title={t('pages.balance.waiting_funds')}
              />
            </Col>
            <Col
              desk={4}
              palm={12}
              tablet={6}
              tv={4}
            >
              <PendingRequests
                emptyMessage={t('pages.balance.pending_requests_empty_message')}
                loading={disabled}
                onCancel={
                  isNil(onCancelRequestClick)
                  ? null
                  : this.handleRequestCancelClick
                }
                requests={this.getPendingRequests()}
                title={t('pages.balance.pending_requests_title')}
              />
            </Col>
          </Row>
          <Row>
            <Col
              desk={12}
              palm={12}
              tablet={12}
              tv={12}
            >
              <Card>
                <CardContent>
                  <TabBar
                    onTabChange={onTimeframeChange}
                    selected={selectedTab}
                  >
                    <TabItem text={t('pages.balance.previous')}>
                      {this.renderOperations()}
                    </TabItem>
                    <TabItem text={t('pages.balance.waiting_funds')}>
                      {this.renderOperations()}
                    </TabItem>
                  </TabBar>
                </CardContent>
              </Card>
            </Col>
          </Row>
        </Grid>

        <Modal isOpen={modalConfirmOpened}>
          <ModalTitle
            closeIcon={<IconClose width={16} height={16} />}
            onClose={onCancelRequestClose}
            title={t('cancel_pending_request_title')}
          />
          <ModalContent>
            <div className={style.modalAlignContent}>
              {
                isValidDateAndSameDay(anticipationCancel)
                  ?
                    <Fragment>
                      <span>
                        {t('cancel_pending_request_text_today')}
                        <br />
                        <br />
                        {t('cancel_pending_request_text_today_confirm')}
                      </span>
                    </Fragment>
                  : t('cancel_pending_request_text')
              }
            </div>
          </ModalContent>
          <ModalActions>
            <div className={style.modalAlignContent}>
              <Button
                fill="outline"
                onClick={onCancelRequestClose}
              >
                {t('cancel_pending_request_cancel')}
              </Button>
              <Spacing size="small" />
              <Button
                fill="gradient"
                onClick={onConfirmCancelPendingRequest}
              >
                {t('cancel_pending_request_confirm')}
              </Button>
            </div>
          </ModalActions>
        </Modal>
      </Fragment>
    )
  }
}

const cashFlowShape = PropTypes.arrayOf(PropTypes.shape({
  amount: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
})).isRequired

const numberOrStringShape = PropTypes.oneOfType([
  PropTypes.string.isRequired,
  PropTypes.number.isRequired,
]).isRequired

const datesShape = PropTypes.shape({
  end: PropTypes.instanceOf(moment),
  start: PropTypes.instanceOf(moment),
})

Balance.propTypes = {
  // This block of code is commented because of issue #1159 (https://github.com/pagarme/pilot/issues/1159)
  // It was commented on to remove the anticipation limits call on Balance page
  // This code will be used again in the future when ATLAS project implements the anticipation flow
  // More details in issue #1159
  // anticipation: PropTypes.shape({
  //   available: PropTypes.number,
  //   error: PropTypes.bool.isRequired,
  //   loading: PropTypes.bool.isRequired,
  // }).isRequired,
  anticipationCancel: PropTypes.shape({
    id: PropTypes.string.isRequired,
    payment_date: PropTypes.string.isRequired,
  }),
  balance: PropTypes.shape({
    amount: PropTypes.number.isRequired,
    available: PropTypes.shape({
      withdrawal: PropTypes.number.isRequired,
    }),
    outcoming: PropTypes.number.isRequired,
  }).isRequired,
  company: PropTypes.shape({
    id: numberOrStringShape.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  currentPage: PropTypes.number.isRequired,
  dates: datesShape.isRequired, // eslint-disable-line react/no-typos
  disabled: PropTypes.bool.isRequired,
  exporting: PropTypes.bool.isRequired,
  loading: PropTypes.bool,
  modalConfirmOpened: PropTypes.bool,
  onAnticipationClick: PropTypes.func.isRequired,
  onCancelRequestClick: PropTypes.func,
  onCancelRequestClose: PropTypes.func,
  onConfirmCancelPendingRequest: PropTypes.func,
  onExport: PropTypes.func.isRequired,
  onFilterClick: PropTypes.func.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onTimeframeChange: PropTypes.func.isRequired,
  onWithdrawClick: PropTypes.func.isRequired,
  recipient: PropTypes.shape({
    bank_account: PropTypes.shape({
      account: PropTypes.string.isRequired,
      agency: PropTypes.string.isRequired,
      bank_code: PropTypes.string.isRequired,
      id: numberOrStringShape,
      type: PropTypes.string.isRequired,
    }).isRequired,
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  requests: PropTypes.arrayOf(PropTypes.shape({
    amount: PropTypes.number,
    created_at: PropTypes.string,
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  })).isRequired,
  search: PropTypes.shape({
    operations: PropTypes.shape({
      count: PropTypes.number.isRequired,
      offset: PropTypes.number.isRequired,
      rows: PropTypes.arrayOf(PropTypes.shape({
        id: numberOrStringShape,
        net: PropTypes.number.isRequired,
        outcoming: cashFlowShape,
        outgoing: cashFlowShape,
        payment_date: PropTypes.shape({
          actual: PropTypes.string.isRequired,
          original: PropTypes.string,
        }),
        sourceId: PropTypes.string,
        targetId: PropTypes.string,
        transactionId: PropTypes.number,
        type: PropTypes.string.isRequired,
      })),
      total: PropTypes.number.isRequired,
    }),
  }).isRequired,
  selectedTab: PropTypes.number,
  t: PropTypes.func.isRequired,
  total: PropTypes.shape({
    net: PropTypes.number,
    outcoming: PropTypes.number,
    outgoing: PropTypes.number,
  }),
}

Balance.defaultProps = {
  anticipationCancel: null,
  loading: false,
  modalConfirmOpened: false,
  onCancelRequestClick: null,
  onCancelRequestClose: null,
  onConfirmCancelPendingRequest: null,
  selectedTab: 0,
  total: {},
}

export default Balance
