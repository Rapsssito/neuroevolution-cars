class Ball {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
    }

    display(special = false) {
        noFill();
        if (special) stroke(200, 0, 0, 100);
        else stroke(0);
        strokeWeight(5);
        ellipse(this.x, this.y, this.size);
    }
}
