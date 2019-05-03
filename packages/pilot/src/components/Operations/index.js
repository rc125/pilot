import React, {
  Fragment,
  PureComponent,
} from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Download32 from 'emblematic-icons/svg/Download32.svg'
import { isNil } from 'ramda'
import {
  CardContent,
  CardTitle,
  isMomentPropValidation,
  Pagination,
  Spacing,
} from 'former-kit'
import ExportData from '../ExportData'
import TableData from './TableData'
import dateFormat from '../../formatters/longDate'

import style from './style.css'

const getExportOptions = onExport => ([
  {
    action: () => onExport('csv'),
    title: 'CSV',
  },
  {
    action: () => onExport('xlsx'),
    title: 'Excel',
  },
])

class Operations extends PureComponent {
  constructor (props) {
    super(props)

    this.renderSubTitle = this.renderSubTitle.bind(this)
  }

  renderSubTitle () {
    const {
      currentPage,
      disabled,
      exporting,
      labels: {
        exportCall,
        exportTo,
      },
      onExport,
      onPageChange,
      subtitle,
      totalPages,
    } = this.props

    return (
      <div className={style.subtitle}>
        {subtitle}
        <ExportData
          exportOptions={getExportOptions(onExport)}
          icon={<Download32 width={12} height={12} />}
          loading={exporting}
          placement="bottomEnd"
          relevance="low"
          size="tiny"
          subtitle={exportTo}
          title={exportCall}
        />
        <Spacing size="tiny" />
        <Pagination
          currentPage={currentPage}
          disabled={disabled}
          onPageChange={onPageChange}
          format="single"
          totalPages={totalPages}
        />
      </div>
    )
  }

  renderTitle () {
    const {
      count,
      dates: {
        end,
        start,
      },
      labels: {
        results,
        totalOf,
      },
    } = this.props

    const separator = (
      <Fragment>
        &nbsp;<small>-</small>&nbsp;
      </Fragment>
    )

    return (
      <span className={style.title}>
        <strong>{dateFormat(start)}</strong>
        {separator}
        <strong>{dateFormat(end)}</strong>
        {!isNil(count) && results &&
          <span>
            {separator}
            {totalOf}
            &nbsp;
            <strong>
              {count}
            </strong>
            &nbsp;
            {results}
          </span>
        }
      </span>
    )
  }

  render () {
    const {
      columns,
      currentPage,
      disabled,
      labels: {
        empty,
      },
      loading,
      onPageChange,
      rows,
      totalPages,
    } = this.props

    return (
      <div className={style.container}>
        <div className={style.head}>
          <CardTitle
            subtitle={this.renderSubTitle()}
            title={this.renderTitle()}
          />
        </div>
        <CardContent>
          <TableData
            columns={columns}
            disabled={disabled}
            emptyMessage={empty}
            loading={loading}
            rows={rows}
          />
        </CardContent>
        <CardContent className={classNames(
            style.paginationBottom,
            style.pagination
          )}
        >
          <Pagination
            currentPage={currentPage}
            disabled={disabled}
            format="single"
            onPageChange={onPageChange}
            totalPages={totalPages}
          />
        </CardContent>
      </div>
    )
  }
}

const outShape = PropTypes.shape({
  amount: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
})

Operations.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    accessor: PropTypes.arrayOf(PropTypes.string).isRequired,
    orderable: PropTypes.bool.isRequired,
    renderer: PropTypes.func,
    title: PropTypes.string.isRequired,
  })).isRequired,
  count: PropTypes.number,
  currentPage: PropTypes.number.isRequired,
  dates: PropTypes.shape({
    end: isMomentPropValidation.isRequired,
    start: isMomentPropValidation.isRequired,
  }).isRequired,
  disabled: PropTypes.bool,
  exporting: PropTypes.bool.isRequired,
  labels: PropTypes.shape({
    empty: PropTypes.string.isRequired,
    exportCall: PropTypes.string.isRequired,
    exportTo: PropTypes.string.isRequired,
    results: PropTypes.string,
    totalOf: PropTypes.string,
  }).isRequired,
  loading: PropTypes.bool,
  onExport: PropTypes.func.isRequired,
  onPageChange: PropTypes.func.isRequired,
  rows: PropTypes.arrayOf(PropTypes.shape({
    description: PropTypes.string,
    id: PropTypes.oneOfType([
      PropTypes.string.isRequired,
      PropTypes.number.isRequired,
    ]),
    net: PropTypes.number.isRequired,
    outcoming: PropTypes.arrayOf(outShape).isRequired,
    outgoing: PropTypes.arrayOf(outShape).isRequired,
    payment_date: PropTypes.shape({
      actual: PropTypes.string,
      original: PropTypes.string,
    }).isRequired,
    sourceId: PropTypes.string,
    targetId: PropTypes.string,
    transactionId: PropTypes.number,
    type: PropTypes.string.isRequired,
  })).isRequired,
  subtitle: PropTypes.node,
  totalPages: PropTypes.number.isRequired,
}

Operations.defaultProps = {
  count: null,
  disabled: false,
  loading: false,
  subtitle: null,
}

export default Operations
