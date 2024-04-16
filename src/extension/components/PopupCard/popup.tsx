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
import { DependencyNode } from "../../utils/Dependency";

interface PopupProps {
  analysis: string;
  type: string;
  filename: string;
  relatedNodes: DependencyNode[];
}

const createNodeMessage = (node: DependencyNode) => {
  const url = node.getLineUrl();
  if (!url) return `${node.filepath}:${node.line}`;
  return (
    <a href={url}>
      {node.filepath}:{node.line}
    </a>
  );
};

export default function Popup({ analysis, type, filename, relatedNodes }: PopupProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    placement: "right",
    middleware: [offset(10), flip()],
    whileElementsMounted: autoUpdate,
    open: isOpen,
    onOpenChange: setIsOpen
  });

  floatingStyles.zIndex = 9999;

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
        <div id="popup-content" ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()}>
          Found {analysis} ({type}) conflict.
          <br />
          <b>Related nodes:</b>
          <br />
          {relatedNodes.map((node) => (
            <span key={node.filepath + node.line}>{createNodeMessage(node)}</span>
          ))}
        </div>
      )}
    </>
  );
}
