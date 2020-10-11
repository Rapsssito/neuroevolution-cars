class Obstacle {
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} size
     */
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
    }

    display() {
        fill(0);
        stroke(0);
        strokeWeight(5);
        ellipse(this.x, this.y, this.size);
    }
}
