const isCep = /^[0-9]{5}-[0-9]{3}$/

export default message => value => !isCep.test(value) && message
