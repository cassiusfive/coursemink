import React, { useEffect, useState, useRef } from "react"
import { Course } from "../shared.types"
import Fuse from "fuse.js"

const testCourses: Course[] = [
	{
		id: 1,
		title: 'VECTOR CALCULUS I',
		code: 'MTH 254'
	},
	{
		id: 2,
		title: 'WEIGHT TRAINING I',
		code: 'PAC 287'
	},
	{
		id: 3,
		title: '*INTRODUCTION TO THE VISUAL ARTS',
		code: 'ART 101'
	}
]

interface CourseSearchProps {
	courses: Course[],
	setCourses: React.Dispatch<React.SetStateAction<Course[]>>
}

const CourseSearch = ({courses, setCourses}: CourseSearchProps) => {
	let isInit = false;
	let availableCourses = useRef<Course[]>([]);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [showDropdown, setShowDropdown] = useState<boolean>(false);

	useEffect(() => {
		const fetchCourses = async () => {
			const data = await fetch('http://localhost:3000/courses');
			const courses: Course[] = await data.json();
			
			availableCourses.current = courses;
		}

		if (!isInit) {
			fetchCourses()
				.catch(console.error);
			isInit = true;
		}
	}, []);

	function addCourse(course: Course): void {
		setCourses([...courses, course]);
		setSearchQuery("");
	}

	const fuse = new Fuse(availableCourses.current, {
		keys: [
			'title',
			'code'
		],
	})
	const fuseResults = fuse.search(searchQuery);
	fuseResults.filter((course) => {
		return course.item.id;
	})
	const searchResult = fuseResults.slice(0, 10).map((result) => (result.item)).filter((course) => (!courses.includes(course)));

	return <>
		<input type="text" value={searchQuery} 
			onChange={(e) => {setSearchQuery(e.target.value)}} 
			onFocus={() => {setShowDropdown(true)}}
			onBlur={() => {setShowDropdown(false)}}
		/>
		{showDropdown && searchQuery.trimStart().length > 0 && 
			searchResult.slice(0, 5).map((course) => (
				<div key={course.id} onMouseDown={() => addCourse(course)}> + {course.code} - {course.title}</div>
			))
		}
	</>
}

export default CourseSearch;