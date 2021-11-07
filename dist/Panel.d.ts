import * as React from "react";
import * as Dockable from "./index.js";
export declare function ContainerPanel(props: {
    state: Dockable.RefState<Dockable.State>;
    panelRect: Dockable.LayoutPanel;
    tabHeight: number;
    onClickPanel: () => void;
    onClickTab: (tabNumber: number) => void;
    onCloseTab: (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>, tabNumber: number) => void;
    onDragHeader: (ev: React.MouseEvent<HTMLDivElement, MouseEvent>, tabNumber: number | null) => void;
}): JSX.Element;
