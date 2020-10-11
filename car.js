const N_WATCHERS = 6;

class Car {
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
        // DEBUG
        this.normalLines = [];
    }

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

    distance(otherX, otherY) {
        return dist(this.position.x, this.position.y, otherX, otherY) - this.size / 2;
    }

    mutate(rate) {
        this.brain.mutate(rate);
    }

    dispose() {
        this.brain.dispose();
    }

    update(obstacles) {
        this.think(obstacles);
        this.move();
    }

    seek() {
        // DEBUG
        const target = createVector(mouseX, mouseY);
        const desired = target.sub(this.position); // A vector pointing from the position to the target
        // Scale to maximum speed
        desired.setMag(this.maxSpeed);
        // Steering = Desired minus velocity
        const steer = desired.sub(this.velocity);
        steer.limit(this.maxForce); // Limit to maximum steering force
        this.applyForce(steer);
    }

    think(obstacles) {
        // this.seek();
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
                this.right();
                break;
            case 1:
                // this.right();
                this.left();
                break;
            case 2:
                // Do nothing
                break;
            default:
                throw new Error('BAD DECISION');
        }
    }

    watch(obstacles) {
        // DEBUG
        this.normalLines = [];

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
            // console.log(watchers);
            // console.log((angle * 180) / PI);
            this.normalLines.push(normalLine);
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
        for (const normalLine of this.normalLines) {
            line(
                this.position.x,
                this.position.y,
                this.position.x + normalLine.x,
                this.position.y + normalLine.y
            );
        }
    }
}
