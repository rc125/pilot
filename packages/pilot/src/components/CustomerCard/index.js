import React from 'react'
import PropTypes from 'prop-types'
import {
  Card,
  CardTitle,
  CardContent,
  Grid,
  Row,
  Col,
} from 'former-kit'
import { mapObjIndexed } from 'ramda'
import Property from '../Property'
import style from './style.css'

const fields = (labels, contents) => mapObjIndexed((label, key) => (
  <Property
    title={label}
    value={contents[key]}
  />
), labels)

const CustomerCard = ({ contents, labels, title }) => {
  const customer = fields(labels, contents)

  return (
    <Card>
      <CardTitle title={title} />
      <CardContent>
        <Grid>
          <Row>
            <Col
              palm={12}
              tablet={6}
              desk={4}
              tv={4}
              className={style.propertyCustom}
            >
              {customer.name}
            </Col>

            <Col
              palm={12}
              tablet={6}
              desk={4}
              tv={4}
              className={style.propertyCustom}
            >
              {customer.document_number}
            </Col>

            <Col
              palm={12}
              tablet={6}
              desk={4}
              tv={4}
              className={style.propertyCustom}
            >
              {customer.birthday}
            </Col>

            <Col
              palm={12}
              tablet={6}
              desk={4}
              tv={4}
              className={style.propertyCustom}
            >
              {customer.phone}
            </Col>

            <Col
              palm={12}
              tablet={6}
              desk={4}
              tv={4}
              className={style.propertyCustom}
            >
              {customer.email}
            </Col>

            <Col
              palm={12}
              tablet={6}
              desk={8}
              tv={8}
              className={style.propertyCustom}
            >
              {customer.street}
            </Col>

            <Col
              palm={12}
              tablet={6}
              desk={1}
              tv={1}
              className={style.propertyCustom}
            >
              {customer.street_number}
            </Col>

            <Col
              palm={12}
              tablet={6}
              desk={3}
              tv={3}
              className={style.propertyCustom}
            >
              {customer.complementary}
            </Col>

            <Col
              palm={12}
              tablet={6}
              desk={4}
              tv={4}
              className={style.propertyCustom}
            >
              {customer.neighborhood}
            </Col>

            <Col
              palm={12}
              tablet={6}
              desk={4}
              tv={4}
              className={style.propertyCustom}
            >
              {customer.city}
            </Col>

            <Col
              palm={12}
              tablet={6}
              desk={1}
              tv={1}
              className={style.propertyCustom}
            >
              {customer.state}
            </Col>

            <Col
              palm={12}
              tablet={6}
              desk={3}
              tv={3}
              className={style.propertyCustom}
            >
              {customer.zipcode}
            </Col>
          </Row>
        </Grid>
      </CardContent>
    </Card>
  )
}

const shape = {
  birthday: PropTypes.string,
  city: PropTypes.string,
  complementary: PropTypes.string,
  document_number: PropTypes.string,
  email: PropTypes.node,
  name: PropTypes.string,
  neighborhood: PropTypes.string,
  phone: PropTypes.string,
  state: PropTypes.string,
  street: PropTypes.string,
  street_number: PropTypes.string,
  zipcode: PropTypes.string,
}

CustomerCard.propTypes = {
  contents: PropTypes.shape(shape).isRequired,
  labels: PropTypes.shape(shape).isRequired,
  title: PropTypes.string.isRequired,
}

export default CustomerCard
