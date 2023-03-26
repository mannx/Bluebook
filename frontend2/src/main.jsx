import React from 'react'
import ReactDOM from 'react-dom/client'

import {
    createBrowserRouter,
    RouterProvider,
} from 'react-router-dom';

import ErrorPage from "./components/ErrorPage";

import Root from "./components/Root";

import MonthView, {
    loader as monthLoader,
    today as monthTodayLoader,
} from "./components/Month/MonthView";

import './index.css'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: "/:month/:year",
                element: <MonthView />,
                loader: monthLoader,
            },
            {
                path: "/today",
                loader: monthTodayLoader,
            }, 
        ],
    },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
