const variableSet = new Set("ε");
const nfaTransitionTable = new Map();
const dfaTransitionTable = new Map();
const FINAL_STATE_STRING = "FINAL";
const STARTING_STATE_CHAR = 'A';
const FILLER_KEY = 99999999999;

const nfaWithoutEpsilon = new Map();
const tempNfa = new Map();
const variableSetWithoutEpsilon = new Set();

const dict = new Map();

function parseParagraph(paragraph) {
    clearGlobalVariable();

    var sentences = paragraph.trim().split("\n");
    sentences.forEach(sentence => parseText(sentence));
    console.log(sentences);

    // Set first state as initial state.
    getFirstState().isInitialState = true;

    console.log("Is NFA? " + isNFA());
    findEpsilonClosure();
    createExtraStates();
    createDfa();
    removeUnusedState();
    renameDfaStateName();
    print();
}

function parseText(sentence) {
    let text = sentence.trim();
    let arrowIndex = text.indexOf("-");
    let stateString = text.substring(0, arrowIndex).trim();
    let transitionText = text.substring(arrowIndex + 1, text.length)
    const myArray = transitionText.split("|");

    const state = new NfaState(stateString);
    nfaTransitionTable.set(stateString, state);

    let counter = 0;

    myArray.forEach(element => {
        parse(0, element.trim(), stateString, counter);
        counter++;
    });

    // myArray.forEach(element => {
    //     const a = element.trim();
    //     let firstChar = a.charAt(0);
    //     if (a.length == 2) {
    //         let stateName = a.charAt(1);
    //         if (state.hasMapping(firstChar)) {
    //             state.getMapping(firstChar).push(stateName);
    //         } else {
    //             state.addMapping(firstChar, [stateName]);
    //         }
    //         variableSet.add(firstChar);
    //     } else if (a.length == 1) {
    //         if (firstChar == "ε") {
    //             state.isFinalState = true;
    //         }
    //         else if (isUppercase(firstChar)) {
    //             // First char is State.
    //             console.log(firstChar);
    //             if (state.hasMapping("ε"))
    //                 state.getMapping("ε").push(firstChar)
    //             else
    //                 state.addMapping("ε", [firstChar])
    //         } else {
    //             // First char is transition variable.
    //             variableSet.add(firstChar);
    //             if (!nfaTransitionTable.has(FINAL_STATE_STRING)) {
    //                 const finalState = new NfaState(FINAL_STATE_STRING);
    //                 finalState.isFinalState = true;
    //                 nfaTransitionTable.set(FINAL_STATE_STRING, finalState);
    //             }
    //             // Create or update mapping based on transition variable.
    //             if (state.hasMapping(firstChar)) {
    //                 state.getMapping(firstChar).push(FINAL_STATE_STRING);
    //             } else {
    //                 state.addMapping(firstChar, [FINAL_STATE_STRING]);
    //             }
    //         }
    //     }
    // });

    setAllEmptyMapping();
}

function parse(index, string, currentStateName, counter) {
    if (index >= string.length) {
        return;
    }

    const currentState = nfaTransitionTable.get(currentStateName);
    const currentChar = string.charAt(index);

    if (currentChar == "ε") {
        currentState.isFinalState = true;
        return;
    }

    if (isUppercase(currentChar)) {
        createOrAddMapping(currentState, "ε", currentChar);
        return;
    }

    // Not an uppercase => a transition variable.
    variableSet.add(currentChar);
    if (index + 1 < string.length) {
        const nextChar = string.charAt(index + 1);

        if (isUppercase(nextChar)) {
            createOrAddMapping(currentState, currentChar, nextChar);
            // return parse(index+1,string,currentStateName,counter);
            return;
        } else {
            // Create temporary state.
            const tempStateName = currentStateName + counter;
            const tempState = new NfaState(tempStateName);
            nfaTransitionTable.set(tempStateName, tempState);

            createOrAddMapping(currentState, currentChar, tempStateName);
            return parse(index + 1, string, tempStateName, counter + 1);
        }

    } else {
        if (!nfaTransitionTable.has(FINAL_STATE_STRING)) {
            const finalState = new NfaState(FINAL_STATE_STRING);
            finalState.isFinalState = true;
            nfaTransitionTable.set(FINAL_STATE_STRING, finalState);
        }
        createOrAddMapping(currentState, currentChar, FINAL_STATE_STRING);
        return;
    }
}

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
                state.addMapping(transitionVar, Array("∅"));
            }
        })
    });
}

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
}

