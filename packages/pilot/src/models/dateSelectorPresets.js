import {
  equals,
  identity,
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

const buildDaysPresetsList = (t, transform) => [
  {
    date: () => transform(7),
    key: 'days-7',
    label: t('dates.days-7'),
    mode: 'period',
  },
  {
    date: () => transform(15),
    key: 'days-15',
    label: t('dates.days-15'),
    mode: 'period',
  },
  {
    date: () => transform(30),
    key: 'days-30',
    label: t('dates.days-30'),
    mode: 'period',
  },
  {
    date: () => transform(60),
    key: 'days-60',
    label: t('dates.days-60'),
    mode: 'period',
  },
]

const buildFuturePresets = t => () => ({
  key: 'days',
  label: t('dates.next'),
  list: buildDaysPresetsList(t, identity),
})

const buildPastPresets = t => () => ({
  key: 'days',
  label: t('dates.last'),
  list: buildDaysPresetsList(t, negate),
})

const buildPresets = uncurryN(2, t => ifElse(
  equals('future'),
  buildFuturePresets(t),
  buildPastPresets(t)
))

const dateSelectorPresets = (t, timeframe = 'past') => [
  buildTodayPreset(t),
  buildPresets(t, timeframe),
  buildCustomPresets(t),
]

export default dateSelectorPresets
