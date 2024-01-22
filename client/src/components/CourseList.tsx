import { Course } from "../shared.types";

interface CourseListProps {
	courses: Course[];
	setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
};

const CourseList = ({ courses, setCourses }: CourseListProps) => {
	function removeCourse(courseId: number) {
		const index = courses.findIndex((course) => course.id == courseId);
		console.log(index);
		setCourses([...courses.slice(0, index), ...courses.slice(index + 1)]);
	}

	return <div>
		{courses.map((course) => (
			<li key={course.id} className="card">
				<div onClick={() => removeCourse(course.id!)}>
					{course.code} - {course.title}
				</div>
			</li>
		))}
	</div>
}

export default CourseList;