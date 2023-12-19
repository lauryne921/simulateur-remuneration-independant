import Engine, { formatValue } from "publicodes";
import rules from "modele-social";

const engine = new Engine(rules);


document.getElementById('calcul-btn').addEventListener('click', () => {
    const turnover = parseFloat(document.getElementById('turnover').value);
    const cost = parseFloat(document.getElementById('cost').value);
    const situation = document.getElementById('select-situation').value;
    const numberOfChild = document.getElementById('child').value;
    const householdIncome = document.getElementById('household-income').value;

    document.getElementById('micro').style.display = 'none';
    document.querySelectorAll('.single-parent-tax-container').forEach(container => {
        container.style.display = 'none';
    });

    if (turnover <= 50000) {
        document.getElementById('micro').style.display = 'block';
    }

    if ((situation === 'célibataire' || situation === 'veuf') && parseInt(numberOfChild) > 0) {
        document.querySelectorAll('.single-parent-tax-container').forEach(container => {
            container.style.display = 'block';
        });
    }


    eurlIsResult(turnover, cost, situation, numberOfChild, householdIncome);
    eurlIsSingleParentResult(turnover, cost, situation, numberOfChild, householdIncome);
    eurlIrResult(turnover, cost, situation, numberOfChild, householdIncome);
    eurlIrSingleParentResult(turnover, cost, situation, numberOfChild, householdIncome);

    sasuResult(turnover, cost, situation, numberOfChild, householdIncome);
    sasuSingleParentResult(turnover, situation, numberOfChild, householdIncome);

    microResult(turnover, cost, situation, numberOfChild, householdIncome);
    microPaymentDischargeResult(turnover, cost, situation, numberOfChild, householdIncome);
    microSingleParent(turnover, cost, situation, numberOfChild, householdIncome);

    eiIrResult(turnover, cost, situation, numberOfChild, householdIncome);
    eiIrSingleParentResult(turnover, cost, situation, numberOfChild, householdIncome);
    eiIsResult(turnover, cost, situation, numberOfChild, householdIncome);
    eiIsSingleParentResult(turnover, cost, situation, numberOfChild, householdIncome);
    

    logUrssaf();
});


function familyQuotient() {
    const quotient = engine.evaluate("impôt . foyer fiscal . impôt sur le revenu . quotient familial");
    fillText('#quotient', quotient);

    const parts = engine.evaluate("impôt . foyer fiscal . nombre de parts");
    fillText('#parts', parts);
}

function fillText(htmlTag, data) {
    document.querySelector(htmlTag).textContent = `${formatValue(data)}`;
}

function yearFillText(htmlTag, data) {
    const dataYear = data.nodeValue * 12;
    document.querySelector(htmlTag).textContent = `${Math.round(dataYear)} € / an`;
}



/* CALCUL DU RESULTAT EURL */

function eurlSituation(turnover, cost, situation, numberOfChild, householdIncome, tax, singleParent) {
    engine.setSituation({
        "dirigeant . rémunération . totale": turnover,
        "impôt . foyer fiscal . situation de famille": `'${situation}'`,
        "impôt . foyer fiscal . enfants à charge": parseInt(numberOfChild),
        "impôt . foyer fiscal . revenu imposable . autres revenus imposables": parseFloat(householdIncome),
        "entreprise . activité . nature": "'libérale'",
        "entreprise . imposition": `'${tax}'`,
        "entreprise . charges": cost,
        "impôt . foyer fiscal . parent isolé": `${singleParent}`,
        "entreprise . associés": "'unique'",
        "entreprise . catégorie juridique": "'SARL'",
        "impôt . méthode de calcul": "'barème standard'"
    });
}

function eurlIrResult(turnover, cost, situation, numberOfChild, householdIncome) {
    eurlSituation(turnover, cost, situation, numberOfChild, householdIncome, 'IR', 'non');

    const tax = engine.evaluate("impôt . montant");
    fillText('#eurl .tax-ir', tax);

    const afterTax = engine.evaluate("dirigeant . rémunération . net . après impôt");
    fillText('#eurl .after-tax-ir', afterTax);
}

