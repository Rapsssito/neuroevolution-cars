class Food {
    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number} value 
     * @param {number} size 
     */
    constructor(x, y, value = 1, size = 20) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.size = size;
        this.eaten = false;
    }

    display() {
        if (this.eaten) return;
        fill(255, 255, 0);
        noStroke();
        square(this.x - this.size / 2, this.y - this.size / 2, this.size);
    }
}
