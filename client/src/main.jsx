import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './styles/variables.css'
import './styles/global.css'
import './styles/components/nav.css'
import './styles/components/search.css'
import './styles/components/home.css'
import './styles/components/category.css'
import './styles/components/about.css'
import './styles/components/links.css'
import './styles/components/chip.css'
import './styles/components/footer.css'
import './styles/components/common.css'
import './styles/components/article-detail.css'
import './styles/components/loading.css'
import './styles/components/comments.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
