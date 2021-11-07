import * as React from "react";
export interface RefState<T> {
    ref: React.MutableRefObject<T>;
    updateToken: number;
    commit: () => void;
}
export declare function useRefState<T>(initializer: () => T): RefState<T>;
