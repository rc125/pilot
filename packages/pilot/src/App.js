import React from 'react'
import { ThemeProvider } from 'former-kit'
import theme from 'former-kit-skin-pagarme'
import { HashRouter } from 'react-router-dom'
import { Provider as StateProvider } from 'react-redux'

import store from './configureStore'
import Root from './pages/Root'

const App = () => (
  <ThemeProvider theme={theme}>
    <StateProvider store={store}>
      <HashRouter>
        <Root />
      </HashRouter>
    </StateProvider>
  </ThemeProvider>
)

export { store }

export default App
