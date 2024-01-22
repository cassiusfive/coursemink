import { useState } from "react";
import { Course } from "../shared.types";

import CourseSearch from "../components/CourseSearch";
import CourseList from "../components/CourseList";

const Scheduler = () => {
	const [chosenCourses, setChosenCourses] = useState<Course[]>([]);

	return <>
		<CourseSearch courses={chosenCourses} setCourses={setChosenCourses}/>
		<p></p>
		<CourseList courses={chosenCourses} setCourses={setChosenCourses}/>
	</>
}

export default Scheduler;