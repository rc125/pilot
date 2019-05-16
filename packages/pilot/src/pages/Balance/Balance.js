import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import qs from 'qs'
import {
  always,
  allPass,
  anyPass,
  applySpec,
  assoc,
  complement,
  compose,
  defaultTo,
  either,
  identity,
  invoker,
  isEmpty,
  isNil,
  juxt,
  merge,
  mergeAll,
  path,
  pathEq,
  pathOr,
  pipe,
  propEq,
  propOr,
  tail,
  test,
  uncurryN,
  unless,
  when,
  whereEq,
} from 'ramda'
import IconInfo from 'emblematic-icons/svg/Info32.svg'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'
import { withRouter } from 'react-router-dom'
import { Alert } from 'former-kit'
import {
  requestBalance,
  receiveBalance,
} from './actions'
import { requestLimits } from '../Anticipation'
import BalanceContainer from '../../containers/Balance'
import env from '../../environment'
import { withError } from '../ErrorBoundary'

const mapStateToProps = ({
  account: {
    client,
    company,
    sessionId,
    user,
  },
  // This block of code is commented because of issue #1159 (https://github.com/pagarme/pilot/issues/1159)
  // It was commented on to remove the anticipation limits call on Balance page
  // This code will be used again in the future when ATLAS project implements the anticipation flow
  // More details in issue #1159
  // anticipation: {
  //   error: anticipationError,
  //   limits: {
  //     max,
  //   },
  //   loading: anticipationLoading,
  // },
  balance: {
    balanceError,
    loading,
    query,
  },
}) => ({
  // This block of code is commented because of issue #1159 (https://github.com/pagarme/pilot/issues/1159)
  // It was commented on to remove the anticipation limits call on Balance page
  // This code will be used again in the future when ATLAS project implements the anticipation flow
  // More details in issue #1159
  // anticipation: {
  //   available: max,
  //   error: !isNil(anticipationError),
  //   loading: anticipationLoading,
  // },
  balanceError,
  client,
  company,
  loading,
  query,
  sessionId,
  user,
})

const mapDispatchToProps = {
  onReceiveBalance: receiveBalance,
  onRequestAnticipationLimits: requestLimits,
  onRequestBalance: requestBalance,
  onRequestBalanceFail: receiveBalance,
}

const enhanced = compose(
  translate(),
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  withRouter,
  withError
)

const isNilOrEmpty = anyPass([isNil, isEmpty])

const isInvalidNumber = either(isNil, Number.isNaN)

const momentToISOString = unless(
  isNilOrEmpty,
  pipe(moment, invoker(0, 'toISOString'))
)

const stringToMoment = unless(
  isNilOrEmpty,
  moment
)

const queryDatesToISOString = applySpec({
  dates: {
    end: pipe(path(['dates', 'end']), momentToISOString),
    start: pipe(path(['dates', 'start']), momentToISOString),
  },
})

const queryDatesToMoment = applySpec({
  dates: {
    end: pipe(path(['dates', 'end']), stringToMoment),
    start: pipe(path(['dates', 'start']), stringToMoment),
  },
})

const normalizeTo = (defaultValue, propPath) => pipe(
  path(propPath),
  when(
    either(isNil, isEmpty),
    defaultTo(defaultValue)
  )
)

const normalizeQueryStructure = applySpec({
  count: pipe(
    normalizeTo(15, ['count']),
    Number
  ),
  page: pipe(
    normalizeTo(1, ['page']),
    Number
  ),
})

const parseQueryUrl = pipe(
  tail,
  qs.parse,
  juxt([
    identity,
    queryDatesToMoment,
    normalizeQueryStructure,
  ]),
  mergeAll
)

const isRecipientId = test(/^re_/)

const isNotRecipientId = complement(isRecipientId)

const getValidId = uncurryN(2, defaultId => unless(
  complement(anyPass([
    isNil,
    Number.isNaN,
    isEmpty,
    isNotRecipientId,
  ])),
  always(defaultId)
))

