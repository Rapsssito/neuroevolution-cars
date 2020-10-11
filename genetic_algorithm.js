class GeneticAlgorithm {
    /**
     * @param {Car[]} lastGeneration 
     * 
     * @returns {Car[]}
     */
    static nextGeneration(lastGeneration) {
        GeneticAlgorithm.calculateIndividualFitness(lastGeneration);
        const totalFitness = lastGeneration.reduce((prev, curr) => prev + curr.fitness, 0);
        const newGeneration = lastGeneration.map(() => {
            const parent1 = GeneticAlgorithm.pickOne(lastGeneration, totalFitness);
            const parent2 = GeneticAlgorithm.pickOne(lastGeneration, totalFitness);
            const child = parent1.crossover(parent2);
            child.mutate(0.1);
            return child;
        });
        return newGeneration;
    }

    /**
     * @param {Car[]} lastGeneration
     * @param {number} totalFitness
     * 
     * @returns {Car}
     */
    static pickOne(lastGeneration, totalFitness) {
        const r = Math.random() * totalFitness;
        let currentCount = 0;
        for (const parent of lastGeneration) {
            currentCount += parent.fitness;
            if (r <= currentCount) {
                return parent;
            }
        }
        throw new Error('PARENT NOT FOUND');
    }

    /**
     * @param {Car[]} lastGeneration
     */
    static calculateIndividualFitness(lastGeneration) {
        for (const parent of lastGeneration) {
            parent.fitness = parent.score * parent.score;
        }
    }
}
