import { PropsWithChildren } from "react";

const Modal = (props: PropsWithChildren) => {
    return (
        <div className="fixed top-0 z-[40] h-dvh w-dvw backdrop-blur-sm transition duration-200">
            {props.children}
        </div>
    );
};
export default Modal;