function eurlIrSingleParentResult(turnover, cost, situation, numberOfChild, householdIncome) {
    eurlSituation(turnover, cost, situation, numberOfChild, householdIncome, 'IR', 'oui');

    const tax = engine.evaluate("impôt . montant");
    fillText('#eurl .tax-ir-single-parent', tax);

    const afterTax = engine.evaluate("dirigeant . rémunération . net . après impôt");
    fillText('#eurl .after-tax-ir-single-parent', afterTax);
}

function eurlIsSingleParentResult(turnover, cost, situation, numberOfChild, householdIncome) {
    eurlSituation(turnover, cost, situation, numberOfChild, householdIncome, 'IS', 'oui');

    const tax = engine.evaluate("impôt . montant");
    fillText('#eurl .tax-single-parent', tax);

    const afterTax = engine.evaluate("dirigeant . rémunération . net . après impôt");
    fillText('#eurl .after-tax-single-parent', afterTax);
}

function eurlIsResult(turnover, cost, situation, numberOfChild, householdIncome) { 
    eurlSituation(turnover, cost, situation, numberOfChild, householdIncome, 'IS', 'non');

    fillText('#eurl .turnover-text', turnover);
    fillText('#eurl .cost-text', cost);

    const turnoverTotal = turnover + cost;
    fillText('#eurl .turnover-cost', turnoverTotal);

    eurlContributions();

    eurlRemuneration();

    eurlRetirement();

    familyQuotient();
}

function eurlContributions() {
    const contributionsTotal = engine.evaluate("dirigeant . indépendant . cotisations et contributions");
    fillText('#eurl .contributions-total', contributionsTotal);

    const contributions = engine.evaluate("dirigeant . indépendant . cotisations et contributions . cotisations");
    fillText('#eurl .contributions', contributions);

    const disease = engine.evaluate("dirigeant . indépendant . cotisations et contributions . maladie");
    fillText('#eurl .disease', disease);

    const baseRetirement = engine.evaluate("dirigeant . indépendant . cotisations et contributions . retraite de base");
    fillText('#eurl .base-retirement', baseRetirement);

    const additionalRetirement = engine.evaluate("dirigeant . indépendant . cotisations et contributions . retraite complémentaire");
    fillText('#eurl .additional-retirement', additionalRetirement);

    const diseaseAllowance = engine.evaluate("dirigeant . indépendant . cotisations et contributions . indemnités journalières maladie");
    fillText('#eurl .disease-allowance', diseaseAllowance);

    const disability = engine.evaluate("dirigeant . indépendant . cotisations et contributions . invalidité et décès");
    fillText('#eurl .disability', disability);

    const csg = engine.evaluate("dirigeant . indépendant . cotisations et contributions . CSG-CRDS");
    fillText('#eurl .csg', csg);

    const formation = engine.evaluate("dirigeant . indépendant . cotisations et contributions . formation professionnelle");
    fillText('#eurl .formation', formation);
}

function eurlRemuneration() {
    const net = engine.evaluate("dirigeant . rémunération . net");
    fillText('#eurl .net', net);

    const tax = engine.evaluate("impôt . montant");
    fillText('#eurl .tax', tax);

    const afterTax = engine.evaluate("dirigeant . rémunération . net . après impôt");
    fillText('#eurl .after-tax', afterTax);
}

function eurlRetirement() {
    const gainTrimester = engine.evaluate("protection sociale . retraite . trimestres");
    document.querySelector('#eurl .gain-trimester').textContent = gainTrimester.nodeValue;

    const pensionScheme = engine.evaluate("protection sociale . retraite . base");
    document.querySelector('#eurl .pension-scheme').textContent = pensionScheme.nodeValue * 12;

    const retirementPoints = engine.evaluate("protection sociale . retraite . complémentaire . RCI . points acquis");
    document.querySelector('#eurl .retirement-points').textContent = retirementPoints.nodeValue;
}



/* CALCUL DU RESULTAT SASU */

function sasuSituation(turnover, situation, numberOfChild, householdIncome, singleParent) {
    engine.setSituation({
        "dirigeant . rémunération . totale": parseInt(turnover),
        "impôt . foyer fiscal . situation de famille": `'${situation}'`,
        "impôt . foyer fiscal . enfants à charge": parseInt(numberOfChild),
        "impôt . foyer fiscal . revenu imposable . autres revenus imposables": parseFloat(householdIncome),
        "impôt . foyer fiscal . parent isolé": `${singleParent}`,
        "salarié . régimes spécifiques . DFS": "non",
        "entreprise . catégorie juridique": "'SAS'",
    });
}

