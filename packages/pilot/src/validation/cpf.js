import { CPF } from 'cpf_cnpj'

export default message => value => !CPF.isValid(value) && message
