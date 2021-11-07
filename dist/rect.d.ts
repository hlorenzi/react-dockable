export declare class Rect {
    x: number;
    y: number;
    w: number;
    h: number;
    constructor(x: number, y: number, w: number, h: number);
    static fromVertices(x1: number, y1: number, x2: number, y2: number): Rect;
    static fromElement(elem: HTMLElement): Rect;
    clone(): Rect;
    get x1(): number;
    get y1(): number;
    get x2(): number;
    get y2(): number;
    get xCenter(): number;
    get yCenter(): number;
    withX(value: number): Rect;
    withY(value: number): Rect;
    withW(value: number): Rect;
    withH(value: number): Rect;
    withX1(value: number): Rect;
    withY1(value: number): Rect;
    withX2(value: number): Rect;
    withY2(value: number): Rect;
    displace(x: number, y: number): Rect;
    expand(amount: number): Rect;
    expandW(amount: number): Rect;
    contains(p: {
        x: number;
        y: number;
    }): boolean;
    overlaps(other: Rect): boolean;
}