function sasuSingleParentResult(turnover, situation, numberOfChild, householdIncome) {
    sasuSituation(turnover, situation, numberOfChild, householdIncome, 'oui');

    const tax = engine.evaluate("impôt . montant");
    fillText('#sasu .tax-single-parent', tax);

    const afterTax = engine.evaluate("salarié . rémunération . net . payé après impôt");
    yearFillText('#sasu .after-tax-single-parent', afterTax);
}

function sasuResult(turnover, cost, situation, numberOfChild, householdIncome) {
    sasuSituation(turnover, situation, numberOfChild, householdIncome, 'non');

    fillText('#sasu .turnover-text', turnover);
    fillText('#sasu .cost-text', cost);

    const retirementMax = engine.evaluate("protection sociale . retraite . base");
    yearFillText('#sasu .retirement-max', retirementMax);

    const additionalRetirementTotal = engine.evaluate("protection sociale . retraite . complémentaire");
    yearFillText('#sasu .additional-retirement-total', additionalRetirementTotal);

    sasuGrossSalary();

    sasuContributions();

    sasuRemuneration();

    familyQuotient();

}

function sasuGrossSalary() {
    const gross = engine.evaluate("salarié . rémunération . brut");
    yearFillText('#sasu .gross', gross);
}

function sasuContributions() {
    const contributionsTotal = engine.evaluate("dirigeant . assimilé salarié . cotisations");
    yearFillText('#sasu .contributions-total', contributionsTotal);

    sasuEmployerContribution();

    sasuEmployeeContribution();
}

function sasuEmployerContribution() {
    const disease = engine.evaluate("salarié . cotisations . maladie . employeur");
    yearFillText('#sasu .disease', disease);

    const solidarityAutonomy = engine.evaluate("salarié . cotisations . CSA");
    yearFillText('#sasu .solidarity-autonomy', solidarityAutonomy);

    const workAccident = engine.evaluate("salarié . cotisations . ATMP");
    yearFillText('#sasu .work-accident', workAccident);

    const oldAge = engine.evaluate("salarié . cotisations . vieillesse . employeur");
    yearFillText('#sasu .employer .old-age', oldAge);

    const additionalRetirement = engine.evaluate("salarié . cotisations . retraite complémentaire . employeur");
    yearFillText('#sasu .employer .additional-retirement', additionalRetirement);

    const generalBalance = engine.evaluate("salarié . cotisations . CEG . employeur");
    yearFillText('#sasu .employer .general-balance', generalBalance);

    const familyAllowance = engine.evaluate("salarié . cotisations . allocations familiales");
    yearFillText('#sasu .family-allowance', familyAllowance);

    const fnal = engine.evaluate("salarié . cotisations . FNAL");
    yearFillText('#sasu .fnal', fnal);

    const formation = engine.evaluate("salarié . cotisations . formation professionnelle");
    yearFillText('#sasu .formation', formation);

    const learningTax = engine.evaluate("salarié . cotisations . taxe d'apprentissage");
    yearFillText('#sasu .learning-tax', learningTax);

    const additionalPlanning = engine.evaluate("salarié . cotisations . prévoyances . employeur");
    yearFillText('#sasu .employer .additional-planning', additionalPlanning);
}

function sasuEmployeeContribution() {
    const oldAge = engine.evaluate("salarié . cotisations . vieillesse . salarié");
    yearFillText('#sasu .employee .old-age', oldAge);

    const additionalRetirement = engine.evaluate("salarié . cotisations . retraite complémentaire . salarié");
    yearFillText('#sasu .employee .additional-retirement', additionalRetirement);

    const generalBalance = engine.evaluate("salarié . cotisations . CEG . salarié");
    yearFillText('#sasu .employee .general-balance', generalBalance);

    const csg = engine.evaluate("salarié . cotisations . CSG-CRDS");
    yearFillText('#sasu .csg-crds', csg);

    const additionalPlanning = engine.evaluate("salarié . cotisations . prévoyances . salarié");
    yearFillText('#sasu .employee .additional-planning', additionalPlanning);
}

