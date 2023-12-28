import { WeeklyCalendar } from "./WeeklyCalendar"
import { Section } from "./shared.types"

const sections: Record<string, Record<string, Section[]>> = {
	'MTH 254': {},
	'ENGR 100': {}
}

function App() {
	return (<>
		<WeeklyCalendar sections={sections}></WeeklyCalendar>
	</>)
}

export default App
