import React from 'react'
import { ThemeProvider } from 'former-kit'
import theme from 'former-kit-skin-pagarme'
import { Provider as StateProvider } from 'react-redux'
import HashRouterWithPrompt from './HashRouterWithPrompt'

import store from './configureStore'
import Root from './pages/Root'

const App = () => (
  <ThemeProvider theme={theme}>
    <StateProvider store={store}>
      <HashRouterWithPrompt>
        <Root />
      </HashRouterWithPrompt>
    </StateProvider>
  </ThemeProvider>
)

export { store }

export default App
