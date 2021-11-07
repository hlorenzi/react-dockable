/// <reference types="react" />
import { Rect } from "./rect.js";
export declare type PanelId = number;
export declare type ContentId = number;
export declare type ContentElement = JSX.Element;
export interface State {
    idNext: number;
    rootPanel: Panel;
    floatingPanels: Panel[];
    activePanel: Panel | null;
    draggedPanel: Panel | null;
    showAnchors: boolean;
    previewAnchor: Anchor | null;
}
export declare enum SplitMode {
    LeftRight = 0,
    TopBottom = 1
}
export declare enum DockMode {
    Full = 0,
    Left = 1,
    Right = 2,
    Top = 3,
    Bottom = 4
}
export interface Panel {
    id: PanelId;
    floating: boolean;
    rect: Rect;
    contentList: Content[];
    currentTabIndex: number;
    splitPanels: Panel[];
    splitMode: SplitMode;
    splitSize: number;
    preferredWidth: number;
    preferredHeight: number;
    ephemeral: boolean;
}
export interface Content {
    contentId: ContentId;
    title: string;
    element: JSX.Element;
}
export interface Divider {
    panel: Panel;
    vertical: boolean;
    rect: Rect;
    resizeMin: number;
    resizeMax: number;
}
export interface Anchor {
    panel: Panel;
    x: number;
    y: number;
    mode: DockMode;
    previewRect: Rect;
}
export interface Layout {
    panelRects: LayoutPanel[];
    content: LayoutContent[];
    dividers: Divider[];
    anchors: Anchor[];
}
export interface LayoutPanel {
    panel: Panel;
    rect: Rect;
    floating: boolean;
    zIndex: number;
}
export interface LayoutContent {
    content: Content;
    tabIndex: number;
    panel: Panel;
    layoutPanel: LayoutPanel;
}
export declare function makeState(): State;
export declare function makePanel(state: State): Panel;
export declare function createDockedPanel(state: State, dockIntoPanel: Panel, mode: DockMode, content: ContentElement): Panel;
export declare function detachPanel(state: State, panel: Panel): void;
export declare function addNewContent(state: State, toPanel: Panel, element: ContentElement): void;
export declare function addContent(state: State, toPanel: Panel, content: Content): void;
export declare function removeContent(state: State, fromPanel: Panel, contentId: ContentId): void;
export declare function removeEphemerals(state: State): void;
export declare function removeEphemeralsRecursive(state: State, fromPanel: Panel): void;
export declare function coallesceEmptyPanels(state: State): void;
export declare function coallesceEmptyPanelsRecursive(state: State, fromPanel: Panel): void;
export declare function dock(state: State, panel: Panel, dockIntoPanel: Panel, mode: DockMode): void;
export declare function setPanelActiveAndBringToFront(state: State, panel: Panel): void;
export declare function clampFloatingPanels(state: State, rect: Rect): void;
export declare function clampFloatingPanelStrictly(state: State, panel: Panel, rect: Rect): void;
export declare function traverseLayout(panel: Panel, rect: Rect, layout: Layout): void;
export declare function getLayout(state: State, rect: Rect): Layout;
export declare function getContentRect(state: State, rect: Rect, contentId: ContentId): Rect | undefined;
