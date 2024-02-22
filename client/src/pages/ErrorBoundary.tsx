type ErrorBoundaryProps = {
    title: string;
    description?: string;
};

const ErrorBoundary = ({ title, description }: ErrorBoundaryProps) => {
    return (
        <>
            <div className="my-10 text-center text-4xl">
                <b>{title}</b>
            </div>
            <img
                src="/real-mink.jpg"
                alt=""
                className="mx-auto my-10 aspect-auto w-10/12 max-w-4xl"
            />
            <div className="text-center">
                <a href="/">
                    <button className="w-fit rounded-lg bg-[#BF3B53] px-3 py-2 text-xl text-white hover:bg-[#962e41]">
                        Back to Home
                    </button>
                </a>
            </div>
        </>
    );
};
export default ErrorBoundary;