const getRecipientId = pathOr(null, ['default_recipient_id', env])

const cancelBulkAnticipation = ({ bulkId, recipientId }, client) =>
  client.bulkAnticipations.cancel({
    id: bulkId,
    recipientId,
  })

const userIsReadOnly = propEq('permission', 'read_only')

const handleExportDataSuccess = (res, format) => {
  /* eslint-disable no-undef */
  let contentType
  if (format === 'xlsx') {
    contentType = 'application/ms-excel'
  } else {
    contentType = 'text/csv;charset=utf-8'
  }

  const blob = new Blob([res], { type: contentType })
  const filename = `PagarMe_Extrato_${moment().format('DD/MM/YYYY')}.${format}`

  const downloadLink = document.createElement('a')
  downloadLink.target = '_blank'
  downloadLink.download = filename
  const URL = window.URL || window.webkitURL
  const downloadUrl = URL.createObjectURL(blob)
  downloadLink.href = downloadUrl
  document.body.append(downloadLink)
  downloadLink.click()
  document.body.removeChild(downloadLink)
  URL.revokeObjectURL(downloadUrl)
  /* eslint-enable no-undef */
}
const defaultTimeframe = 'past'
const timeframesQuery = [defaultTimeframe, 'future']
const getTimeframeProp = propOr(defaultTimeframe, 'timeframe')

const getTimeframeIndex = timeframe => (timeframe
  ? timeframesQuery.findIndex(value => value === timeframe)
  : 0)

const mustUpdateTotals = uncurryN(2, ({ count, dates, timeframe }) =>
  complement(allPass([
    whereEq({ count }),
    whereEq({ dates }),
    whereEq({ timeframe }),
  ])))

const mustUpateOperations = uncurryN(2, ({
  page,
}) => complement(whereEq({ page })))

const buildNewOperationsQuery = ({
  query,
  searchQuery,
  stateQuery,
}) => {
  const timeframe = getTimeframeProp(searchQuery)
  return assoc(timeframe, query, stateQuery)
}

const areEqualPages = (query, search) => {
  const timeframe = getTimeframeProp(search)

  return pathEq([timeframe, 'page'], search.page, query)
}

const defaultPageNumber = 15

class Balance extends Component {
  constructor (props) {
    super(props)

    this.state = {
      anticipationCancel: null,
      balance: {},
      exporting: false,
      modalOpened: false,
      nextPage: null,
      query: {
        future: {
          count: defaultPageNumber,
          dates: {
            end: moment().add(7, 'days'),
            start: moment(),
          },
          page: 1,
          status: 'waiting_funds',
          timeframe: 'future',
        },
        past: {
          count: defaultPageNumber,
          dates: {
            end: moment(),
            start: moment().subtract(7, 'days'),
          },
          page: 1,
          status: 'available',
          timeframe: defaultTimeframe,
        },
      },
      recipient: {},
      requests: [],
      total: {},
    }

    this.handleAnticipation = this.handleAnticipation.bind(this)
    this.handleCancelRequest = this.handleCancelRequest.bind(this)
    this.handleCloseConfirmCancel = this.handleCloseConfirmCancel.bind(this)
    this.handleDateChange = this.handleDateChange.bind(this)
    this.handleExportData = this.handleExportData.bind(this)
    this.handleFilter = this.handleFilter.bind(this)
    this.handleOpenConfirmCancel = this.handleOpenConfirmCancel.bind(this)
    this.handlePageChange = this.handlePageChange.bind(this)
    this.handlePageCountChange = this.handlePageCountChange.bind(this)
    this.handleWithdraw = this.handleWithdraw.bind(this)
    // this.requestAnticipationLimits = this.requestAnticipationLimits.bind(this)
    this.requestData = this.requestData.bind(this)
    this.requestTotals = this.requestTotals.bind(this)
    this.updateQuery = this.updateQuery.bind(this)
    this.handleTimeframeChange = this.handleTimeframeChange.bind(this)
    this.getQuery = this.getQuery.bind(this)
    this.setQuery = this.setQuery.bind(this)
  }

