const avogadro = 6.02*10**23;

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

class Polysim {

    constructor() {
        this.conc_mono = 5 * 10**-3;
        this.conc_init = parseFloat(document.getElementById("conc_init").value);
        this.conc_raft = parseFloat(document.getElementById("conc_raft").value);
        this.volume = 10**-12;
        
        this.maxTime = parseInt(document.getElementById("max_time").value);
        
        this.monomer = Math.round(this.conc_mono * this.volume * avogadro);
        this.initiator_0 = Math.round(this.conc_init * this.volume * avogadro);
        this.initiator = Math.round(this.conc_init * this.volume * avogadro);
        this.numT = Math.round(this.conc_raft * this.volume * avogadro);

        this.Rn = [];
        this.radTRn = [];
        this.TRn = [];
        this.adduct = [];
        this.product = [];

        this.reactions = [11, 21, 31, 32, 33, 41, 42, 43, 51, 52, 53, 54];

        this.rate_constants = {
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
        }

        this.myChart = new Chart(
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
    }

    rxn11() {
        this.initiator--
        this.Rn.push(...[[1], [1]])
    }
        
    
    rxn21() {
        let random_chain = Math.floor(Math.random() * this.Rn.length);
        this.Rn[random_chain].push(0);
        this.monomer--;
    }
    
    // Pre-equilibrium reactions
    rxn31() {
        let R1 = this.Rn.filter(i => i.length > 1);
        const rdm = Math.floor(Math.random() * R1.length);
        let x = [2].concat(R1[rdm]);
        this.radTRn.push(x);
        let foo = this.Rn.indexOf(R1[rdm]);
        this.Rn.splice(foo, 1);
        this.numT--;
    }
    
    rxn32() {
        const pp = Math.floor(Math.random() * this.radTRn.length);
        const u = this.radTRn[pp].slice(1);
        this.Rn.push(u);
        this.radTRn.splice(pp, 1);
        this.numT++;
    }
    
    rxn33() {
        const random_target = Math.floor(Math.random() * this.radTRn.length);
        this.TRn.push(this.radTRn[random_target]);
        this.radTRn.splice(random_target, 1);
        this.Rn.push([1]);
    }
    
    // Core equilibrium reactions
    rxn41() {
        let num_R1 = this.Rn.filter(i => i.length > 1);
        const pp1 = Math.floor(Math.random() * num_R1.length);
        const pp2 = Math.floor(Math.random() * this.TRn.length);
        this.adduct.push(num_R1[pp1].concat(this.TRn[pp2]));
        this.Rn.remove(num_R1[pp1]);
        this.TRn.splice(pp2, 1);
    }
        
    rxn42() {
        const pp = Math.floor(Math.random() * this.adduct.length);
        let x = this.adduct[pp].index(2);
        this.Rn.push(this.adduct[pp].slice(0, x+1));
        this.TRn.push(this.adduct[pp].slice(x));
        this.adduct.splice(pp, 1)
    }
    
    rxn43() {
        const pp = Math.floor(Math.random() * this.adduct.length);
        let x = this.adduct[pp].index(2);
        this.TRn.push([2] + this.adduct[pp].slice(0, x+1)); 
        this.Rn.push(this.adduct[pp].slice(x+1));
        this.adduct.splice(pp, 1)
    }
    
    // Termination reactions
    rxn51() {
        let num_R1 = this.Rn.filter(i => i.length > 1);
        const pp1 = Math.floor(Math.random() * num_R1.length);
        const pp2 = Math.floor(Math.random() * num_R1.length-1);
        this.product.push(num_R1[pp1].concat(num_R1[pp2]));
        this.Rn.remove(num_R1[pp1]);
        this.Rn.remove(num_R1[pp2]);
    }
    
    rxn52() {
        let num_R1 = this.Rn.filter(i => i.length > 1);
        const pp1 = Math.floor(Math.random() * num_R1.length);
        const pp2 = Math.floor(Math.random() * num_R1.length-1);
        this.product.push(num_R1[pp1]);
        this.product.push(num_R1[pp2]);
        this.Rn.remove(num_R1[pp1]);
        this.Rn.remove(num_R1[pp2]);
    }
    
    rxn53() {
        const pp = Math.floor(Math.random() * this.adduct.length);
        this.product.push(this.adduct[pp].concat([1]));
        this.Rn.remove([1]);
        this.adduct.splice(pp, 1);
    }
    
    rxn54() {
        let num_R1 = this.Rn.filter(i => i.length > 1);
        const pp1 = Math.floor(Math.random() * num_R1.length);
        const pp2 = Math.floor(Math.random() * this.adduct.length);
        this.product.push(this.adduct[pp2].concat(num_R1[pp1]));
        this.Rn.remove(num_R1[pp1]);
        this.adduct.splice(pp2, 1);
    }

    calc_rates() {
        let numR0 = this.Rn.filter(i => i.length == 1).length;
        let alpha = 1/(avogadro * this.volume); // particle no. to molarity conversion factor [mol.litres^-1]
        return {
            11: 
                this.rate_constants["k11"] * 2 * this.initiator*alpha,
            21: 
                this.rate_constants["k21"] * (this.Rn.length*alpha) * (this.monomer*alpha),
            31: 
                this.rate_constants["k31"] * (this.Rn.length - numR0)*alpha * this.numT*alpha,
            32: 
                this.rate_constants["k32"] * this.radTRn.length*alpha,
            33: 
                this.rate_constants["k33"] * this.radTRn.length*alpha,
            41: 
                this.rate_constants["k41"] * (this.Rn.length - numR0)*alpha * this.TRn.length*alpha,
            42: 
                this.rate_constants["k42"] * this.adduct.length*alpha,
            43: 
                this.rate_constants["k43"] * this.adduct.length*alpha,
            51: 
                this.rate_constants["k51"] * (this.Rn.length - numR0)*alpha * (this.Rn.length - numR0-1)*alpha,
            52: 
                this.rate_constants["k52"] * (this.Rn.length - numR0)*alpha * (this.Rn.length - numR0-1)*alpha,
            53: 
                this.rate_constants["k53"] * this.adduct.length*alpha *  numR0*alpha,
            54: 
                this.rate_constants["k54"] * this.adduct.length*alpha * this.Rn.length*alpha
        }
    }
    
    run_reaction(reaction) {
            if (reaction == 11 && this.initiator > 0) this.rxn11();
            else if (reaction == 21 && this.Rn.length > 0 && this.monomer > 0) this.rxn21();
            else if (reaction == 31 && (this.Rn.length - this.Rn.filter(x => x==[1]).length >= 1) && this.numT > 0) this.rxn31();
            else if (reaction == 32 && this.radTRn.length > 0) this.rxn32();
            else if (reaction == 33 && this.radTRn.length > 0) this.rxn33();
            else if (reaction == 41 && this.TRn.length > 0 && (this.Rn.length - this.Rn.filter(x => x==[1]).length > 0)) this.rxn41();
            else if (reaction == 42 && this.adduct.length > 0) this.rxn42();
            else if (reaction == 43 && this.adduct.length > 0) this.rxn43();
            else if (reaction == 51 && (this.Rn.length - this.Rn.filter(x => x==[1]).length >= 2)) this.rxn51();
            else if (reaction == 52 && (this.Rn.length - this.Rn.filter(x => x==[1]).length > 2)) this.rxn52();
            else if (reaction == 53 && [1] in this.Rn && this.adduct.length > 0) this.rxn53();
            else if (reaction == 54 && (this.Rn.length - this.Rn.filter(x => x==[1]).length > 0) && this.adduct.length > 0) this.rxn54();
    }
    
    number_of_R(num) {
        let radical_lengths = this.Rn.filter(i => i.length == num+1);
        return radical_lengths.length;
    }
    
    new_constants() {
        this.rate_constants[k31] = this.rate_constants[k41] = 2*this.rate_constants[k31];
        
        this.rate_constants[k32] = this.rate_constants[k33] = 2*this.rate_constants[k32];
        this.rate_constants[k42] = this.rate_constants[k43] = 2*this.rate_constants[k42];
        
        this.rate_constants[k51] = this.rate_constants[k52] = 2*this.rate_constants[k51];
        this.rate_constants[k53] = this.rate_constants[k54] = 2*this.rate_constants[k53];
    }

    run_simulation() {
        let time = 0;
        let tenMult = 0;
        //let width = [];
    
        this.run_reaction(11)
    
        while (time < this.maxTime) {
            // calculate rates of each potential reaction and convert them to a numpy array
            let rates = Object.values(this.calc_rates());
            let sum_rates = rates.reduce((partialSum, a) => partialSum + a, 0);
    
            if (sum_rates < 10**-8) {
                console.log("Reactions stop as total rates equal 0.")
                break
            } else {
                // Choose a reaction from the reaction list with weights determined by their probabilities
                let probabilities = rates.map(elem => elem / sum_rates);
                let reaction = choose(this.reactions, probabilities);
                this.run_reaction(reaction);
            }
    
            // Increment time by tau, the time passed from the last reaction
            let rd = Math.random();
            let tau = Math.log(1 / rd) / sum_rates / 3600;
            time += tau
    
            if (time > tenMult * 10) {
                let max_length = Math.max(...this.Rn.map(chain => chain.length)) - 1
    
                let P_n = []
                for (let n = 0; n < max_length; n++) {
                    P_n.push(
                        {x: n, y: this.number_of_R(n) / this.Rn.length}
                    )
                }
                // Update plot
                this.myChart.data.labels = P_n.map(item => item.x);
                this.myChart.data.datasets[0].data = P_n.map(item => item.y);
                this.myChart.update('none');
                
                tenMult++;

            }
        }
    }

}

/* 
    PAGE START
*/

let slider = document.getElementById("max_time");
let output = document.getElementById("time_output");
output.innerHTML = slider.value + " seconds";
slider.oninput = function() {
    output.innerHTML = this.value + " seconds";
}

let alreadyRan = 0;
function start() {
    if (!alreadyRan) {
        simul = new Polysim();
        simul.run_simulation();
        alreadyRan = 1;
    } else {
        simul.myChart.destroy();
        simul = new Polysim();
        simul.run_simulation();
    }
}

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