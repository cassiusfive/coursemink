import { faGithub, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const LaunchApp = () => {
    return (
        <a href="/schedule/form">
            <button className="w-fit rounded-lg bg-[#BF3B53] px-3 py-2 text-xl text-white hover:bg-[#962e41]">
                Launch App
            </button>
        </a>
    );
};

const Home = () => {
    return (
        <>
            <section className="mx-auto my-12 flex w-10/12 flex-col-reverse items-center justify-between lg:flex-row">
                <div className="my-auto flex grow justify-center gap-6">
                    <div className="flex flex-col gap-4">
                        <b className=" max-w-96 text-5xl">
                            Get the most out of your term
                        </b>
                        <span className="max-w-96 text-xl text-stone-500">
                            Tailor a schedule that empowers you to excel, with
                            Course Mink.
                        </span>
                        <LaunchApp />
                    </div>
                </div>
                <img
                    className="aspect-square max-h-96 max-w-96 grow self-center"
                    src={"/mink-working.jpeg"}
                    alt=""
                />
            </section>
            <section className="mx-auto flex w-full bg-stone-100">
                <div className="mx-auto flex w-9/12 flex-col items-start gap-4 py-14">
                    <div className="flex items-center gap-6">
                        <b className="text-4xl">About</b>
                        <a href="https://github.com/cassiusfive/Mink">
                            <FontAwesomeIcon
                                className="text-3xl"
                                icon={faGithub}
                            />
                        </a>
                    </div>
                    <div className="h-0.5 w-full bg-stone-500"></div>
                    <div className="items-start text-xl">
                        Course Mink is a student-oriented class scheduling tool
                        designed to streamline the course registration process.
                        Simplify provide the classes you plan to take along with
                        your preferences, and Course Mink will curate schedules
                        tailored to your needs.
                    </div>
                    <div className="mt-10 flex items-center">
                        <b className="text-4xl">Contact Me</b>
                    </div>
                    <div className="h-0.5 w-full bg-stone-500"></div>
                    <div className="text-xl">
                        <div className="text-xl">
                            <FontAwesomeIcon
                                icon={faEnvelope}
                                className=" mr-1 align-middle"
                            />{" "}
                            <a
                                href="mailto:villarec@oregonstate.edu"
                                className=" text-blue-500 underline "
                            >
                                villarec@oregonstate.edu
                            </a>
                            <br />
                            <FontAwesomeIcon
                                icon={faInstagram}
                                className=" mr-1 align-middle"
                            />{" "}
                            <a
                                href="https://www.instagram.com/cassius4.0/"
                                className="text-blue-500 underline"
                            >
                                cassius4.0
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};
export default Home;
