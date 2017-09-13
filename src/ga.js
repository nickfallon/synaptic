
//experiment to train a synaptic perceptron with a genetic algorithm instead of propagation

//perceptron = new Architect.Perceptron(27,8,3);
//ev = new Evolver(perceptron, 100, 16.0);

//to evolve instead of propagate:
//to do - needs work
/*
	ev.createGeneration();
	ev.computeFitnesses(function(n) {
	      //n is a synaptic network. calculate the fitness and return it
        //some code here, eg.        
        var output = n.activate(x);
        var fitness = some_fitness_test(output)
		    return fitness;
	});
*/


function Evolver(network, popsize, range) {	
	console.log('creating initial GA population..');
	//create a population of cloned networks with random initial weights
	this.population = [];
	this.gen = 0;
	for (var i=0;i<popsize;i++) {
		//clone the network
		var n = network.clone();
		//initialise with random weights and biases
		Evolver.randomise(n, range);
		//set initial fitnesses to normalised equal share
		n.fitness = 1 / popsize;
		//add to population
		this.population.push(n);
	}
	console.log('population of ' + popsize + ' synaptic networks initialised.');
}
Evolver.prototype.getFittest = function() {
	//return fittest neural net
	var len = this.population.length;
	var fittest = this.population[0];
	for (var i=0;i<len;i++) {
		//for each network in the population
		n = this.population[i];
		if (fittest.fitness < n.fitness) {
			fittest = n;
		}
	}
	return fittest;
}
Evolver.prototype.computeFitnesses = function (fitness_func) {

    //calls the function fitness_func(network) for each network in the population
    //then normalises fitnesses for all members.

	//the input function 'fitness_func' must expect a synaptic network as input
	var fitness_sum = 0;
	var network;

    //execute the supplied fitness_func for each member in population.
    
	var len = this.population.length;
	for (var i=0;i<len;i++) {
		//for each network in the population
	    network = this.population[i];

	    //compute the fitness. 
	    //call fitness_func(network) for each network
	    network.fitness = fitness_func(network);

		//sum total fitness
	    fitness_sum = fitness_sum + network.fitness;
	}

	//normalise fitness across total population (so that summed fitnesses = 1.0)
	for (j = 0; j < len; j++) {
	    network = this.population[j];
	    network.fitness = (network.fitness / fitness_sum);
	}
}
Evolver.prototype.createGeneration = function() {
	this.gen = this.gen + 1;
    //create a new population using roulette selection (biased towards fitter members) 
	//choose 2 parents and spawn 2 children using cross	
    //build new population
    var len = this.population.length;
    var halfpopsize = len / 2;
    var newpop = [];
    for (j = 0; j < halfpopsize; j++) {
        //select 2 parents
        var p1 = this.select(Math.random());
        var p2 = this.select(Math.random());
        //generate 2 children with crossover genetic operator
        var children = this.cross(p1, p2);
        var c1 = children[0];
        var c2 = children[1];
        //store the children to the new population
        newpop.push(c1);
        newpop.push(c2);
    }
    //save new generation (and wipe the old one)
    this.population = newpop;
}

Evolver.prototype.select = function(x) {	
	//roulette selection
	var len = this.population.length;
	var selection_sum = 0;
	for (i = 0; i < len; i++) {
		var n = this.population[i];
	    selection_sum = selection_sum + n.fitness;
	    if (x <= selection_sum) {
	        return n;
	    }
	}
}

Evolver.prototype.cross = function (p1, p2) {
    //create 2 children using genetic crossover 
	
    var probability = 0.2;
    var crossed = false;

    //convert input networks
	var q1 = p1.toJSON();
	var q2 = p2.toJSON();

	var len = q1.connections.length;

   	//recombine the weights of connections
	for (var i=0;i<len;i++){
		if (probability < Math.random()) crossed = !crossed;
		if (crossed) {
			var w1 = q1.connections[i].weight;
			var w2 = q2.connections[i].weight;
			q1.connections[i].weight = w2;
			q2.connections[i].weight = w1;
		}
		else {
			//do nothing - no need to cross
		}
	}

	//recombine the bias of neurons
	var len2 = q1.neurons.length;	
	for (var j=0;j<len2;j++){
		if (probability < Math.random()) crossed = !crossed;
		if (crossed) {
			var b1 = q1.neurons[j].bias;
			var b2 = q2.neurons[j].bias;
			q1.neurons[j].bias = b2;
			q2.neurons[j].bias = b1;
		}
		else {
			//do nothing - no need to cross
		}
	}	

	//convert back into network
	var c1 = Network.fromJSON(q1);
	var c2 = Network.fromJSON(q2);
	//return pair of children
    var children = [c1, c2];
    return children;

}

Evolver.randomise = function(network, range) {

	//randomise the network weights and biases
	var exported = network.toJSON();
	var hrange = range / 2.0;
	var len = exported.connections.length;

	//randomise the weights of connections
	for (var i=0;i<len;i++){
		var c = exported.connections[i];
		c.weight = (Math.random() * range) - hrange;
	}

	//randomise the bias of neurons
	var len2 = exported.neurons.length;	
	for (var j=0;j<len2;j++){
		var n = exported.neurons[j];
		n.bias = (Math.random() * range) - hrange;
	}	
	//save the randomised network back to the input object
	network = Network.fromJSON(exported);
}
