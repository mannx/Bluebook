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

import Tags, {
    TagID,
    loader as tagLoader,
    idLoader as tagIdLoader,
} from "./components/Tags/Tags";

import Import, {
    loader as importLoader,
    action as importAction,
} from "./components/Import/Import";

import WeeklyNav from "./components/Weekly/WeeklyNav";
import Weekly, {
    loader as weeklyLoader,
    action as weeklyAction,
} from "./components/Weekly/Weekly";

import AUV, {
    AUVLayout, 
    loader as auvLoader,
    action as auvAction,
} from "./components/AUV/AUV";

import WasteView, {
    WasteTable,
    loader as wasteLoader,
    action as wasteAction,
} from "./components/Waste/Wastage";

import WasteInput,{
    loader as wasteInputLoader,
    action as wasteInputAction,
} from "./components/Waste/Input";

import WasteSettings, {
    WasteSettingsEdit,
    loader as wasteSettingsLoader,
    action as wasteSettingsAction,
    EditLoader as wasteSettingsEditLoader,
    EditAction as wasteSettingsEditAction,
} from "./components/Waste/Settings";

import Top5, {
    Top5Data,
    loader as top5Loader,
    dataLoader as top5DataLoader,
} from "./components/Top5/Top5";

import Settings, {
    loader as settingsLoader,
    action as settingsAction,
} from "./components/Settings/Settings";

import DebugSettings from "./components/Settings/Debug";
import CommentSearch, {
    loader as commentSearchLoader,
} from "./components/Search/CommentSearch";

import HockeySchedule, {
    action as hockeyAction,
} from "./components/Import/HockeySchedule";

import HockeyData, {
    loader as hockeyDataLoader,
} from "./components/Hockey/HockeyData";

import SimpleStats, {
    loader as statsAverageLoader,
} from './components/Stats/Stats';

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
                path: "/tags",
                element: <Tags />,
                loader: tagLoader,
                children: [
                    {
                        path: "/tags/:id",
                        element: <TagID />,
                        loader: tagIdLoader,
                    },
                ],
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
                children: [
                    {
                        path: "/auv/:month/:year",
                        element: <AUVLayout />,
                        loader: auvLoader,
                        action: auvAction,
                    },
                ],
            },
            {
                path: "/wastage",
                element: <WasteView />,
                children: [
                    {
                        path: "/wastage/:day/:month/:year",
                        element: <WasteTable />,
                        loader: wasteLoader,
                        action: wasteAction,
                    },
                ],
            },
            {
                path: "/waste/input",
                element: <WasteInput />,
                loader: wasteInputLoader,
                action: wasteInputAction,
            },
            {
                path: "/waste/settings",
                element: <WasteSettings />,
                loader: wasteSettingsLoader,
                action: wasteSettingsAction,
            },
            {
                path: "/waste/settings/:id",
                element: <WasteSettingsEdit />,
                loader: wasteSettingsEditLoader,
                action: wasteSettingsEditAction,
            },
            {
                path: "/top5",
                element: <Top5 />,
                loader: top5Loader,
                children: [
                    {
                        path: "/top5/:month/:year",
                        element: <Top5Data />,
                        loader: top5DataLoader,
                    },
                ],
            },
            {
                path: "/settings",
                element: <Settings />,
                loader: settingsLoader,
                action: settingsAction,
            },
            {
                path: "/debug",
                element: <DebugSettings />,
            },
            {
                path: "/search",
                element: <CommentSearch />,
                loader: commentSearchLoader,
            },
            {
                path: "/hockey",
                element: <HockeySchedule />,
                action: hockeyAction,
            },
            {
                path: "/hockey/data/:year?",
                element: <HockeyData />,
                loader: hockeyDataLoader, 
            },
            {
                path: "/stats/simple",
                element: <SimpleStats />,
                loader: statsAverageLoader,
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