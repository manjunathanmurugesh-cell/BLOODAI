import { useEffect } from "react";

// Each original HTML file had its own <title>; this keeps that behaviour.
export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
