const TOTAL_POPULATION = 20;
const TOTAL_FOOD = 30;
const OBSTACLE_RATIO = 0.12;
const CAR_SIZE = 30;
const BALL_SIZE = 50;
const FOOD_SIZE = 10;
const FOOD_VALUE = 10;
const WIDTH = 600;
const HEIGHT = 600;

let generation = 0;
let spawnPoint;
/** @type {Car[]} */
let cars = [];
/** @type {Car[]} */
let aliveCars = [];
let balls = [];
const limits = [];
let timer = 0;

let foodHasBeenEaten = false;
let bestSpan = null;
let onlyDisplayBest = false;

tf.setBackend('cpu');

function setup() {
    createCanvas(WIDTH, HEIGHT);
    spawnPoint = new Ball(WIDTH / 2, HEIGHT / 2, BALL_SIZE * 2);
    for (let i = 0; i < TOTAL_POPULATION; i++) {
        const car = new Car(CAR_SIZE, WIDTH / 2, HEIGHT / 2, 0.5, 4, 120);
        cars.push(car);
    }
    const generationButton = createButton('New');
    const clearButton = createButton('Clear');
    const onlyBestButton = createButton('Watch Only Best');
    generationButton.mousePressed(generateGeneration);
    clearButton.mousePressed(clearBalls);
    onlyBestButton.mousePressed(() => {
        onlyDisplayBest = !onlyDisplayBest;
        return false;
    });
    bestSpan = createSpan();
    aliveCars = cars;
    // Generate limits
    generateLimits();
    // Random balls
    generateRandomBalls();
    // Food
    generateFood();
    balls.push(...limits);
    textSize(width / 3);
}

function draw() {
    background(100);
    // Logic
    aliveCars.forEach((car) => car.update(balls));
    aliveCars.forEach((car) => {
        for (const ball of balls) {
            if (car.distance(ball.x, ball.y) < ball.size / 2) {
                car.dead = true;
                return;
            }
        }
        for (const food of car.foods) {
            if (!food.eaten && car.distance(food.x, food.y) < food.size) {
                car.score += food.value;
                food.eaten = true;
                foodHasBeenEaten = true;
                timer = 0;
            }
        }
    });
    aliveCars = aliveCars.filter((car) => !car.dead);
    if (aliveCars.length === 0 || timer > 100) {
        generateGeneration();
        return;
    }
    // Display
    const bestCar = [...cars].sort((a, b) => b.score - a.score)[0];
    spawnPoint.display(true);
    aliveCars.forEach((car) => {
        if (onlyDisplayBest && !bestCar.dead && car !== bestCar) return;
        car.display(car === bestCar);
    });
    balls.forEach((b) => b.display());
    bestCar.foods.forEach((f) => f.display());
    bestSpan.html('Best: ' + bestCar.score);
    if (!foodHasBeenEaten) timer++;
    foodHasBeenEaten = false;
}

function clearBalls() {
    balls = [...limits];
}

function mousePressed() {
    balls.push(new Ball(mouseX, mouseY, BALL_SIZE));
    // Prevent default
    return false;
}

function generateFood() {
    for (let i = 0; i < TOTAL_FOOD; i++) {
        let randomX = random(BALL_SIZE, WIDTH - BALL_SIZE);
        let randomY = random(BALL_SIZE, HEIGHT - BALL_SIZE);
        while (dist(spawnPoint.x, spawnPoint.y, randomX, randomY) - spawnPoint.size < 0) {
            randomX = random(BALL_SIZE, WIDTH - BALL_SIZE);
            randomY = random(BALL_SIZE, HEIGHT - BALL_SIZE);
        }
        cars.forEach((car) => {
            car.foods.push(new Food(randomX, randomY, FOOD_VALUE, FOOD_SIZE));
        });
    }
}

function generateGeneration() {
    aliveCars = GeneticAlgorithm.nextGeneration(cars);
    cars.forEach((car) => car.dispose());
    cars = aliveCars;
    timer = 0;
    foods = [];
    generateFood();
    balls = [...limits];
    generateRandomBalls();
    generation++;
    console.log('Generation #' + generation);
}

function generateLimits() {
    // Top/Down balls
    for (let i = 0; i <= WIDTH; i += BALL_SIZE) {
        limits.push(new Ball(i, 0, BALL_SIZE));
        limits.push(new Ball(i, HEIGHT, BALL_SIZE));
    }
    // Left/Right balls
    for (let i = BALL_SIZE; i < HEIGHT; i += BALL_SIZE) {
        limits.push(new Ball(0, i, BALL_SIZE));
        limits.push(new Ball(WIDTH, i, BALL_SIZE));
    }
}

function generateRandomBalls() {
    for (let i = BALL_SIZE; i < WIDTH; i += BALL_SIZE) {
        for (let j = BALL_SIZE; j < HEIGHT; j += BALL_SIZE) {
            if (dist(spawnPoint.x, spawnPoint.y, i, j) - spawnPoint.size < 0) continue;
            const noiseVal = Math.random();
            if (noiseVal < OBSTACLE_RATIO) {
                const newBall = new Ball(i, j, BALL_SIZE);
                balls.push(newBall);
            }
        }
    }
}
