import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import store from "./redux/store";
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom';
// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>
// );



createRoot(document.getElementById('root')).render(
  <StrictMode>
      <Provider store={store}>
        {/* <BrowserRouter basename={'/'}> */}
        <App />
        {/* </BrowserRouter> */}
      </Provider>
  </StrictMode>,
)
