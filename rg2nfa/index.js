const variableSet = new Set("ε");
const nfaTransitionTable = new Map();
const dfaTransitionTable = new Map();
const FINAL_STATE_STRING = "FINAL";
const STARTING_STATE_CHAR = 'A';
const NULL_STATE_KEY = 99999999999;

const nfaWithoutEpsilon = new Map();
const tempNfa = new Map();
const variableSetWithoutEpsilon = new Set();

// To make sure all states in word is defined in the grammar.
const userDefinedState = new Set();
const wordDefinedState = new Set();

// Mapping of DFA state name mapping. Used when converting NFA to DFA.
const dfaStateNameMapping = new Map();

/**
A - aR
R - bR | aS
S - bT
T - R | ε 
 * **/

function drawHeader(tableName, row_data){
    let table = document.getElementById(tableName);
    
    let row = table.insertRow(0); 
    
    row_data.forEach((item) => { 
        let cell = row.insertCell(0);
        cell.innerHTML = item.toString();
    })
    let cell_name = row.insertCell(0);
    cell_name.innerHTML = ""; 
}

function drawRow(tableName, row_data, num_row, row_name){
    let table = document.getElementById(tableName);
    
    let row = table.insertRow(num_row); 
    
    row_data.forEach((item) => { 
        let cell = row.insertCell(0);
        cell.innerHTML = item.toString();
    })
    let cell_name = row.insertCell(0);
    cell_name.innerHTML = row_name; 
}

function drawNFATable(){
    let header_obj = document.getElementById("epnfaH");
    header_obj.innerHTML = "Transition Table"
    let keys = Array.from(nfaTransitionTable.keys())
    //keys = keys.reverse();
    let alphabets = []
    if (keys.length > 0) {
        alphabets = Array.from(nfaTransitionTable.get(keys[0])["mapping"].keys()); 
        alphabets = alphabets.sort();
    } 
    keys.forEach((key, idx) => {
        console.log(key)
        const mapping = nfaTransitionTable.get(key)["mapping"]
        const sorted = [...mapping].sort().reverse();
        const sorted_mapping = new Map(sorted);
        //draw one row
        drawRow("epnfa", sorted_mapping, idx, key)
    })
    drawHeader("epnfa", alphabets.reverse())
}

function drawNFAwithoutEpsilonTable(){
    let header_obj = document.getElementById("nepnfaH");
    header_obj.innerHTML = "Transition Table w/o ε"
    let keys = Array.from(nfaWithoutEpsilon.keys());
    
    let alphabets = []
    if (keys.length > 0) {
        alphabets = Array.from(nfaWithoutEpsilon.get(keys[0])["mapping"].keys()); 
        alphabets = alphabets.sort();
    } 
    keys.forEach((key, idx) => {
        console.log(key)
        const mapping = nfaWithoutEpsilon.get(key)["mapping"]
        const sorted = [...mapping].sort().reverse();
        const sorted_mapping = new Map(sorted);
        //draw one row
        drawRow("nepnfa", sorted_mapping, idx, key)
    })
    drawHeader("nepnfa", alphabets.reverse())
}

function parseParagraph(paragraph) {
    // Reset all transition table everytime a grammar is parsed.
    clearGlobalVariable();

    //Reset error text.
    document.getElementById("0").innerHTML = null

    var sentences = paragraph.trim().split("\n");

    try {
        sentences.forEach(sentence => {
            parseSentence(sentence.trim())
        });
 
        drawNFATable();

        const firstStateName = Array.from(userDefinedState.values())[0]
        if(!wordDefinedState.has(firstStateName)){
            userDefinedState.delete(firstStateName);
        }
        if (!isSetEqual(userDefinedState, wordDefinedState))
            throw "Some state(s) are not defined/referenced!"

        // Set first state as initial state.
        getFirstState().isInitialState = true;

        convertToDfa();
        
        drawNFAwithoutEpsilonTable();
    } catch (error) {
        document.getElementById("0").innerHTML = error
    }

    // print();
}

function convertToDfa() {
    findEpsilonClosure();
    createExtraStates();
    createDfa();
    removeUnusedState();
    renameDfaStateName();
}

