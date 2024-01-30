import { ReactNode } from "react";

interface FormWrapperProps {
    title: string;
    children: ReactNode;
}

const FormWrapper = ({ title, children }: FormWrapperProps) => {
    return (
        <div className="p-10">
            <h1 className="p-5 text-center text-3xl font-bold">{title}</h1>
            <div className="flex justify-center">{children}</div>
        </div>
    );
};

export default FormWrapper;
