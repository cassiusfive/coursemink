import { PropsWithChildren } from "react";

const Modal = (props: PropsWithChildren) => {
    return (
        <div className="fixed top-0 z-[40] flex h-dvh w-dvw items-center justify-center bg-stone-800/80 transition duration-200">
            {props.children}
        </div>
    );
};
export default Modal;
