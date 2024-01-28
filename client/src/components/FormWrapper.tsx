import { ReactNode } from "react";

interface FormWrapperProps {
    title: string;
    children: ReactNode;
}

const FormWrapper = ({ title, children }: FormWrapperProps) => {
    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold text-center p-5">{title}</h1>
            <div>{children}</div>
        </div>
    );
};

export default FormWrapper;
