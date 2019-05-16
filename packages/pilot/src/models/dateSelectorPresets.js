import {
  always,
  equals,
  ifElse,
  negate,
  uncurryN,
} from 'ramda'

const buildCustomPresets = t => ({
  key: 'custom',
  label: t('dates.custom'),
  list: [
    {
      date: () => null,
      key: 'single',
      label: t('dates.day'),
      mode: 'single',
    },
    {
      date: () => null,
      key: 'period',
      label: t('dates.period'),
      mode: 'period',
    },
  ],
})

const buildTodayPreset = t => ({
  date: () => 0,
  key: 'today',
  label: t('dates.today'),
  mode: 'single',
})

const buildFurutePresets = t => () => ({
  key: 'last',
  label: t('dates.last'),
  list: [
    {
      date: () => -7,
      key: 'last-7',
      label: t('dates.last-7'),
      mode: 'period',
    },
    {
      date: () => -15,
      key: 'last-15',
      label: t('dates.last-15'),
      mode: 'period',
    },
    {
      date: () => -30,
      key: 'last-30',
      label: t('dates.last-30'),
      mode: 'period',
    },
    {
      date: () => -60,
      key: 'last-60',
      label: t('dates.last-60'),
      mode: 'period',
    },
  ],
})

const buildPastPresets = t => () => ({
  key: 'last',
  label: t('dates.last'),
  list: [
    {
      date: () => -7,
      key: 'last-7',
      label: t('dates.last-7'),
      mode: 'period',
    },
    {
      date: () => -15,
      key: 'last-15',
      label: t('dates.last-15'),
      mode: 'period',
    },
    {
      date: () => -30,
      key: 'last-30',
      label: t('dates.last-30'),
      mode: 'period',
    },
    {
      date: () => -60,
      key: 'last-60',
      label: t('dates.last-60'),
      mode: 'period',
    },
  ],
})

const buildPresets = uncurryN(2, t => ifElse(
  equals('future'),
  buildFurutePresets(t),
  buildPastPresets(t)
))

const dateSelectorPresets = (t, timeframe = 'past') => [
  buildTodayPreset(t),
  buildPresets(t, timeframe),
  buildCustomPresets(t),
]

export default dateSelectorPresets
