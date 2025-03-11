import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PostHogProvider } from 'posthog-js/react'

const options = {
  api_host: 'https://us.i.posthog.com',
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PostHogProvider
      apiKey={'phc_dITUDVdq00LQdmnKc6rS1Pr5uxDRWnVqcTThNOb7Pvl'}
      options={options}>
    <App />
    </PostHogProvider>
  </StrictMode>,
)