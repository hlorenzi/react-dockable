import * as React from "react";
import * as Dockable from "./index.js";
export declare function useDockable(init?: (state: Dockable.State) => void): Dockable.RefState<Dockable.State>;
interface MousePos {
    x: number;
    y: number;
}
export declare const mousePos: MousePos;
export declare function spawnFloating(state: Dockable.RefState<Dockable.State>, elem: JSX.Element): Dockable.Panel;
export declare function spawnFloatingEphemeral(state: Dockable.RefState<Dockable.State>, elem: JSX.Element): Dockable.Panel;
export interface ContentContextProps {
    layoutContent: Dockable.LayoutContent;
    setTitle: (title: string) => void;
    setPreferredSize: (w: number, h: number) => void;
}
export declare const ContentContext: React.Context<Dockable.ContentContextProps>;
export declare function useContentContext(): ContentContextProps;
export {};
