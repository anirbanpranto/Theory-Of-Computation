document.getElementById("random").innerHTML = "RG -> NFA"

const variableSet = new Set(["ε"]);
const nfaTransitionTable = new Map();
const dfaTransitionTable = new Map();
const FINAL_STATE_STRING = "FINAL";
const STARTING_STATE_CHAR = 'A';

function init() {
    // FINAL_STATE.isFinalState = true;
}

function parseParagraph(paragraph) {
    // init();
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
    print();
    // console.log("Check ----------");
    // console.log(checkStringDfa("aababb"));
    // console.log("NFA ----------");
    // console.log(nfaWithoutEpsilon);
    // console.log(getCombinations(['a','b','c']));
    // console.log("check = " + checkString("abbbbbaba"));
    // console.log(nfaTransitionTable.get("C"));
    // console.log(getStatesKey("1","C"));
}

function parseText(sentence) {
    let text = sentence.trim();
    let arrowIndex = text.indexOf("-");
    let stateString = text.substring(0, arrowIndex).trim();
    let transitionText = text.substring(arrowIndex + 1, text.length)
    const myArray = transitionText.split("|");

    const state = new NfaState(stateString);
    nfaTransitionTable.set(stateString, state);

    myArray.forEach(element => {
        const a = element.trim();
        let firstChar = a.charAt(0);
        if (a.length == 2) {
            let stateName = a.charAt(1);
            if (state.hasMapping(firstChar)) {
                state.getMapping(firstChar).push(stateName);
            } else {
                state.addMapping(firstChar, new Array(stateName));
            }
            variableSet.add(firstChar);
        } else if (a.length == 1) {
            if (firstChar == "ε") {
                state.isFinalState = true;
            }
            else if (isUppercase(firstChar)) {
                // First char is State.
                console.log(firstChar);
                if (state.hasMapping("ε"))
                    state.getMapping("ε").push(firstChar)
                else
                    state.addMapping("ε", [firstChar])
            } else {
                // First char is transition variable.
                variableSet.add(firstChar);
                if (!nfaTransitionTable.has(FINAL_STATE_STRING)) {
                    const finalState = new NfaState(FINAL_STATE_STRING);
                    finalState.isFinalState = true;
                    nfaTransitionTable.set(FINAL_STATE_STRING, finalState);
                }
                state.addMapping(firstChar, new Array(FINAL_STATE_STRING));
            }
        }
    });

    console.log("--------");
    console.log(state);

    setAllEmptyMapping();

    document.getElementById("1").innerHTML = state.getMapping("1");
    document.getElementById("2").innerHTML = variableSet;
    document.getElementById("3").innerHTML = myArray[0];
    document.getElementById("4").innerHTML = transitionText;
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
            console.log("le >1");
            return true;
        }

        if (epsilonArr[0] != "∅") {
            console.log("not null")
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
    // console.log(nfaTransitionTable);
    console.log(nfaWithoutEpsilon);
    console.log("Temp NFA");
    console.log(tempNfa);
    console.log("DFA");
    console.log(dfaTransitionTable);
    console.log("NFA");
    console.log(nfaTransitionTable);
    console.log("NFA without eps");
    console.log(nfaWithoutEpsilon);
    // console.log("RE");
    // console.log(removeUnusedState());
}

function checkStringDfa(str) {
    const initialState = Array.from(dfaTransitionTable.entries()).find(state => state[1].isInitialState);
    let result = traverse(0, str, initialState[0])
    console.log("Result : " + result)
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

const nfaWithoutEpsilon = new Map();
const tempNfa = new Map();
const variableSetWithoutEpsilon = new Set();

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

// Create all possible permutations
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

    // Empty state for null
    const emptyState = new NfaState("∅");
    variableSetWithoutEpsilon.forEach(variable => {
        emptyState.addMapping(variable, ["∅"]);
    });
    tempNfa.set("∅", emptyState);
}

const dict = new Map();

function createDfa() {

    // Mapping table
    const keys = tempNfa.keys();

    let i = 0;
    for (const key of keys) {
        dict.set(String.fromCharCode(STARTING_STATE_CHAR.charCodeAt(0) + i), key.split(","));
        i++;
    }
    dict.set("FILLER", ["∅"]);
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

function findNewKey(array) {
    if (array.length == 1 && array[0] == "∅") {
        return "FILLER";
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