function checkStringDfa(str) {
    const initialState = Array.from(dfaTransitionTable.entries()).find(state => state[1].isInitialState);
    let result = traverse(0, str, initialState[0])
    console.log("Result : " + result)

    document.getElementById("1").innerHTML = result;

    return result;

    // var currentState = castToState(getFirstState());
    // for (let i = 0; i < str.length; i++) {
    //     let char = str[i];
    //     if (!variableSet.has(char))
    //         return false;

    //     console.log("ch = " + char);
    //     let nextStateString = currentState.getMapping(char);
    //     console.log(nextStateString);
    //     if (nfaTransitionTable.has(nextStateString)) {
    //         currentState = castToState(nfaTransitionTable.get(nextStateString));
    //     } else {
    //         // Exit if last character.
    //         if (i == str.length - 1)
    //             break;
    //         else
    //             return false;
    //     }
    // };
    // console.log(currentState);
    // return currentState.isFinalState;
}

function traverse(index, str, currentStateKey) {
    console.log(currentStateKey);
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

function printTable() {

}

function getFirstState() {
    return nfaTransitionTable.entries().next().value[1];
}

function getInitialState() {
    return Array.from(dfaTransitionTable.values()).find(state => state.isInitialState);
}

function castToState(stateObject) {
    return Object.assign(new NfaState(), stateObject)
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

// This is NFA State
class NfaState {
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
        if (x != '∅'){
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
        const newState = new NfaState(stateKey);
        for (const value of variableSetWithoutEpsilon) {
            newState.addMapping(String(value), getStatesKey(String(value), stateKey));
        }
        newState.isFinalState = state.isFinalState;
        newState.isInitialState = state.isInitialState;
        nfaWithoutEpsilon.set(stateKey, newState);
    }
}

// Create all possible combinations.
function createExtraStates() {
    const keys = Array.from(nfaWithoutEpsilon.keys());
    const combinations = getCombinations(keys);

    for (const combination of combinations) {
        if (combination.length == 1) {
            tempNfa.set(combination[0], nfaWithoutEpsilon.get(combination[0]));
        } else {
            const newState = new NfaState(combination.join());
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
    console.log(findNewInitialState().join())
    const newInitialState = tempNfa.get(findNewInitialState().join());
    newInitialState.isInitialState = true;

    // Empty state for null
    const emptyState = new NfaState("∅");
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
        // dict.set(String.fromCharCode(STARTING_STATE_CHAR.charCodeAt(0) + i), key.split(","));
        dict.set(i, key.split(","));
        i++;
    }
    dict.set(FILLER_KEY, ["∅"]);
    // console.log(dict);

    // Map it
    for (const [key, state] of dict.entries()) {
        const nfaState = tempNfa.get((state.join()));
        const newState = new NfaState(key);
        variableSetWithoutEpsilon.forEach(variable => {
            const oldKeyState = nfaState.getMapping(variable);
            // console.log(findNewKey(oldKeyState));
            newState.addMapping(variable, findNewKey(oldKeyState));
        });
        newState.isFinalState = nfaState.isFinalState;
        newState.isInitialState = nfaState.isInitialState;
        dfaTransitionTable.set(key, newState);
    }

    console.log(dict);
}

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
        return FILLER_KEY;
    } else {
        for (const [key, state] of dict.entries()) {
            if (areArraysContentEqual(array, state)) {
                return key;
            }
        }
    }
}
// 0,S
function getEpsilon(variable, currentState) {
    currentState = String(currentState);
    let stateArr = new Set();

    let state = nfaTransitionTable.get(currentState);
    if (state == undefined)
        return [];

    stateArr.add(state.getMapping(variable));
    // TODO check again
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

// Combinations

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
    // Check if both arrays have the same length
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

function clearGlobalVariable() {
    variableSet.clear();
    variableSet.add("ε");
    variableSetWithoutEpsilon.clear();
    nfaTransitionTable.clear();
    nfaWithoutEpsilon.clear();
    dfaTransitionTable.clear();
    tempNfa.clear();
    dict.clear();
}