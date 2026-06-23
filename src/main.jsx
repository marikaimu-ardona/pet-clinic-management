import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Apply the saved theme before first paint to avoid a flash.
const storedTheme = localStorage.getItem('kp-theme')
const prefersDark =
  storedTheme === 'dark' ||
  (!storedTheme && window.matchMedia?.('(prefers-color-scheme: dark)').matches)
document.documentElement.classList.toggle('dark', prefersDark)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