  componentDidMount () {
    const {
      // This block of code is commented because of issue #1159 (https://github.com/pagarme/pilot/issues/1159)
      // It was commented on to remove the anticipation limits call on Balance page
      // This code will be used again in the future when ATLAS project implements the anticipation flow
      // More details in issue #1159
      // anticipation: {
      //   available,
      // },
      history: {
        location,
      },
      match: {
        params: {
          id,
        },
      },
    } = this.props
    const urlBalanceQuery = location.search

    if (isEmpty(urlBalanceQuery)) {
      this.updateQuery(this.getQuery(), id)
    } else {
      this.requestData(id, parseQueryUrl(urlBalanceQuery))
      // This block of code is commented because of issue #1159 (https://github.com/pagarme/pilot/issues/1159)
      // It was commented on to remove the anticipation limits call on Balance page
      // This code will be used again in the future when ATLAS project implements the anticipation flow
      // More details in issue #1159
      // if (available === null) {
      //   this.requestAnticipationLimits(params.id)
      // }
    }
  }

  componentDidUpdate (prevProps) {
    const {
      location: {
        search: oldSearch,
      },
      match: {
        params: {
          id: oldRecipientId,
        },
      },
    } = prevProps

    const {
      // This block of code is commented because of issue #1159 (https://github.com/pagarme/pilot/issues/1159)
      // It was commented on to remove the anticipation limits call on Balance page
      // This code will be used again in the future when ATLAS project implements the anticipation flow
      // More details in issue #1159
      // anticipation: {
      //   available,
      // },
      company,
      location: {
        search: newSearch,
      },
      match: {
        params: {
          id: newRecipientId,
        },
      },
    } = this.props

    if (oldRecipientId !== newRecipientId) {
      return this.requestData(newRecipientId, parseQueryUrl(newSearch))
    }

    if (oldSearch !== newSearch) {
      // This block of code is commented because of issue #1159 (https://github.com/pagarme/pilot/issues/1159)
      // It was commented on to remove the anticipation limits call on Balance page
      // This code will be used again in the future when ATLAS project implements the anticipation flow
      // More details in issue #1159
      // if (available === null) {
      //   this.requestAnticipationLimits(newRecipientId)
      // }
      const parsedQueries = {
        new: qs.parse(newSearch),
        old: qs.parse(oldSearch),
      }
      const query = parseQueryUrl(newSearch)

      if (!isEmpty(oldSearch)) {
        if (mustUpdateTotals(parsedQueries.old, parsedQueries.new)) {
          return this.requestTotals(newRecipientId, query)
        }

        if (mustUpateOperations(parsedQueries.old, parsedQueries.new)) {
          return this.requestOperations(query)
        }
      }

      return this.requestData(newRecipientId, query)
    }

    if (
      !oldSearch
      && !newSearch
      && company
      && company.default_recipient_id
    ) {
      const pathId = getValidId(getRecipientId(company), null)

      return this.updateQuery(this.getQuery(), pathId)
    }

    return undefined
  }

  getQuery (newTimeframe) {
    const {
      history: {
        location: {
          search,
        },
      },
    } = this.props
    const timeframe = getTimeframeProp(qs.parse(search))
    const { query } = this.state

    return query[newTimeframe || timeframe]
  }

  setQuery (query) {
    const { query: stateQuery } = this.state
    const timeframe = getTimeframeProp(query)
    const newQuery = assoc(timeframe, query, stateQuery)
    this.setState({
      query: newQuery,
    })
  }

  updateQuery (query, id) {
    const timeframe = getTimeframeProp(query)
    const buildBalanceQuery = pipe(
      queryDatesToISOString,
      merge(query),
      qs.stringify
    )
    const {
      history,
      match: {
        params,
      },
    } = this.props

    const queryObject = isNilOrEmpty(query)
      ? this.getQuery()
      : query[timeframe] || query

    const pathId = getValidId(getRecipientId(this.props.company), id)

    if (pathId) {
      const queryString = buildBalanceQuery(queryObject)

      history.replace({
        pathname: pathId,
        search: queryString,
      })
    } else if (params.id === ':id') {
      history.replace('/balance')
    }
  }

