import { AppProps } from 'next/app'
import { AppCacheProvider } from '@mui/material-nextjs/v16-pagesRouter'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { theme } from '../lib/theme'

export default function MyApp(props: AppProps) {
  const { Component, pageProps } = props

  return (
    <AppCacheProvider {...props}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </AppCacheProvider>
  )
}
