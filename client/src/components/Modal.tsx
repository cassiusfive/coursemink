import { PropsWithChildren, useEffect } from "react";
import { clearAllBodyScrollLocks, disableBodyScroll } from "body-scroll-lock";

const Modal = (props: PropsWithChildren) => {
    useEffect(() => {
        disableBodyScroll(document.getElementById("modal")!);

        return () => {
            clearAllBodyScrollLocks();
        };
    });
    return (
        <div
            className="fixed top-0 z-[40] flex h-dvh w-dvw items-center justify-center bg-stone-800/80 transition duration-200"
            id="modal"
        >
            {props.children}
        </div>
    );
};
export default Modal;
