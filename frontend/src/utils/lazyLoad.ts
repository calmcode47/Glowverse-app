import React, { lazy, type ComponentType } from "react";
import Loading from "../components/loading/Loading";

export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  // fallback is supplied where Suspense is used; kept for API compatibility
  _fallback: React.ReactNode = React.createElement(Loading)
): React.LazyExoticComponent<T> {
  return lazy(importFunc);
}
