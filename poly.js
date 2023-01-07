const avogadro = 6.02*10**23;

let conc_mono = 5 * 10**-3;
let conc_init = [10**-6, 10**-5][0];
//let conc_init = parseInt(document.getElementById("conc_init").value);
let conc_raft = [0, 10**-6, 10**-5][0];
//let conc_raft = parseInt(document.getElementById("conc_raft").value);
let volume = 10**-12;

const Polysim = {
    monomer: Math.round(conc_mono * volume * avogadro),
    initiator_0: Math.round(conc_init * volume * avogadro),
    initiator: Math.round(conc_init * volume * avogadro),
    numT: Math.round(conc_raft * volume * avogadro),

    Rn: [],
    radTRn: [],
    TRn: [],
    adduct: [],
    product: [],

    reactions: [11, 21, 31, 32, 33, 41, 42, 43, 51, 52, 53, 54],

    rate_constants: {
        "k11": 0.36,
        "k21": 3.6 * 10**7,
        "k31": 3.6 * 10**10,
        "k32": 18 * 10**8,
        "k33": 18 * 10**8,
        "k41": 3.6 * 10**10,
        "k42": 18 * 10**8,
        "k43": 18 * 10**8,
        "k51": 3.6 * 10**11,
        "k52": 3.6 * 10**11,
        "k53": 3.6 * 10**11,
        "k54": 3.6 * 10**11
    },
}

function rxn11() {
    Polysim.initiator -= 1;
    Polysim.Rn.push(...[[1], [1]]);
};
    

function rxn21() {
    const random_chain = Math.floor(Math.random() * Polysim.Rn.length);
    Polysim.Rn[random_chain].push(0);
    Polysim.monomer -= 1;
}

// Pre-equilibrium reactions
function rxn31() {
    let R1 = Polysim.Rn.filter(i => i.length > 1);
    const rdm = Math.floor(Math.random() * R1.length);
    let x = [2] + R1[rdm];
    Polysim.radTRn.push(x);
    let foo = Polysim.Rn.indexOf(R1[rdm]);
    Polysim.Rn.splice(foo, 1);
    Polysim.numT -= 1;
}

function rxn32() {
    const pp = Math.floor(Math.random() * Polysim.radTRn.length);
    let u = Polysim.radTRn[pp].slice(1);
    Polysim.Rn.push(u);
    Polysim.radTRn.splice(pp, 1);
    Polysim.numT += 1
}

function rxn33() {
    const random_target = Math.floor(Math.random() * Polysim.radTRn.length);
    Polysim.TRn.push(Polysim.radTRn[random_target]);
    Polysim.radTRn.splice(random_target, 1);
    Polysim.Rn.push([1]);
}

// Core equilibrium reactions
function rxn41() {
    let num_R1 = Polysim.Rn.filter(i => i.length > 1);
    const pp1 = Math.floor(Math.random() * num_R1.length);
    const pp2 = Math.floor(Math.random() * Polysim.TRn.length);
    Polysim.adduct.push(num_R1[pp1] + Polysim.TRn[pp2]);
    Polysim.Rn.remove(num_R1[pp1]);
    Polysim.TRn.splice(pp, 1);
}
    
function rxn42() {
    const pp = Math.floor(Math.random() * Polysim.adduct.length);
    let x = Polysim.adduct[pp].index(2);
    Polysim.Rn.push(Polysim.adduct[pp].slice(0, x+1));
    Polysim.TRn.push(Polysim.adduct[pp].slice(x));
    Polysim.adduct.splice(pp, 1)
}

function rxn43() {
    const pp = Math.floor(Math.random() * Polysim.adduct.length);
    let x = Polysim.adduct[pp].index(2);
    Polysim.TRn.push([2] + Polysim.adduct[pp].slice(0, x+1)); 
    Polysim.Rn.push(Polysim.adduct[pp].slice(x+1));
    Polysim.adduct.splice(pp, 1)
}

