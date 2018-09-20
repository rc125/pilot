import moment from 'moment'

const getAge = (value) => {
  const forceFormat = true
  const birthYear = moment(value, 'DD/MM/YYYY', forceFormat).year()
  const currentYear = moment().year()

  return currentYear - birthYear
}

const hasLegalAge = value => getAge(value) >= 18

export default message => value => !hasLegalAge(value) && message
