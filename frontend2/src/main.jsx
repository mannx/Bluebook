import React from 'react'
import ReactDOM from 'react-dom/client'

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

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

import DayEdit, {
    loader as dayEditLoader,
    action as dayEditAction,
} from "./components/Month/DayEdit";

import Tags  from "./components/Tags/Tags";

import Import, {
    loader as importLoader,
    action as importAction,
} from "./components/Import/Import";

import WeeklyNav from "./components/Weekly/WeeklyNav";
import Weekly, {
    loader as weeklyLoader,
    action as weeklyAction,
} from "./components/Weekly/Weekly";

import AUV from "./components/AUV/AUV";

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
            {
                path: "/tags/:tag?",
                element: <Tags />,
            },
            {
                // edit day information including comments/tags.
                // id is unused if date is provided
                // date format: YYYYMMDD
                path: "/edit/:id/:date?",
                element: <DayEdit />, 
                loader: dayEditLoader,
                action: dayEditAction,
            },
            {
                path: "/import",
                element: <Import />,
                loader: importLoader, 
                action: importAction,
            },
            {
                path: "/weekly",
                element: <WeeklyNav />,
                children: [
                    {
                        path: "/weekly/:day/:month/:year",
                        element: <Weekly />,
                        loader: weeklyLoader,
                        action: weeklyAction,
                    },
                ],
            },
            {
                path: "/auv",
                element: <AUV />,
            },
        ],
    },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
        <RouterProvider router={router} />
    </LocalizationProvider>
  </React.StrictMode>,
)