  requestAnticipationLimits (id) {
    const { client } = this.props
    const now = moment()

    return client
      .business
      .requestBusinessCalendar(now.year())
      .then(calendar => client
        .business
        .nextAnticipableBusinessDay(calendar, { hour: 10 }, now))
      .then(paymentDate =>
        this.props.onRequestAnticipationLimits({
          paymentDate,
          recipientId: id,
          timeframe: 'start',
        }))
  }

  requestTotals (id, searchQuery) {
    const { client } = this.props
    const { nextPage } = this.state
    if (nextPage) {
      this.setState({ nextPage: null })
    }

    const totalPromise = client.balance.total(id, searchQuery)
    const operationsPromise = client.balance
      .operations({ recipientId: id, ...searchQuery })

    return Promise.all([
      operationsPromise,
      totalPromise,
    ]).then(([{ query, result: { search } }, total]) => {
      const { query: stateQuery } = this.state
      const operationsRowsLength = search.operations.rows.length
      const hasNextPage = operationsRowsLength >= searchQuery.count
      const newQuery = buildNewOperationsQuery({
        query,
        searchQuery,
        stateQuery,
      })
      const newState = {
        query: newQuery,
        search,
        total,
      }

      this.setState(newState)

      if (hasNextPage) {
        this.requestOperations(searchQuery, searchQuery.page + 1)
      }
    })
  }

  requestOperations (searchQuery, newPage) {
    const { client, company } = this.props
    const { nextPage } = this.state
    const recipientId = getRecipientId(company)
    const page = newPage || searchQuery.page

    if (nextPage) {
      const { query: nextPageQuery, search: nextPageSearch } = nextPage
      if (areEqualPages(nextPageQuery, searchQuery) && !newPage) {
        this.setState({
          nextPage: null,
          query: nextPageQuery,
          search: nextPageSearch,
        })
        if (nextPage.hasNextPage) {
          this.requestOperations(searchQuery, searchQuery.page + 1)
        }
      }
    }

    client.balance
      .operations({ ...searchQuery, page, recipientId })
      .then(({ query, result: { search: { operations } } }) => {
        const { query: stateQuery } = this.state
        const operationsRowsLength = operations.rows.length
        const hasNextPage = operationsRowsLength >= searchQuery.count
        const newQuery = buildNewOperationsQuery({
          query,
          searchQuery: { ...searchQuery, page },
          stateQuery,
        })
        if (page !== searchQuery.page) {
          this.setState({
            nextPage: {
              hasNextPage,
              isValid: operationsRowsLength > 0,
              query: newQuery,
              search: { operations },
            },
          })
        } else {
          this.setState({
            query: newQuery,
            search: { operations },
          })
          if (hasNextPage) {
            this.requestOperations(searchQuery, page + 1)
          }
        }
      })
  }

  requestData (id, searchQuery) {
    const { client, onRequestBalance } = this.props
    onRequestBalance({ searchQuery })
    const dataPromise = client.balance.data(id, searchQuery)
    const totalPromise = client.balance.total(id, searchQuery)
    const operationsPromise = client.balance
      .operations({ recipientId: id, ...searchQuery })
    this.setState({ loading: true })

    Promise.all([dataPromise, operationsPromise, totalPromise])
      .then(([data, operations, total]) => {
        const { result: { search } } = operations
        const { query, result } = data
        const { query: stateQuery } = this.state
        const timeframe = getTimeframeProp(searchQuery)
        const newQuery = assoc(timeframe, query, stateQuery)
        const newState = {
          loading: false,
          query: newQuery,
          search,
          ...result,
          total,
        }

        this.setState(newState)
        const operationsRowsLength = search.operations.rows.length
        if (operationsRowsLength > 0
            && operationsRowsLength >= searchQuery.count) {
          this.requestOperations(searchQuery, searchQuery.page + 1)
        }

        this.props.onReceiveBalance(query)
      })
      .catch((error) => {
        this.props.onRequestBalanceFail(error)
      })
  }

