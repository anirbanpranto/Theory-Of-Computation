document.getElementById("random").innerHTML = "NFA -> RG"

function getInput(id) {
    var value = document.getElementById(id).value;

    var inputText = [];
    var index = 0;
    var newIndex = true;
    for (var i = 0; i < value.length; i++) {
        if (newIndex) {
            inputText[index] = value[i];
            newIndex = false;
        } else if (value[i] != '\n') {
            inputText[index] += value[i];
        } else {
            index++;
            newIndex = true;
        }
    }
    console.log(inputText)
    return inputText;
}

function insertEpsilon() {
    var text = document.getElementById('string-input');
    text.value += '\u03B5';
}

// ------------------------ convertRGtoNFA module ----------------------------------------

function convertNFAtoRG() {
    
}

