import React from "react";
import ReactDOM from "react-dom/client";
import {
    createBrowserRouter,
    Navigate,
    RouterProvider,
} from "react-router-dom";

import ScheduleForm from "./pages/ScheduleForm";
import ScheduleTool from "./pages/ScheduleTool";
import HomePage from "./pages/Home";

const router = createBrowserRouter([
    {
        path: "/",
        index: true,
        element: <HomePage />,
    },
    {
        path: "schedule/form",
        element: <ScheduleForm />,
        errorElement: <></>,
    },
    {
        path: "schedule/tool",
        element: <ScheduleTool />,
        errorElement: <></>,
    },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);
