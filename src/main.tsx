import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './temas/apariencia-grilla'
import './temas/number-box'
import './utils/clic-fila'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