// Termination reactions
function rxn51() {
    let num_R1 = Polysim.Rn.filter(i => i.length > 1);
    const pp1 = Math.floor(Math.random() * num_R1.length);
    const pp2 = Math.floor(Math.random() * num_R1.length-1);
    Polysim.product.push(num_R1[pp1] + num_R1[pp2]);
    Polysim.Rn.remove(num_R1[pp1]);
    Polysim.Rn.remove(num_R1[pp2]);
}

function rxn52() {
    let num_R1 = Polysim.Rn.filter(i => i.length > 1);
    const pp1 = Math.floor(Math.random() * num_R1.length);
    const pp2 = Math.floor(Math.random() * num_R1.length-1);
    Polysim.product.push(num_R1[pp1]);
    Polysim.product.push(num_R1[pp2]);
    Polysim.Rn.remove(num_R1[pp1]);
    Polysim.Rn.remove(num_R1[pp2]);
}

function rxn53() {
    const pp = Math.floor(Math.random() * Polysim.adduct.length);
    Polysim.product.push(Polysim.adduct[pp] + [1]);
    Polysim.Rn.remove([1]);
    Polysim.adduct.splice(pp, 1);
}

function rxn54() {
    let num_R1 = Polysim.Rn.filter(i => i.length > 1);
    const pp1 = Math.floor(Math.random() * num_R1.length);
    const pp2 = Math.floor(Math.random() * Polysim.adduct.length);
    Polysim.product.push(Polysim.adduct[pp2] + num_R1[pp1]);
    Polysim.Rn.remove(num_R1[pp1]);
    Polysim.adduct.splice(pp2, 1);
}

function calc_rates() {
    let numR0 = Polysim.Rn.filter(i => i.length == 1).length;
    alpha = 1/(avogadro*volume); // particle no. to molarity conversion factor [mol.litres^-1]
    return {
        11: 
            Polysim.rate_constants["k11"] * 2 * Polysim.initiator*alpha,
        21: 
            Polysim.rate_constants["k21"] * (Polysim.Rn.length*alpha) * (Polysim.monomer*alpha),
        31: 
            Polysim.rate_constants["k31"] * (Polysim.Rn.length - numR0)*alpha * Polysim.numT*alpha,
        32: 
            Polysim.rate_constants["k32"] * Polysim.radTRn.length*alpha,
        33: 
            Polysim.rate_constants["k33"] * Polysim.radTRn.length*alpha,
        41: 
            Polysim.rate_constants["k41"] * (Polysim.Rn.length - numR0)*alpha * Polysim.TRn.length*alpha,
        42: 
            Polysim.rate_constants["k42"] * Polysim.adduct.length*alpha,
        43: 
            Polysim.rate_constants["k43"] * Polysim.adduct.length*alpha,
        51: 
            Polysim.rate_constants["k51"] * (Polysim.Rn.length - numR0)*alpha * (Polysim.Rn.length - numR0-1)*alpha,
        52: 
            Polysim.rate_constants["k52"] * (Polysim.Rn.length - numR0)*alpha * (Polysim.Rn.length - numR0-1)*alpha,
        53: 
            Polysim.rate_constants["k53"] * Polysim.adduct.length*alpha *  numR0*alpha,
        54: 
            Polysim.rate_constants["k54"] * Polysim.adduct.length*alpha * Polysim.Rn.length*alpha
    }
}

function run_reaction(reaction) {
        if (reaction == 11 && Polysim.initiator > 0) rxn11();
        else if (reaction == 21 && Polysim.Rn.length > 0 && Polysim.monomer > 0) rxn21();
        else if (reaction == 31 && (Polysim.Rn.length - Polysim.Rn.filter(x => x==[1]).length >= 1) && Polysim.numT > 0) rxn31();
        else if (reaction == 32 && Polysim.radTRn.length > 0) rxn32();
        else if (reaction == 33 && Polysim.radTRn.length > 0) rxn33();
        else if (reaction == 41 && Polysim.TRn.length > 0 && (Polysim.Rn.length - Polysim.Rn.filter(x => x==[1]).length > 0)) rxn41();
        else if (reaction == 42 && Polysim.adduct.length > 0) rxn42();
        else if (reaction == 43 && Polysim.adduct.length > 0) rxn43();
        else if (reaction == 51 && (Polysim.Rn.length - Polysim.Rn.filter(x => x==[1]).length >= 2)) rxn51();
        else if (reaction == 52 && (Polysim.Rn.length - Polysim.Rn.filter(x => x==[1]).length > 2)) rxn52();
        else if (reaction == 53 && [1] in Polysim.Rn && Polysim.adduct.length > 0) rxn53();
        else if (reaction == 54 && (Polysim.Rn.length - Polysim.Rn.filter(x => x==[1]).length > 0) && Polysim.adduct.length > 0) rxn54();
}

