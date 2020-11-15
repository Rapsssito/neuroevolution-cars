const MAX_POPULATION = 20;
const MAX_FOOD = 50;
const OBSTACLE_RATIO = 0.12;
const CAR_SIZE = 30;
const OBSTACLE_SIZE = 50;
const FOOD_SIZE = 10;
const FOOD_VALUE = 10;
const WIDTH = 800;
const HEIGHT = 800;

let generation = 0;
let spawnPoint;
/** @type {Car[]} */
let cars = [];
/** @type {Car[]} */
let aliveCars = [];
let obstacles = [];
const limits = [];
let timer = 0;

let foodHasBeenEaten = false;
let bestSpan = null;
let onlyDisplayBest = false;

// Using CPU for optimization
tf.setBackend('cpu');

function setup() {
    createCanvas(WIDTH, HEIGHT);
    spawnPoint = {
        x: WIDTH / 2,
        y: HEIGHT / 2,
        size: OBSTACLE_SIZE * 2,
    };
    for (let i = 0; i < MAX_POPULATION; i++) {
        const car = new Car(CAR_SIZE, WIDTH / 2, HEIGHT / 2, 0.5, 4, 120);
        cars.push(car);
    }
    const generationButton = createButton('New');
    const clearButton = createButton('Clear');
    const onlyBestButton = createButton('Watch Only Best');
    generationButton.mousePressed(generateGeneration);
    clearButton.mousePressed(clearObstacles);
    onlyBestButton.mousePressed(() => {
        onlyDisplayBest = !onlyDisplayBest;
        return false;
    });
    bestSpan = createSpan();
    aliveCars = cars;
    // Generate limits
    generateLimits();
    // Random obstacles
    generateRandomObstacles();
    // Food
    generateFood();
    obstacles.push(...limits);
    textSize(width / 3);
}

function draw() {
    background(100);
    // Logic
    aliveCars.forEach((car) => car.update(obstacles));
    aliveCars.forEach((car) => {
        for (const obstacle of obstacles) {
            if (car.distance(obstacle.x, obstacle.y) < obstacle.size / 2) {
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
    aliveCars.forEach((car) => {
        if (onlyDisplayBest && !bestCar.dead && car !== bestCar) return;
        car.display(car === bestCar);
    });
    ellipse(spawnPoint.x, spawnPoint.y, spawnPoint.size); // Spawn point   
    obstacles.forEach((b) => b.display());
    bestCar.foods.forEach((f) => f.display());
    bestSpan.html('Best: ' + bestCar.score);
    if (!foodHasBeenEaten) timer++;
    foodHasBeenEaten = false;
}

function clearObstacles() {
    obstacles = [...limits];
}

function mousePressed() {
    obstacles.push(new Obstacle(mouseX, mouseY, OBSTACLE_SIZE));
    // Prevent default
    return false;
}

function generateFood() {
    for (let i = 0; i < MAX_FOOD; i++) {
        let randomX = random(OBSTACLE_SIZE, WIDTH - OBSTACLE_SIZE);
        let randomY = random(OBSTACLE_SIZE, HEIGHT - OBSTACLE_SIZE);
        while (dist(spawnPoint.x, spawnPoint.y, randomX, randomY) - spawnPoint.size < 0) {
            randomX = random(OBSTACLE_SIZE, WIDTH - OBSTACLE_SIZE);
            randomY = random(OBSTACLE_SIZE, HEIGHT - OBSTACLE_SIZE);
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
    obstacles = [...limits];
    generateRandomObstacles();
    generation++;
    console.log('Generation #' + generation);
}

function generateLimits() {
    // Top/Down obstacles
    for (let i = 0; i <= WIDTH; i += OBSTACLE_SIZE) {
        limits.push(new Obstacle(i, 0, OBSTACLE_SIZE));
        limits.push(new Obstacle(i, HEIGHT, OBSTACLE_SIZE));
    }
    // Left/Right obstacles
    for (let i = OBSTACLE_SIZE; i < HEIGHT; i += OBSTACLE_SIZE) {
        limits.push(new Obstacle(0, i, OBSTACLE_SIZE));
        limits.push(new Obstacle(WIDTH, i, OBSTACLE_SIZE));
    }
}

function generateRandomObstacles() {
    for (let i = OBSTACLE_SIZE; i < WIDTH; i += OBSTACLE_SIZE) {
        for (let j = OBSTACLE_SIZE; j < HEIGHT; j += OBSTACLE_SIZE) {
            if (dist(spawnPoint.x, spawnPoint.y, i, j) - spawnPoint.size < 0) continue;
            const noiseVal = Math.random();
            if (noiseVal < OBSTACLE_RATIO) {
                const newObstacle = new Obstacle(i, j, OBSTACLE_SIZE);
                obstacles.push(newObstacle);
            }
        }
    }
}
