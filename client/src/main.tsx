import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
	{
		path: '/schedule',
		element: <Navigate to='/add' replace />,
		children: [
			{
				path: '/add',
				element: <h1>ADD</h1>
			},
			{
				path: '/results',
				element: <h1>RESULTS</h1>
			}
		]
	}
])

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);