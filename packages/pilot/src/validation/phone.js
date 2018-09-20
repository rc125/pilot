/* eslint-disable no-useless-escape */
const isPhone = /(?:^\([0]?[1-9]{2}\)|^[0]?[1-9]{2}[\.-\s]?)\s[9]?[1-9]\d{3}[\.-\s]?[0-9]{4}[_]?$/
/* eslint-enable no-useless-escape */

export default message => value => !isPhone.test(value) && message
