import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import ScheduleForm from "./pages/ScheduleForm";
import ScheduleTool from "./pages/ScheduleTool";
import HomePage from "./pages/Home";
import ErrorBoundary from "./pages/ErrorBoundary";

const router = createBrowserRouter([
    {
        path: "/",
        index: true,
        element: <HomePage />,
    },
    {
        path: "schedule/form",
        element: <ScheduleForm />,
        errorElement: <ErrorBoundary title="No schedules found :(" />,
    },
    {
        path: "schedule/tool",
        element: <ScheduleTool />,
        errorElement: <ErrorBoundary title="Oops! Something Broke" />,
    },
    {
        path: "*",
        element: <ErrorBoundary title="404: Page Not Found" />,
    },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);
