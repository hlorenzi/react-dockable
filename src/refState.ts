import * as React from "react"


export interface RefState<T>
{
    ref: React.MutableRefObject<T>
    updateToken: number
    commit: () => void
}


export function useRefState<T>(initializer: () => T):  RefState<T>
{
    const [updateToken, setUpdateToken] = React.useState(0)

    const ref = React.useRef<T>(null!)
    if (ref.current === null)
        ref.current = initializer()

    return {
        ref,
        updateToken,
        commit: () => setUpdateToken(n => (n + 1) % 1000000)
    }
}