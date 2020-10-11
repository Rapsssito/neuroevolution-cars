const N_WATCHERS = 6;

class Car {
    /**
     * @param {number} size 
     * @param {number} x 
     * @param {number} y 
     * @param {number} maxForce 
     * @param {number} maxSpeed 
     * @param {number} visionRadius 
     * @param {NeuralNetwork} brain 
     */
    constructor(size, x, y, maxForce, maxSpeed, visionRadius, brain) {
        this.size = size;
        this.originalX = x;
        this.originalY = y;
        this.position = createVector(x, y);
        this.velocity = createVector(maxSpeed, 0);
        this.acceleration = createVector(0, 0);
        this.maxForce = maxForce;
        this.maxSpeed = maxSpeed;
        this.visionRadius = visionRadius;
        this.brain = brain === undefined ? new NeuralNetwork(2 + N_WATCHERS, 32, 3) : brain;
        this.score = 0;
        this.foods = [];
        this.visionLines = [];
    }

    /**
     * @param {Car} other 
     * @returns {Car}
     */
    crossover(other) {
        const newBrain = this.brain.crossover(other.brain);
        return new Car(
            this.size,
            this.originalX,
            this.originalY,
            this.maxForce,
            this.maxSpeed,
            this.visionRadius,
            newBrain
        );
    }

    /**
     * @returns {Car}
     */
    getChild() {
        return new Car(
            this.size,
            this.originalX,
            this.originalY,
            this.maxForce,
            this.maxSpeed,
            this.visionRadius,
            this.brain.copy()
        );
    }

    /**
     * @param {number} otherX 
     * @param {number} otherY 
     * 
     * @returns {number}
     */
    distance(otherX, otherY) {
        return dist(this.position.x, this.position.y, otherX, otherY) - this.size / 2;
    }

    /**
     * @param {number} rate 
     */
    mutate(rate) {
        this.brain.mutate(rate);
    }

    dispose() {
        this.brain.dispose();
    }

    /**
     * @param {Obstacle[]} obstacles 
     */
    update(obstacles) {
        this.think(obstacles);
        this.move();
    }

    /**
     * @param {Obstacle[]} obstacles 
     */
    think(obstacles) {
        const watchers = this.watch(obstacles);
        const inputs = [];
        const normVelocity = this.velocity.copy().normalize();
        inputs[0] = normVelocity.x;
        inputs[1] = normVelocity.y;
        inputs.push(...watchers);
        const output = this.brain.predict(inputs);
        const decision = output.argMax(1).dataSync()[0];
        switch (decision) {
            case 0:
                // Move right
                this.right();
                break;
            case 1:
                // Move left
                this.left();
                break;
            case 2:
                // Do nothing
                break;
            default:
                throw new Error('BAD DECISION');
        }
    }

    /**
     * @param {Obstacle[]} obstacles 
     * 
     * @returns {number[]}
     */
    watch(obstacles) {
        this.visionLines = [];

        const watchers = new Array(N_WATCHERS).fill(1);
        for (const b of obstacles) {
            const distance = this.distance(b.x, b.y) - b.size / 2;
            if (distance > this.visionRadius) continue;
            const normalLine = createVector(b.x - this.position.x, b.y - this.position.y);
            const angle = this.velocity.angleBetween(normalLine);
            if (Math.abs(angle) > HALF_PI) continue;
            const watcherIndex = Math.round(map(angle, -HALF_PI, HALF_PI, 0, watchers.length - 1));
            watchers[watcherIndex] = Math.min(
                watchers[watcherIndex],
                map(distance, 0, this.visionRadius, -1, 1)
            );
            this.visionLines.push(normalLine);
        }
        return watchers;
    }

    left() {
        const newForce = createVector(this.velocity.y, -this.velocity.x);
        newForce.setMag(this.maxForce);
        this.applyForce(newForce);
    }

    right() {
        const newForce = createVector(-this.velocity.y, this.velocity.x);
        newForce.setMag(this.maxForce);
        this.applyForce(newForce);
    }

    /**
     * @param {number} force
     */
    applyForce(force) {
        // TODO: mass
        this.acceleration.add(force);
    }

    move() {
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);
        this.acceleration.mult(0);
    }

    display(best) {
        if (best) stroke(255, 0, 0);
        else stroke(0);
        fill(255, 50);
        strokeWeight(5);
        ellipse(this.position.x, this.position.y, this.size, this.size);
        stroke(0, 100);
        strokeWeight(2);
        noFill();
        ellipse(this.position.x, this.position.y, this.visionRadius * 2);
        stroke(0, 0, 255);
        line(
            this.position.x,
            this.position.y,
            this.position.x + this.velocity.x * 10,
            this.position.y + this.velocity.y * 10
        );
        stroke(255, 0, 0, 100);
        for (const normalLine of this.visionLines) {
            line(
                this.position.x,
                this.position.y,
                this.position.x + normalLine.x,
                this.position.y + normalLine.y
            );
        }
    }
}