function sasuRemuneration() {
    const net = engine.evaluate("salarié . rémunération . net . à payer avant impôt");
    yearFillText('#sasu .net', net);

    const tax = engine.evaluate("impôt . montant");
    fillText('#sasu .tax', tax);

    const afterTax = engine.evaluate("salarié . rémunération . net . payé après impôt");
    yearFillText('#sasu .after-tax', afterTax);
}



/* CALCUL DU RESULTAT MICRO */

function microSituation(turnover, cost, situation, numberOfChild, householdIncome, paymentInDischarge, singleParent) {
    engine.setSituation({
        "dirigeant . auto-entrepreneur . chiffre d'affaires": turnover,
        "impôt . foyer fiscal . situation de famille": `'${situation}'`,
        "impôt . foyer fiscal . enfants à charge": parseInt(numberOfChild),
        "impôt . foyer fiscal . revenu imposable . autres revenus imposables": parseFloat(householdIncome),
        "entreprise . charges": cost,
        "dirigeant . auto-entrepreneur . impôt . versement libératoire": `${paymentInDischarge}`,
        "impôt . foyer fiscal . parent isolé": `${singleParent}`,
        "entreprise . activité . nature": "'libérale'",
        "entreprise . catégorie juridique": "'EI'",
        "entreprise . catégorie juridique . EI . auto-entrepreneur": "oui"
    });
}

function microPaymentDischargeResult(turnover, cost, situation, numberOfChild, householdIncome) {
    microSituation(turnover, cost, situation, numberOfChild, householdIncome, 'oui', 'non');

    const tax = engine.evaluate("dirigeant . rémunération . impôt");
    fillText('#micro .tax-payment-discharge', tax);

    const afterTax = engine.evaluate("dirigeant . auto-entrepreneur . revenu net . après impôt");
    fillText('#micro .after-tax-payment-discharge', afterTax);
}

function microSingleParent(turnover, cost, situation, numberOfChild, householdIncome) {
    microSituation(turnover, cost, situation, numberOfChild, householdIncome, 'non', 'oui');

    const tax = engine.evaluate("dirigeant . rémunération . impôt");
    fillText('#micro .tax-single-parent', tax);

    const afterTax = engine.evaluate("dirigeant . auto-entrepreneur . revenu net . après impôt");
    fillText('#micro .after-tax-single-parent', afterTax);
}

function microResult(turnover, cost, situation, numberOfChild, householdIncome) {
    microSituation(turnover, cost, situation, numberOfChild, householdIncome, 'non', 'non');

    fillText('#micro .turnover-text', turnover);
    fillText('#micro .cost-text', cost);

    microContributions();

    microRemuneration();
}

function microContributions() {
    const contributionsTotal = engine.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions");
    yearFillText('#micro .contributions-total', contributionsTotal);

    const contributions = engine.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations");
    fillText('#micro .contributions', contributions);

    const roomTax = engine.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . TFC");
    yearFillText('#micro .room-tax', roomTax);

    const formation = engine.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . CFP");
    yearFillText('#micro .formation', formation);
}

function microRemuneration() {
    const net = engine.evaluate("dirigeant . auto-entrepreneur . revenu net");
    fillText('#micro .net', net);

    const tax = engine.evaluate("dirigeant . rémunération . impôt");
    fillText('#micro .tax', tax);

    const afterTax = engine.evaluate("dirigeant . auto-entrepreneur . revenu net . après impôt");
    fillText('#micro .after-tax', afterTax);
}



/* CALCUL DU RESULTAT EI */

function eiSituation(turnover, cost, situation, numberOfChild, householdIncome, singleParent, tax) {
    engine.setSituation({
        "entreprise . chiffre d'affaires": turnover,
        "impôt . foyer fiscal . situation de famille": `'${situation}'`,
        "impôt . foyer fiscal . enfants à charge": parseInt(numberOfChild),
        "impôt . foyer fiscal . revenu imposable . autres revenus imposables": parseFloat(householdIncome),
        "entreprise . charges": parseFloat(cost),
        "impôt . foyer fiscal . parent isolé": `${singleParent}`,
        "entreprise . imposition": `'${tax}'`,
        "entreprise . activité . nature": "'libérale'",
        "situation personnelle . domiciliation fiscale à l'étranger": "non",
        "entreprise . catégorie juridique": "'EI'",
        "entreprise . catégorie juridique . EI . auto-entrepreneur": "non"
    });
}

