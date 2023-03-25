import React from 'react'
import ReactDOM from 'react-dom/client'

import {
    createBrowserRouter,
    RouterProvider,
} from 'react-router-dom';

import Root, {
    loader as rootLoader, 
} from "./components/Root";

import MonthView, {
    loader as monthLoader,
} from "./components/MonthView";

import './index.css'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        loader: rootLoader,
    },
    {
        path: "/:month/:year",
        element: <MonthView />,
        loader: monthLoader,
    },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