function parseSentence(sentence) {
    let arrowIndex = sentence.indexOf("-");

    // Arrow character is not found.
    if (arrowIndex == -1)
        throw "Invalid grammar sentence!"

    if (arrowIndex == 0)
        throw "State name not defined!"

    let stateNameString = sentence.substring(0, arrowIndex).trim();
    if (!isAlphaNumeric(stateNameString))
        throw "Invalid state name for \"" + stateNameString + "\"!"
    userDefinedState.add(stateNameString);

    let transitionSentence = sentence.substring(arrowIndex + 1, sentence.length)
    const stateTransitionWords = transitionSentence.split("|");

    // This will throw exception is grammar is invalid.
    checkWords(stateTransitionWords);

    // Create starting state.
    const state = new State(stateNameString);
    nfaTransitionTable.set(stateNameString, state);

    let counter = 0;

    stateTransitionWords.forEach(element => {
        parseStateTransition(0, element.trim(), stateNameString, counter);
        counter++;
    });

    // Fill table of empty transition to null(∅).
    setAllEmptyMapping();
}

// Parse each state transition word (e.g. 01A, aaaC, bD)
function parseStateTransition(index, string, currentStateName, counter) {

    // Reach end of word then return.
    if (index >= string.length) {
        return;
    }

    const currentState = nfaTransitionTable.get(currentStateName);
    const currentChar = string.charAt(index);

    if (currentChar == "ε") {
        currentState.isFinalState = true;
        return;
    }

    // If this is a single Uppercase character, then treat this as a state.
    if (isUppercase(currentChar)) {
        createOrAddMapping(currentState, "ε", currentChar);
        return;
    }

    // Not an uppercase, therefore it's a transition variable.
    variableSet.add(currentChar);

    // Check next character.
    if (index + 1 < string.length) {
        const nextChar = string.charAt(index + 1);

        if (isUppercase(nextChar)) {
            createOrAddMapping(currentState, currentChar, nextChar);
            return;
        } else {
            // Create temporary state to handle multiple transition (e.g aaaB, 0101A).
            const tempStateName = currentStateName + counter;
            const tempState = new State(tempStateName);
            nfaTransitionTable.set(tempStateName, tempState);

            createOrAddMapping(currentState, currentChar, tempStateName);
            return parseStateTransition(index + 1, string, tempStateName, counter + 1);
        }
        // This word does not contain state name (e.g aa, bb), then create a final state.
    } else {
        if (!nfaTransitionTable.has(FINAL_STATE_STRING)) {
            const finalState = new State(FINAL_STATE_STRING);
            finalState.isFinalState = true;
            nfaTransitionTable.set(FINAL_STATE_STRING, finalState);
        }
        createOrAddMapping(currentState, currentChar, FINAL_STATE_STRING);
        return;
    }
}

// Function to create or add mapping to the transition table.
function createOrAddMapping(state, key, value) {
    if (state.hasMapping(key))
        state.getMapping(key).push(value)
    else
        state.addMapping(key, [value])
}


function setAllEmptyMapping() {
    nfaTransitionTable.forEach(state => {
        variableSet.forEach(transitionVar => {
            if (!state.mapping.has(transitionVar)) {
                state.addMapping(transitionVar, ["∅"]);
            }
        })
    });
}

// Function to check the transition is NFA or DFA.
function isNFA() {
    for (let [key, state] of nfaTransitionTable.entries()) {
        const epsilonArr = state.getMapping("ε");
        if (epsilonArr.length > 1) {
            return true;
        }

        if (epsilonArr[0] != "∅") {
            return true;
        }

        for (const [key, arr] of state.mapping.entries()) {
            if (arr.length > 1) {
                return true;
            }
        }
    }
    return false;
}

function drawChecks(results){
    const checkStrings = document.getElementById("check_status");
    checkStrings.innerHTML = results.toString(); 
}

function print() {
    console.log(variableSet);
    console.log(nfaWithoutEpsilon);
    console.log("Temp NFA");
    console.log(tempNfa);
    console.log("DFA");
    console.log(dfaTransitionTable);
    console.log("NFA");
    console.log(nfaTransitionTable);
    console.log("NFA without eps");
    console.log(nfaWithoutEpsilon);
    console.log("User Defined State");
    console.log(userDefinedState);
    console.log("Word Defined State");
    console.log(wordDefinedState);
}

function checkStrings(strings){
    listOfStrings = strings.trim().split("\n");
    const checkResults = []
    listOfStrings.forEach(string =>{
        checkResults.push(checkStringDfa(string))
    })
    drawChecks(checkResults)
    console.log("Results",checkResults);
}

// Function to check given input is accepted by the machine or not.
function checkStringDfa(str) {
    const initialState = Array.from(dfaTransitionTable.entries()).find(state => state[1].isInitialState);
    let result = traverse(0, str, initialState[0]);
    return result;
}

