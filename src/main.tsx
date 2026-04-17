import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import './i18n';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import 'sweetalert2/dist/sweetalert2.min.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
      // richColors
    />
  </StrictMode>,
)
