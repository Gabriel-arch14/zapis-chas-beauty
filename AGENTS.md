# Project Rules

- The router's `defaultErrorComponent` must be a `React.lazy`-wrapped component typed with `ErrorComponentProps` from `@tanstack/react-router` (treat `error` as `unknown` and narrow before reading `.message`), because TanStack Start's typecheck rejects a plain function component. Why: `defaultErrorComponent` is typed as `LazyExoticComponent<(props: ErrorComponentProps) => any>`, so a plain function fails the build.
