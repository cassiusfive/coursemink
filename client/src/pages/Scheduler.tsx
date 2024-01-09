import React from 'react';
import { Route, Routes } from 'react-router-dom';

export default class Scheduler extends React.Component {
	state = {
		courses: []
	}
	
	render() {
		return (
			<Routes>
				<Route path='/add' element={<h1>add course</h1>} />
				<Route path='/milk' element={<h1>Hello</h1>} />
			</Routes>
		);
	}
}