function eiIrSingleParentResult(turnover, cost, situation, numberOfChild, householdIncome) {
    eiSituation(turnover, cost, situation, numberOfChild, householdIncome, 'oui', 'IR');

    const tax = engine.evaluate("impôt . montant");
    fillText('#ei .tax-ir-single-parent', tax);

    const afterTax = engine.evaluate("dirigeant . rémunération . net . après impôt");
    fillText('#ei .after-tax-ir-single-parent', afterTax);
}

function eiIrResult(turnover, cost, situation, numberOfChild, householdIncome) {
    eiSituation(turnover, cost, situation, numberOfChild, householdIncome, 'non', 'IR');

    fillText('#ei .turnover-text', turnover);
    fillText('#ei .cost-text', cost);

    eiContributions();

    eiRemuneration();

    eiRetirement();
}

function eiIsResult(turnover, cost, situation, numberOfChild, householdIncome) {
    eiSituation(turnover, cost, situation, numberOfChild, householdIncome, 'non', 'IS');

    const tax = engine.evaluate("impôt . montant");
    fillText('#ei .tax', tax);

    const afterTax = engine.evaluate("dirigeant . rémunération . net . après impôt");
    fillText('#ei .after-tax', afterTax);
}

function eiIsSingleParentResult(turnover, cost, situation, numberOfChild, householdIncome) {
    eiSituation(turnover, cost, situation, numberOfChild, householdIncome, 'oui', 'IS');

    const tax = engine.evaluate("impôt . montant");
    fillText('#ei .tax-single-parent', tax);

    const afterTax = engine.evaluate("dirigeant . rémunération . net . après impôt");
    fillText('#ei .after-tax-single-parent', afterTax);
}

function eiContributions() {
    const contributionsTotal = engine.evaluate("dirigeant . indépendant . cotisations et contributions");
    fillText('#ei .contributions-total', contributionsTotal);

    const contributions = engine.evaluate("dirigeant . indépendant . cotisations et contributions . cotisations");
    fillText('#ei .contributions', contributions);

    const disease = engine.evaluate("dirigeant . indépendant . cotisations et contributions . maladie");
    fillText('#ei .disease', disease);

    const baseRetirement = engine.evaluate("dirigeant . indépendant . cotisations et contributions . retraite de base");
    fillText('#ei .base-retirement', baseRetirement);

    const additionalRetirement = engine.evaluate("dirigeant . indépendant . cotisations et contributions . retraite complémentaire");
    fillText('#ei .additional-retirement', additionalRetirement);

    const diseaseAllowance = engine.evaluate("dirigeant . indépendant . cotisations et contributions . indemnités journalières maladie");
    fillText('#ei .disease-allowance', diseaseAllowance);

    const disability = engine.evaluate("dirigeant . indépendant . cotisations et contributions . invalidité et décès");
    fillText('#ei .disability', disability);

    const csg = engine.evaluate("dirigeant . indépendant . cotisations et contributions . CSG-CRDS");
    fillText('#ei .csg', csg);

    const formation = engine.evaluate("dirigeant . indépendant . cotisations et contributions . formation professionnelle");
    fillText('#ei .formation', formation);
}

function eiRemuneration() {
    const net = engine.evaluate("dirigeant . rémunération . net");
    fillText('#ei .net', net);

    const tax = engine.evaluate("impôt . montant");
    fillText('#ei .tax-ir', tax);

    const afterTax = engine.evaluate("dirigeant . rémunération . net . après impôt");
    fillText('#ei .after-tax-ir', afterTax);
}

function eiRetirement() {
    const gainTrimester = engine.evaluate("protection sociale . retraite . trimestres");
    document.querySelector('#ei .gain-trimester').textContent = gainTrimester.nodeValue;

    const pensionScheme = engine.evaluate("protection sociale . retraite . base");
    document.querySelector('#ei .pension-scheme').textContent = pensionScheme.nodeValue * 12;

    const retirementPoints = engine.evaluate("protection sociale . retraite . complémentaire . RCI . points acquis");
    document.querySelector('#ei .retirement-points').textContent = retirementPoints.nodeValue;
}






function logUrssaf() { 
    fetch('https://mon-entreprise.urssaf.fr/api/v1/rules/')
    .then(res => res.json())
    .then(data => {
        console.log(data);
    });
}