  handleAnticipation () {
    const {
      company,
      history,
    } = this.props

    history.push(`/anticipation/${getRecipientId(company)}`)
  }

  handleCancelRequest () {
    const { client, company } = this.props
    const recipientId = getRecipientId(company)
    const { id: bulkId } = this.state.anticipationCancel

    cancelBulkAnticipation({
      bulkId,
      recipientId,
    }, client)
      .then(() => client.bulkAnticipations.findPendingRequests(recipientId))
      .then(response => this.setState({
        ...this.state,
        modalOpened: false,
        requests: response,
      }))
      .then(() => this.requestAnticipationLimits(recipientId))
  }

  handleExportData (format) {
    this.setState({ exporting: true })

    const { client, company } = this.props
    const { query } = this.state
    const startDate = query.dates.start.format('x')
    const endDate = query.dates.end.format('x')

    const recipientId = getRecipientId(company)
    return client
      .withVersion('2018-09-10')
      .balanceOperations
      .find({
        endDate,
        format,
        recipientId,
        startDate,
      })
      .then((res) => {
        this.setState({ exporting: false })
        handleExportDataSuccess(res, format)
      })
  }

  handleDateChange (dates) {
    const query = this.getQuery()
    this.setQuery(merge(query, { dates, page: 1 }))
  }

  handleFilter (dates, filteredTimeframe) {
    const {
      query,
    } = this.props
    const timeframe = filteredTimeframe || defaultTimeframe

    const nextQuery = {
      ...query,
      ...this.getQuery(timeframe),
      dates,
      page: 1,
      timeframe,
    }

    this.updateQuery(nextQuery)
  }

  handlePageChange (page) {
    const query = {
      ...this.getQuery(),
      page,
    }

    this.updateQuery(query)
  }

  handlePageCountChange (numberOfPages) {
    const count = isInvalidNumber(numberOfPages)
      ? defaultPageNumber
      : +numberOfPages
    const query = {
      ...this.getQuery(),
      count,
      page: 1,
    }

    this.updateQuery(query)
  }

  handleWithdraw () {
    const {
      company,
      history,
    } = this.props

    history.push(`/withdraw/${getRecipientId(company)}`)
  }

  handleOpenConfirmCancel (anticipation) {
    this.setState({
      ...this.state,
      anticipationCancel: anticipation,
      modalOpened: true,
    })
  }

  handleCloseConfirmCancel () {
    this.setState({
      ...this.state,
      anticipationCancel: null,
      modalOpened: false,
    })
  }

  handleTimeframeChange (timeframeIndex) {
    const timeframe = timeframesQuery[timeframeIndex]
    this.updateQuery(this.getQuery(timeframe))
  }

