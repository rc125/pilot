const isUrl = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%.+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%+.~#()?&//=]*)/

export default message => value => !isUrl.test(value) && message
