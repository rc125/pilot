import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Download32 from 'emblematic-icons/svg/Download32.svg'
import {
  CardContent,
  CardTitle,
  Pagination,
  Spacing,
} from 'former-kit'
import ExportData from '../ExportData'
import TableData from './TableData'

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
      ofLabel,
      onExport,
      onPageChange,
      subtitle,
      totalPages,
    } = this.props

    return (
      <div className={style.subtitle}>
        <h3>{subtitle}</h3>
        <ExportData
          exportOptions={getExportOptions(onExport)}
          icon={<Download32 width={12} height={12} />}
          loading={exporting}
          placement="bottomEnd"
          relevance="low"
          size="tiny"
          subtitle="Exportar para:"
          title="Exportar tabela"
        />
        <Spacing size="tiny" />
        <Pagination
          currentPage={currentPage}
          disabled={disabled}
          onPageChange={onPageChange}
          strings={{
            of: ofLabel,
          }}
          totalPages={totalPages}
        />
      </div>
    )
  }

  render () {
    const {
      columns,
      currentPage,
      disabled,
      emptyMessage,
      loading,
      ofLabel,
      onPageChange,
      rows,
      title,
      totalPages,
    } = this.props

    return (
      <div className={style.container}>
        <div className={style.head}>
          <CardTitle
            subtitle={this.renderSubTitle()}
            title={title}
          />
        </div>
        <CardContent>
          <TableData
            columns={columns}
            disabled={disabled}
            emptyMessage={emptyMessage}
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
            onPageChange={onPageChange}
            strings={{
              of: ofLabel,
            }}
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
  currentPage: PropTypes.number.isRequired,
  disabled: PropTypes.bool,
  emptyMessage: PropTypes.string.isRequired,
  exporting: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  ofLabel: PropTypes.string.isRequired,
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
  subtitle: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  totalPages: PropTypes.number.isRequired,
}

Operations.defaultProps = {
  disabled: false,
}

export default Operations