// Recursive function to walk each state given a string.
function traverse(index, str, currentStateKey) {
    const currentState = dfaTransitionTable.get(currentStateKey);
    if (currentState == undefined) {
        return false;
    }

    if (index >= str.length) {
        return currentState.isFinalState;
    } else {
        return traverse(index + 1, str, currentState.getMapping(str.charAt(index)));
    }
}

function getFirstState() {
    return nfaTransitionTable.values().next().value;
}

function getInitialState() {
    return Array.from(dfaTransitionTable.values()).find(state => state.isInitialState);
}

function isUppercase(char) {
    if (!isNaN(char * 1)) {
        return false;
    } else {
        if (char == char.toUpperCase()) {
            return true;
        }
        if (char == char.toLowerCase()) {
            return false;
        }
    }
}

function checkWords(wordArray) {
    wordArray.forEach(w => {
        const word = w.trim();
        if (word === "")
            throw "Invalid Grammar Syntax!";
        if (!isAlphaNumeric(word) && word !== 'ε')
            throw "Invalid word \"" + word + "\"!";

        for (let index = 0; index < word.length; index++) {
            const char = word.charAt(index);
            if (isUppercase(char)) {
                wordDefinedState.add(char);
            }
        }
    })
}

function isAlphaNumeric(str) {
    var code, i, len;

    for (i = 0, len = str.length; i < len; i++) {
        code = str.charCodeAt(i);
        if (!(code > 47 && code < 58) && // numeric (0-9)
            !(code > 64 && code < 91) && // upper alpha (A-Z)
            !(code > 96 && code < 123)) { // lower alpha (a-z)
            return false;
        }
    }
    return true;
};

class State {
    name;
    // Map of transition variable to array of possible State.
    mapping;
    isInitialState = false;
    isFinalState = false;

    constructor(name) {
        this.name = name;
        this.mapping = new Map();
    }

    addMapping(variable, states) {
        this.mapping.set(variable, states);
    }

    hasMapping(key) {
        return this.mapping.has(key);
    }

    getMapping(key) {
        return this.mapping.get(key);
    }
}

//-------------------------------
// NFA to DFA region
//-------------------------------

function findNewInitialState() {
    const initialState = getFirstState();
    const newInitialState = new Set(getFirstState().name);

    initialState.getMapping("ε").forEach(x => {
        if (x != '∅') {
            newInitialState.add(x);
        }
    })

    return [...newInitialState].flat();
}

function findEpsilonClosure() {
    for (const value of variableSet) {
        if (value != "ε")
            variableSetWithoutEpsilon.add(value);
    }
    for (const [stateKey, state] of nfaTransitionTable.entries()) {
        const newState = new State(stateKey);
        for (const value of variableSetWithoutEpsilon) {
            newState.addMapping(String(value), getStatesKey(String(value), stateKey));
        }
        newState.isFinalState = state.isFinalState;
        newState.isInitialState = state.isInitialState;
        nfaWithoutEpsilon.set(stateKey, newState);
    }
}

// Create all possible combinations of states.
function createExtraStates() {
    const keys = Array.from(nfaWithoutEpsilon.keys());
    const combinations = getCombinations(keys);

    for (const combination of combinations) {
        if (combination.length == 1) {
            tempNfa.set(combination[0], nfaWithoutEpsilon.get(combination[0]));
        } else {
            const newState = new State(combination.join());
            const stateArr = combination.map(stateKey => {
                return nfaWithoutEpsilon.get(stateKey);
            });
            variableSetWithoutEpsilon.forEach(variable => {
                const a = stateArr.flatMap(state => {
                    return state.getMapping(variable);
                });
                const uniqueKeys = new Set(a.flat());
                if (uniqueKeys.size > 1) {
                    uniqueKeys.delete('∅');
                }
                newState.addMapping(variable, [...uniqueKeys]);
            });
            newState.isFinalState = stateArr.some(x => x.isFinalState);
            tempNfa.set(newState.name, newState);
        }
    }

    // Set new initial state.
    const currentInitialStateName = Array.from(tempNfa.values()).find(x => x.isInitialState).name;
    const currentInitialState = tempNfa.get(currentInitialStateName);
    currentInitialState.isInitialState = false;
    const newInitialState = tempNfa.get(findNewInitialState().join());
    newInitialState.isInitialState = true;

    // Empty state for null.
    const emptyState = new State("∅");
    variableSetWithoutEpsilon.forEach(variable => {
        emptyState.addMapping(variable, ["∅"]);
    });
    tempNfa.set("∅", emptyState);
}