function number_of_R(num) {
    let radical_lengths = Polysim.Rn.filter(i => i.length == num+1);
    return radical_lengths.length;
}

function new_constants() {
    Polysim.rate_constants[k31] = Polysim.rate_constants[k41] = 2*Polysim.rate_constants[k31];
    
    Polysim.rate_constants[k32] = Polysim.rate_constants[k33] = 2*Polysim.rate_constants[k32];
    Polysim.rate_constants[k42] = Polysim.rate_constants[k43] = 2*Polysim.rate_constants[k42];
    
    Polysim.rate_constants[k51] = Polysim.rate_constants[k52] = 2*Polysim.rate_constants[k51];
    Polysim.rate_constants[k53] = Polysim.rate_constants[k54] = 2*Polysim.rate_constants[k53];
}

function choose(items, weights) {
    let i;

    for (i = 0; i < weights.length; i++)
    weights[i] += weights[i - 1] || 0;
    
    let random = Math.random() * weights[weights.length - 1];
    
    for (i = 0; i < weights.length; i++)
        if (weights[i] > random)
            break;
    
    return items[i];
};

function run_simulation(maxTime) {
    let time = 0;
    let tenMult = 0;
    //let width = [];

    run_reaction(11)

    // Chart
    let myChart = new Chart(
        document.getElementById('chart'),
        {
            type: 'line',
            data: {
            labels: [],
            datasets: [
                {
                label: 'P_n against n',
                data: [],
                }
            ]
            }
        }
    );

    while (time < maxTime) {
        // calculate rates of each potential reaction and convert them to a numpy array
        let rates = Object.values(calc_rates());
        let sum_rates = rates.reduce((partialSum, a) => partialSum + a, 0);

        if (sum_rates < 10**-8) {
            console.log("Reactions stop as total rates equal 0.")
            break
        } else {
            // Choose a reaction from the reaction list with weights determined by their probabilities
            let probabilities = rates.map(elem => elem / sum_rates);
            let reaction = choose(items=Polysim.reactions, weights=probabilities);
            run_reaction(reaction);
        }

        // Increment time by tau, the time passed from the last reaction
        let rd = Math.random();
        let tau = Math.log(1 / rd) / sum_rates / 3600;
        time += tau

        if (time > tenMult * 10) {
            console.log(`Time: ${time} s`)
            let max_length = Math.max(...Polysim.Rn.map(chain => chain.length)) - 1

            let P_n = []
            for (n = 0; n < max_length; n++) {
                P_n.push(
                    {x: n, y: number_of_R(n) / Polysim.Rn.length}
                )
            }

            // Update plot
            myChart.data.labels = P_n.map(item => item.x);
            myChart.data.datasets[0].data = P_n.map(item => item.y);
            myChart.update('none')
            
            tenMult += 1;
        }
    }
}

let alreadyRan = 0;

function start() {
    //let maxTime = parseInt(document.getElementById("max_time").value);
    let maxTime = 3600;
    if (!alreadyRan) {
        run_simulation(maxTime);
        alreadyRan = 1;
    } 
    else {
        console.log("dah run")
        myChart.destroy();
        run_simulation(maxTime);
    }
    
};

function prev() {

}

function next() {

}

const button = document.getElementById("myBtn");
button.addEventListener("click", start);

const prevBtn = document.getElementById("prevBtn");
prevBtn.addEventListener("click", prev);

const nextBtn = document.getElementById("nextBtn");
prevBtn.addEventListener("click", next);