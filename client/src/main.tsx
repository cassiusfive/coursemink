import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

import Scheduler from './pages/Scheduler';

const router = createBrowserRouter([
	{
		path: '/',
		index: true,
		element: <Navigate to='schedule'></Navigate>
	},
	{
		path: 'schedule',
		element: <Scheduler />,
	}
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);