function createDfa() {

    // Mapping table
    const keys = tempNfa.keys();

    let i = 0;
    for (const key of keys) {
        dfaStateNameMapping.set(i, key.split(","));
        i++;
    }
    dfaStateNameMapping.set(NULL_STATE_KEY, ["∅"]);

    // Map it
    for (const [key, state] of dfaStateNameMapping.entries()) {
        const nfaState = tempNfa.get((state.join()));
        const newState = new State(key);
        variableSetWithoutEpsilon.forEach(variable => {
            const oldKeyState = nfaState.getMapping(variable);
            newState.addMapping(variable, findNewKey(oldKeyState));
        });
        newState.isFinalState = nfaState.isFinalState;
        newState.isInitialState = nfaState.isInitialState;
        dfaTransitionTable.set(key, newState);
    }
}

// Simplify DFA by removing all unreferenced state.
function removeUnusedState() {
    let deleted = false;
    const referencedState = new Set();
    for (const [key, value] of dfaTransitionTable) {
        for (const key of value.mapping.values()) {
            referencedState.add(key);
        }
    }

    for (const [key, value] of dfaTransitionTable) {
        if (!referencedState.has(key) && !value.isInitialState) {
            dfaTransitionTable.delete(key);
            deleted = true;
        }
    }

    if (deleted) {
        removeUnusedState();
    }
}

function renameDfaStateName() {
    let index = 0;
    const tempMapping = new Map();
    const tempDfa = new Map();

    // Get temporary mapping of the current DFA.
    for (const [key, value] of dfaTransitionTable) {
        const newKey = String.fromCharCode(STARTING_STATE_CHAR.charCodeAt(0) + index);
        tempMapping.set(key, newKey);
        index++;
    }

    // Rename all the states name based on the temporary mapping.
    for (const [key, state] of dfaTransitionTable) {
        for (const [transitionVar, stateMappingValue] of state.mapping.entries()) {
            state.mapping.set(transitionVar, tempMapping.get(stateMappingValue));
        }
        state.name = tempMapping.get(state.name);
        tempDfa.set(tempMapping.get(key), state);
        index++;
    }

    // Copy tempDfa to dfaTransitionTable.
    dfaTransitionTable.clear();
    for (const [key, value] of tempDfa) {
        dfaTransitionTable.set(key, value);
    }
}

function findNewKey(array) {
    if (array.length == 1 && array[0] == "∅") {
        return NULL_STATE_KEY;
    } else {
        for (const [key, state] of dfaStateNameMapping.entries()) {
            if (areArraysContentEqual(array, state)) {
                return key;
            }
        }
    }
}

function getEpsilon(variable, currentState) {
    currentState = String(currentState);
    let stateArr = new Set();

    let state = nfaTransitionTable.get(currentState);
    if (state == undefined)
        return [];

    stateArr.add(state.getMapping(variable));
    for (const key of state.getMapping("ε")) {
        if (String(key) == "∅")
            continue;
        stateArr.add(getEpsilon(variable, key));
    }

    for (const key of [...stateArr]) {
        if (String(key) == "∅")
            continue;
        stateArr.add(getEpsilon("ε", key));
    }

    return [...stateArr].flat();
}

function getStatesKey(variable, currentState) {
    const set = new Set(getEpsilon(variable, currentState));
    if (set.size > 1) {
        set.delete("∅");
    }
    return [...set].flat();
}

function getCombinations(valuesArray) {
    var combi = [];
    var temp = [];
    var slent = Math.pow(2, valuesArray.length);

    for (var i = 0; i < slent; i++) {
        temp = [];
        for (var j = 0; j < valuesArray.length; j++) {
            if ((i & Math.pow(2, j))) {
                temp.push(valuesArray[j]);
            }
        }
        if (temp.length > 0) {
            combi.push(temp);
        }
    }
    return combi;
}

// Content equality checker
function areArraysContentEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }

    const sortedArr1 = arr1.slice().sort();
    const sortedArr2 = arr2.slice().sort();

    for (let i = 0; i < sortedArr1.length; i++) {
        if (sortedArr1[i] !== sortedArr2[i]) {
            return false;
        }
    }

    return true;
}

function isSetEqual(xs, ys) {
    return xs.size === ys.size &&
        [...xs].every((x) => ys.has(x))
}

function clearGlobalVariable() {
    variableSet.clear();
    variableSet.add("ε");
    variableSetWithoutEpsilon.clear();
    nfaTransitionTable.clear();
    nfaWithoutEpsilon.clear();
    dfaTransitionTable.clear();
    tempNfa.clear();
    dfaStateNameMapping.clear();
    userDefinedState.clear();
    wordDefinedState.clear();
}