import React from 'react'
import PropTypes from 'prop-types'

import {
  Card,
  CardContent,
  Col,
  Grid,
  Row,
} from 'former-kit'
import classNames from 'classnames'

import Logo from '../../pages/logo.svg'
import SelfRegisterContainer from './SelfRegisterContainer'
import style from './style.css'

const SelfRegisterWaiting = ({
  registerData,
  onRedirectToHome,
  step,
  t,
}) => (
  <div className={style.fullScreen}>
    <Grid className={style.blankCard}>
      <Row className={style.contentRowWaitingPage}>
        <Col tv={12} desk={12} tablet={12} palm={12} className={style.columnPadding}>
          <Card className={style.stretchVertically}>
            <CardContent className={style.stretchVertically}>
              <Grid fullHeight>
                <Row stretch className={style.stretchVertically}>
                  <Col tv={3} desk={3} tablet={3} palm={3} />

                  <Col
                    align="center"
                    className={classNames(style.stretchVertically, style.noPaddingBottom)}
                    desk={6}
                    palm={6}
                    tablet={6}
                    tv={6}
                  >
                    <Logo className={style.logo} width={140} />
                    <div className={classNames(style.growContent, style.centerContent)}>
                      <SelfRegisterContainer
                        registerData={registerData}
                        onRedirectToHome={onRedirectToHome}
                        step={step}
                        t={t}
                      />
                    </div>
                  </Col>

                  <Col tv={3} desk={3} tablet={3} palm={3} />
                </Row>
              </Grid>
            </CardContent>
          </Card>
        </Col>
      </Row>
    </Grid>
  </div>
)

SelfRegisterWaiting.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  registerData: PropTypes.object,
  onRedirectToHome: PropTypes.func.isRequired,
  step: PropTypes.oneOf([
    'waiting-creating',
    'refused-account',
  ]).isRequired,
  t: PropTypes.func.isRequired,
}

SelfRegisterWaiting.defaultProps = {
  registerData: {},
}

export default SelfRegisterWaiting
