import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/plus-jakarta-sans'
import 'lenis/dist/lenis.css'
import './styles/base.css'
import './styles/sections.css'
import './styles/studio.css'
import './styles/mdv.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
