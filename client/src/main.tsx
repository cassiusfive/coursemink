import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

import ScheduleForm from './pages/ScheduleForm';
import ScheduleTool from './pages/ScheduleTool';

const router = createBrowserRouter([
	{
		path: '/',
		index: true,
		element: <Navigate to='schedule/form'></Navigate>
	},
	{
		path: 'schedule/form',
		element: <ScheduleForm />,
	},
	{
		path: 'schedule/tool',
		element: <ScheduleTool />,
	}
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);