  render () {
    const {
      // This block of code is commented because of issue #1159 (https://github.com/pagarme/pilot/issues/1159)
      // It was commented on to remove the anticipation limits call on Balance page
      // This code will be used again in the future when ATLAS project implements the anticipation flow
      // More details in issue #1159
      // anticipation,
      balanceError,
      company,
      error,
      history: {
        location: {
          search: urlSearch,
        },
      },
      loading,
      t,
      user,
    } = this.props
    const timeframe = getTimeframeProp(qs.parse(urlSearch))

    const {
      anticipationCancel,
      balance,
      exporting,
      modalOpened,
      nextPage,
      query,
      recipient,
      requests,
      search,
      total,
    } = this.state
    const { dates, page } = query[timeframe]
    const isEmptyResult = isNilOrEmpty(this.state.search)
    const hasDefaultRecipient = !isNilOrEmpty(getRecipientId(company))
    const hasCompany = !isNil(company)

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

    if (balanceError) {
      return (
        <Alert
          icon={<IconInfo height={16} width={16} />}
          type="error"
        >
          <span>
            {pathOr(
              t('pages.balance.adblock_error'),
              ['errors', 0, 'message'],
              balanceError
            )}
          </span>
        </Alert>
      )
    }

    if (!hasDefaultRecipient && hasCompany) {
      return (
        <Alert
          icon={<IconInfo height={16} width={16} />}
          type="info"
        >
          <span>{t('pages.balance.invalid_recipient')}</span>
        </Alert>
      )
    }

    if (!isEmptyResult && hasCompany) {
      const itemsPerPage = query[timeframe]
        ? query[timeframe].count
        : defaultPageNumber
      const hasNextPage = nextPage && nextPage.isValid

      return (
        <BalanceContainer
          // This block of code is commented because of issue #1159 (https://github.com/pagarme/pilot/issues/1159)
          // It was commented on to remove the anticipation limits call on Balance page
          // This code will be used again in the future when ATLAS project implements the anticipation flow
          // More details in issue #1159
          // anticipation={anticipation}
          anticipationCancel={anticipationCancel}
          balance={balance}
          company={company}
          currentPage={page}
          dates={dates}
          disabled={loading}
          exporting={exporting}
          hasNextPage={hasNextPage}
          itemsPerPage={itemsPerPage}
          loading={loading}
          modalConfirmOpened={modalOpened}
          onAnticipationClick={this.handleAnticipation}
          onCancelRequestClick={userIsReadOnly(user)
            ? null
            : this.handleOpenConfirmCancel
          }
          onCancelRequestClose={this.handleCloseConfirmCancel}
          onConfirmCancelPendingRequest={this.handleCancelRequest}
          onDatesChange={this.handleDateChange}
          onExport={this.handleExportData}
          onFilterClick={this.handleFilter}
          onPageChange={this.handlePageChange}
          onPageCountChange={this.handlePageCountChange}
          onTimeframeChange={this.handleTimeframeChange}
          onWithdrawClick={this.handleWithdraw}
          recipient={recipient}
          requests={requests}
          search={search}
          selectedTab={getTimeframeIndex(timeframe)}
          t={t}
          timeframe={timeframe}
          total={total}
        />
      )
    }

    return null
  }
}

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
  balanceError: PropTypes.shape({
    errors: PropTypes.arrayOf(PropTypes.shape({
      message: PropTypes.string,
    })),
  }),
  client: PropTypes.shape({
    balance: PropTypes.shape({
      data: PropTypes.func.isRequired,
      operations: PropTypes.func.isRequired,
      total: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
  company: PropTypes.shape({
    default_recipient_id: PropTypes.shape({
      live: PropTypes.string,
      test: PropTypes.string,
    }).isRequired,
  }),
  error: PropTypes.shape({
    localized: PropTypes.shape({
      message: PropTypes.string.isRequired,
    }),
    message: PropTypes.string,
  }),
  history: PropTypes.shape({
    location: PropTypes.shape({
      search: PropTypes.string,
    }).isRequired,
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
  }).isRequired,
  loading: PropTypes.bool.isRequired,
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }).isRequired,
  }).isRequired,
  onReceiveBalance: PropTypes.func.isRequired,
  onRequestAnticipationLimits: PropTypes.func.isRequired,
  onRequestBalance: PropTypes.func.isRequired,
  onRequestBalanceFail: PropTypes.func.isRequired,
  query: PropTypes.shape({
    dates: {
      end: PropTypes.string,
      start: PropTypes.string,
    },
  }),
  t: PropTypes.func.isRequired,
  user: PropTypes.shape({
    permission: PropTypes.oneOf([
      'admin', 'read_only', 'write',
    ]).isRequired,
  }),
}

Balance.defaultProps = {
  balanceError: null,
  company: null,
  error: null,
  query: null,
  user: null,
}

export default enhanced(Balance)
