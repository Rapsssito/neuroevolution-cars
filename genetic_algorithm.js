class GeneticAlgorithm {
    static nextGeneration(lastGeneration) {
        GeneticAlgorithm.calculateFitness(lastGeneration);
        const fitnessSum = lastGeneration.reduce((prev, curr) => prev + curr.fitness, 0);
        const newGeneration = lastGeneration.map(() => {
            const parent1 = GeneticAlgorithm.pickOne(lastGeneration, fitnessSum);
            const parent2 = GeneticAlgorithm.pickOne(lastGeneration, fitnessSum);
            const child = parent1.crossover(parent2);
            child.mutate(0.1);
            return child;
        });
        return newGeneration;
    }

    static pickOne(lastGeneration, fitnessSum) {
        const r = Math.random() * fitnessSum;
        let currentCount = 0;
        for (const parent of lastGeneration) {
            currentCount += parent.fitness;
            if (r <= currentCount) {
                return parent;
            }
        }
        throw new Error('PARENT NOT FOUND');
    }

    static calculateFitness(lastGeneration) {
        for (const parent of lastGeneration) {
            parent.fitness = parent.score * parent.score;
        }
    }
}
