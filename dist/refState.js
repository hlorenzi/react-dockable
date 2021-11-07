import * as React from "react";
export function useRefState(initializer) {
    const [updateToken, setUpdateToken] = React.useState(0);
    const ref = React.useRef(null);
    if (ref.current === null)
        ref.current = initializer();
    return {
        ref,
        updateToken,
        commit: () => setUpdateToken(n => (n + 1) % 1000000)
    };
}
//# sourceMappingURL=refState.js.map