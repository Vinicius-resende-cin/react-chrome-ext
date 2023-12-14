import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  useClick,
  useInteractions,
  useDismiss
} from "@floating-ui/react";
import { useState } from "react";

interface PopupProps {
  lineNumber: number;
  lineUrl: string;
  isSource: boolean;
}

export default function Popup({ lineNumber, lineUrl, isSource }: PopupProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    placement: "right",
    middleware: [offset(10), flip()],
    whileElementsMounted: autoUpdate,
    open: isOpen,
    onOpenChange: setIsOpen
  });

  const click = useClick(context);
  const dismiss = useDismiss(context, { escapeKey: false });

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

  return (
    <>
      <img
        className="cursor-pointer"
        ref={refs.setReference}
        {...getReferenceProps()}
        src={chrome.runtime.getURL("assets/alert-icon.png")}
        alt="alert"
        width={23}
        height={20}
      />

      {isOpen && (
        <div
          id="popup-content"
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}>
          This is the {isSource ? "source" : "sink"} for line&nbsp;
          <a href={`#${lineUrl}`}>{lineNumber}</a>
        </div>
      )}
    </>
  );
}
