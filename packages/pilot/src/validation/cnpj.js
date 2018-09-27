import { CNPJ } from 'cpf_cnpj'

export default message => value => !CNPJ.isValid(value) && message
