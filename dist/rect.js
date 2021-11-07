export class Rect {
    x;
    y;
    w;
    h;
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    static fromVertices(x1, y1, x2, y2) {
        return new Rect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1));
    }
    static fromElement(elem) {
        const clientRect = elem.getBoundingClientRect();
        return new Rect(clientRect.left, clientRect.top, clientRect.width, clientRect.height);
    }
    clone() {
        return new Rect(this.x, this.y, this.w, this.h);
    }
    get x1() {
        return this.x;
    }
    get y1() {
        return this.y;
    }
    get x2() {
        return this.x + this.w;
    }
    get y2() {
        return this.y + this.h;
    }
    get xCenter() {
        return (this.x1 + this.x2) / 2;
    }
    get yCenter() {
        return (this.y1 + this.y2) / 2;
    }
    withX(value) {
        return new Rect(value, this.y, this.w, this.h);
    }
    withY(value) {
        return new Rect(this.x, value, this.w, this.h);
    }
    withW(value) {
        return new Rect(this.x, this.y, value, this.h);
    }
    withH(value) {
        return new Rect(this.x, this.y, this.w, value);
    }
    withX1(value) {
        return Rect.fromVertices(value, this.y1, this.x2, this.y2);
    }
    withY1(value) {
        return Rect.fromVertices(this.x1, value, this.x2, this.y2);
    }
    withX2(value) {
        return Rect.fromVertices(this.x1, this.y1, value, this.y2);
    }
    withY2(value) {
        return Rect.fromVertices(this.x1, this.y1, this.x2, value);
    }
    displace(x, y) {
        return new Rect(this.x + x, this.y + y, this.w, this.h);
    }
    expand(amount) {
        return Rect.fromVertices(this.x1 - amount, this.y1 - amount, this.x2 + amount, this.y2 + amount);
    }
    expandW(amount) {
        return Rect.fromVertices(this.x1 - amount, this.y1, this.x2 + amount, this.y2);
    }
    contains(p) {
        return p.x >= this.x &&
            p.x < this.x2 &&
            p.y >= this.y &&
            p.y < this.y2;
    }
    overlaps(other) {
        return this.x2 >= other.x &&
            this.x < other.x2 &&
            this.y2 >= other.y &&
            this.y < other.y2;
    }
}
//# sourceMappingURL=rect.js.map