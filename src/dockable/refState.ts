import React from "react"


export interface RefState<T>
{
    ref: React.MutableRefObject<T>
    update: number
    commit: () => void
}


export function useRefState<T>(initializer: () => T):  RefState<T>
{
    const [update, setUpdate] = React.useState(0)

    const ref = React.useRef<T>(null!)
    if (ref.current === null)
        ref.current = initializer()

    return {
        ref,
        update,
        commit: () => setUpdate(n => (n + 1) % 10000)
    }
}