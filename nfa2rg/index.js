// ------------------------ insert epsilon ----------------------------------------
function insertEpsilonVariable() {
    var text = document.getElementById('string-variables');
    text.value += '\u03B5';   
}

function insertEpsilonVariableAtCheckString() {
    var text = document.getElementById('string-to-check');
    text.value += '\u03B5';
}

// ------------------------ convertNFAroRG module ----------------------------------------
function getVariablesNFA() {
    var listOfVariables = [];
    var stringVariables = document.getElementById('string-variables').value;

    // Check if the input is empty
    if (stringVariables.trim() === '') {
        console.error('Error: Var input is empty.');
        return; // Exit the function if input is empty
    }
    // Remove commas from the input string
    var stringVariablesNoComma = stringVariables.replace(/,/g, '');
    
    // Create an array of individual characters
    for (var i = 0; i < stringVariablesNoComma.length; i++) {
        listOfVariables.push(stringVariablesNoComma[i]);
    }

    console.log('Input successfully read:', listOfVariables);

    // You can return the list if you want to use it elsewhere
    return listOfVariables;
}

function getStatesNFA() {
    var listOfStates = [];
    var stringStates = document.getElementById('string-states').value.toUpperCase();

    // Check if the input is empty
    if (stringStates.trim() === '') {
        console.error('Error: States input is empty.');
        return; // Exit the function if input is empty
    }

    // Remove commas from the input string
    var stringStatesNoComma = stringStates.replace(/,/g, '');

    // Create an array of individual characters
    for (var i = 0; i < stringStatesNoComma.length; i++) {
        listOfStates.push(stringStatesNoComma[i]);
    }

    console.log('States successfully read:', listOfStates);

    // You can return the list if you want to use it elsewhere
    return listOfStates;
}

function getStartStateNFA() {
    var startState = document.getElementById('string-start-state').value.toUpperCase();

    // Check if the input is empty
    if (startState.trim() === '') {
        console.error('Error: Start state is empty.');
        return; // Exit the function if the start state is empty
    }

    console.log('Start state successfully read:', startState);

    // You can return the start state if you want to use it elsewhere
    return startState;
}

function getFinalStatesNFA() {
    var listOfFinalStates = [];
    var stringFinalStates = document.getElementById('string-final-states').value.toUpperCase();

    // Check if the input is empty
    if (stringFinalStates.trim() === '') {
        console.error('Error: Final states are empty.');
        return; // Exit the function if final states are empty
    }

    // Remove commas from the input string
    var stringFinalStatesNoComma = stringFinalStates.replace(/,/g, '');

    // Create an array of individual characters
    for (var i = 0; i < stringFinalStatesNoComma.length; i++) {
        listOfFinalStates.push(stringFinalStatesNoComma[i]);
    }

    console.log('Final states successfully read:', listOfFinalStates);

    // You can return the list if you want to use it elsewhere
    return listOfFinalStates;
}

function generateTable() {
    
    // Initialize variables
    var listOfVariables, listOfStates, listOfFinalStates, startState;

    // Get input variables, states, final states, and start state
    listOfVariables = getVariablesNFA();
    listOfStates = getStatesNFA();
    listOfFinalStates = getFinalStatesNFA();
    startState = getStartStateNFA();

    // Check if inputs are valid
    if (!listOfVariables || !listOfStates || !listOfFinalStates || !startState) {
        console.error('Error: Invalid input. Cannot generate table.');
        return;
    }

    // Generate table
    var tableBody = "";
    document.getElementById('transition-table-nfa').innerHTML = tableBody;

    // Header row
    tableBody += '<tr>';
    tableBody += '<td>' + '' + '</td>';
    for (var i = 0; i < listOfVariables.length; i++) {
        tableBody += '<td>' + listOfVariables[i] + '</td>';
    }
    tableBody += '</tr>';

    // Data rows
    for (var i = 0; i < listOfStates.length; i++) {
        tableBody += '<tr>';
        for (var j = 0; j <= listOfVariables.length; j++) {
            if (j != 0) {
                tableBody += '<td>' + '<input type="text" id="tableInput' + i + j + '" size="1" value="∅" maxlength="10">' + '</td>';
            } else {
                if (listOfStates[i] == startState) {
                    tableBody += '<td>' + '>' + listOfStates[i] + '</td>';
                } else if (listOfFinalStates.includes(listOfStates[i])) {
                    tableBody += '<td>' + '*' + listOfStates[i] + '</td>';
                } else {
                    tableBody += '<td>' + listOfStates[i] + '</td>';
                }
            }
        }
        tableBody += '</tr>';
    }
    // Display the table
    document.getElementById('transition-table-nfa').innerHTML = tableBody;
}

function convertNFAtoRG() {
    // Initialize variables
    var regularGrammar = "";
    
    // Validate input and get NFA data
    var listOfStates = getStatesNFA();
    var listOfVariables = getVariablesNFA();
    var listOfFinalStates = getFinalStatesNFA();

    if (!listOfStates || !listOfVariables || !listOfFinalStates) {
        console.error('Error: Invalid input. Cannot generate regular grammar.');
        return;
    }

    // Loop through all states
    for (var i = 0; i < listOfStates.length; i++) {
        var stateInput = [];
        var stateVariableInput = [];

        // Loop to see the next state based on the variables
        for (var j = 0; j <= listOfVariables.length; j++) {
            if (j !== 0) {
                var stateTransitionData = document.getElementById('tableInput' + i + j).value.toUpperCase();

                if (stateTransitionData !== '∅' && stateTransitionData !== "" && stateTransitionData.length > 1) {
                    var stateTransitionDataNoComma = stateTransitionData.replace(/,/g, '');
                    for (var x = 0; x < stateTransitionDataNoComma.length; x++) {
                        stateVariableInput.push(listOfVariables[j - 1]);
                        stateInput.push(stateTransitionDataNoComma[x]);
                    }
                }

                if (stateTransitionData !== '∅' && stateTransitionData !== "" && stateTransitionData.length <= 1) {
                    stateVariableInput.push(listOfVariables[j - 1]);
                    stateInput.push(stateTransitionData);
                }
            }
        }

        // Build regular grammar
        if (stateInput.length !== 0) {
            var stateGrammar = listOfStates[i] + ' -> ';
            stateGrammar += stateVariableInput[0] !== "ε" ? stateVariableInput[0] + stateInput[0] : stateInput[0];

            for (var k = 1; k < stateInput.length; k++) {
                stateGrammar += ' | ' + (stateVariableInput[k] !== "ε" ? stateVariableInput[k] + stateInput[k] : stateInput[k]);
            }

            // If the state is the final state
            if (listOfFinalStates.includes(listOfStates[i])) {
                stateGrammar += ' | ε';
            }

            regularGrammar += stateGrammar + '<br>';
        }
    }
    // Display the result
    document.getElementById('rg-table').innerHTML = regularGrammar;
}

// ------------------------ Check Strings module ----------------------------------------
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

function getStringToCheck() {
    document.getElementById('string-to-check').innerHTML = "";
    var listOfStringToCheck = getInput('string-to-check');
    var checkResult = "";

    for (var i = 0; i < listOfStringToCheck.length; i++) {
        checkResult += checkString(listOfStringToCheck[i]) + "\n";
        console.log(checkResult);
    }
    document.getElementById('string-check-result').innerHTML = checkResult;
}

function checkString(stringToCheck) {
     // Initialize variables
     var listOfVariables, listOfStates, listOfFinalStates, startState;

     // Get input variables, states, final states, and start state
     listOfVariables = getVariablesNFA();
     listOfStates = getStatesNFA();
     listOfFinalStates = getFinalStatesNFA();
     startState = getStartStateNFA();

    var result = "No";
    var cont = true;
    var process = true;
    var nextState = startState;
    //loop according to the string length
    for (var i = 0; i < stringToCheck.length; i++) {
        process = true;
        result = "No"
        //loop based on the states
        for (var j = 0; j < listOfStates.length; j++) {
            //if the state match with the next state, process string and continue read is true
            if (listOfStates[j] == nextState && process == true && cont == true) {
                cont = false; 
                var stateInput = [];
                var stateVariableInput = [];
                for (var k = 0; k <= listOfVariables.length; k++) {
                    if (k != 0) {
                        var stateTransitionData = document.getElementById('tableInput'+j+k).value.toUpperCase();
                        if (stateTransitionData != '∅' && stateTransitionData != "" && stateTransitionData.length > 1) {
                            var stateTransitionDataNoComma = stateTransitionData.replace(/,/g, '');
                            for (var y = 0; y < stateTransitionDataNoComma.length; y++) {
                                stateVariableInput.push(listOfVariables[k-1]);
                                stateInput.push(stateTransitionDataNoComma[y]);
                            }
                        }
                        if (stateTransitionData != '∅' && stateTransitionData != "" && stateTransitionData.length <= 1) {
                            stateVariableInput.push(listOfVariables[k-1]);
                            stateInput.push(stateTransitionData);
                        }
                    }
                }
                //loop according to the variables from the table
                for (var x = 0; x < stateVariableInput.length; x++) {
                    //if the part of the string match with the variables
                    if (stringToCheck[i] == stateVariableInput[x]) {
                        nextState = stateInput[x]; //change the next state based on the variables being consumed
                        //if the next state match with final state after previous variables being true
                        if (listOfFinalStates.includes(nextState)) {
                            result = "Yes";
                        }
                        else {
                            result = "No";
                        }
                        cont = true;
                    }
                }
                process = false;
            }
        }
    }
    return result;
}

// ------------------------ Draw NFA Diagram module ----------------------------------------
 // Function to draw NFA diagram
 
const offsetX = - 60;

function drawNFADiagram() {
    // Get NFA data
    var listOfStates = getStatesNFA();
    var listOfVariables = getVariablesNFA();
    var listOfFinalStates = getFinalStatesNFA();

    // Get canvas context
    const canvas = document.getElementById('nfaCanvas');
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
   
    // Draw states
    for (var i = 0; i < listOfStates.length; i++) {
        var x = offsetX + (i + 1) * canvas.width / (listOfStates.length + 1);
        var y = canvas.height / 2;

        ctx.beginPath();
        ctx.arc(x, y, 25, 0, 2 * Math.PI);
        ctx.stroke();

        // Display state name
        ctx.fillText(listOfStates[i], x, y);

        // Mark start state and final states
        if (i === 0) {
            // Mark start state
            ctx.beginPath();
            ctx.moveTo(x - 25, y);
            ctx.lineTo(x - 60, y);
    
            // Draw arrowhead
            ctx.moveTo(x - 35, y - 10);
            ctx.lineTo(x - 25, y);
            ctx.moveTo(x - 35, y + 10);
            ctx.lineTo(x - 25 , y);

            ctx.fillText('Start', x - 60, y - 30);

        }
        if (listOfFinalStates.includes(listOfStates[i])) {
            // Mark final states
            ctx.fillText('Final', x, y + 40);
            ctx.beginPath();
            ctx.arc(x, y, 20, 0, 2 * Math.PI);
        }
         ctx.stroke();
    }

    // Draw transitions
    for (var i = 0; i < listOfStates.length; i++) {
        for (var j = 0; j <= listOfVariables.length; j++) {
            if (j !== 0) {
                var stateTransitionData = document.getElementById('tableInput' + i + j).value.toUpperCase();

                if (stateTransitionData !== '∅' && stateTransitionData !== "" && stateTransitionData.length > 1) {
                    var stateTransitionDataNoComma = stateTransitionData.replace(/,/g, '');
                    for (var x = 0; x < stateTransitionDataNoComma.length; x++) {
                        // Draw a line for each transition
                        var nextIndex = listOfStates.indexOf(stateTransitionDataNoComma[x]);
                        if (i === nextIndex) {
                            // Draw a loop arrow for self-transition
                            drawLoopArrow(ctx, i,listOfVariables[j-1]);
                        } else {
                            drawLine(ctx, i, nextIndex,listOfVariables[j-1]);     
                        }
                    }
                }

                if (stateTransitionData !== '∅' && stateTransitionData !== "" && stateTransitionData.length <= 1) {
                    // Draw a line for the transition
                    var nextIndex = listOfStates.indexOf(stateTransitionData);
                    if (i === nextIndex) {
                        // Draw a loop arrow for self-transition
                        drawLoopArrow(ctx, i,listOfVariables[j-1]);
                    } else {
                        drawLine(ctx, i, nextIndex,listOfVariables[j-1]);
                    }        
                }
            }
        }
    }
}

// Helper function to draw a line between states with arrowhead
function drawLine(ctx, fromIndex, toIndex,label) {
    const canvas = document.getElementById('nfaCanvas');
    const radius = 20; // radius of the circle
    var listOfStates = getStatesNFA();
    
    var fromX = offsetX + (fromIndex + 1) * canvas.width / (listOfStates.length + 1);
    var fromY = canvas.height / 2;
    var toX = offsetX + (toIndex + 1) * canvas.width / (listOfStates.length + 1);
    var toY = canvas.height / 2;
    const arrowSize = 10;

    // Calculate the angle between the line and the x-axis
    var angle = Math.atan2(toY - fromY, toX - fromX);
    // Calculate the starting and ending point on the circumference of the circle
    var startX = fromX + radius * Math.cos(angle);
    var startY = fromY + radius * Math.sin(angle);
    var endX = toX - radius * Math.cos(angle);
    var endY = toY - radius * Math.sin(angle); 

    var distance = Math.abs((startX-endX));
    console.log(distance);
    
    if(fromX > toX){
       
        if (distance > 300) {

            const controlX = (startX + endX) / 2;
            const controlY = fromY + 100; // You can adjust the control point Y coordinate as needed
    
            ctx.beginPath();
            ctx.moveTo(startX, startY + 20);
            ctx.quadraticCurveTo(controlX, controlY, endX, endY + 20);
    
            // Draw arrowhead
            ctx.moveTo(endX, endY + 20);
            ctx.lineTo(endX + arrowSize, ((endY+20)  - arrowSize));
            ctx.moveTo(endX, endY + 20);
            ctx.lineTo(endX-5 + arrowSize, ((endY+45) - arrowSize));
    
             // Mark the string for transition
            var arrowX = (fromIndex + toIndex + 2) * canvas.width / (2 * (listOfStates.length + 1));
            var arrowY = canvas.height / 2;
            var transitionLabel = label;
     
            ctx.fillText(transitionLabel, arrowX + offsetX, arrowY + 80);

        } else {   

            const controlX = (startX + endX) / 2;
            const controlY = fromY + 30; // You can adjust the control point Y coordinate as needed

            ctx.beginPath();
            ctx.moveTo(startX, startY + 20);
            ctx.quadraticCurveTo(controlX, controlY, endX, endY + 20);

            // Draw arrowhead
            ctx.moveTo(endX, endY + 20);
            ctx.lineTo(endX + arrowSize, ((endY+20)  - arrowSize));
            ctx.moveTo(endX, endY + 20);
            ctx.lineTo(endX + arrowSize, ((endY+40) - arrowSize));

            // Mark the string for transition
            var arrowX = (fromIndex + toIndex + 2) * canvas.width / (2 * (listOfStates.length + 1));
            var arrowY = canvas.height / 2;
            var transitionLabel = label;
    
            ctx.fillText(transitionLabel, arrowX + offsetX, arrowY + 40);
        }

    }else{

        if (distance > 300) {

            const controlX = (startX + endX) / 2;
            const controlY = fromY - 110; // You can adjust the control point Y coordinate as needed
           
            ctx.beginPath();
            ctx.moveTo(startX, startY - 20);
            ctx.quadraticCurveTo(controlX, controlY, endX-5, endY - 20);
    
            // Draw arrowhead
            ctx.moveTo(endX-5, endY - 20);
            ctx.lineTo(endX-5 - 20 + arrowSize, ((endY)  - arrowSize));
            ctx.moveTo(endX-5, endY - 20);
            ctx.lineTo(endX-5 - 20 + arrowSize, ((endY-25) - arrowSize));
    
             // Mark the string for transition
            var arrowX = (fromIndex + toIndex + 2) * canvas.width / (2 * (listOfStates.length + 1));
            var arrowY = canvas.height / 2;
            var transitionLabel = label;
     
            ctx.fillText(transitionLabel, arrowX + offsetX, arrowY - 70);
        }else{
            // Calculate arrowhead points
            var arrowX1 = endX - arrowSize * Math.cos(angle - Math.PI / 6);
            var arrowY1 = endY - arrowSize * Math.sin(angle - Math.PI / 6);
            var arrowX2 = endX - arrowSize * Math.cos(angle + Math.PI / 6);
            var arrowY2 = endY - arrowSize * Math.sin(angle + Math.PI / 6);

            ctx.beginPath();
            ctx.moveTo(startX + 10, startY);
            ctx.lineTo(endX - 10, endY);

            // Draw arrowhead
            ctx.moveTo(endX - 10, endY);
            ctx.lineTo(arrowX1 - 10, arrowY1);
            ctx.moveTo(endX - 10, endY);
            ctx.lineTo(arrowX2 - 10, arrowY2);

            // Mark the string for transition
            var arrowX = (fromIndex + toIndex + 2) * canvas.width / (2 * (listOfStates.length + 1));
            var arrowY = canvas.height / 2;
            var transitionLabel = label;

            ctx.fillText(transitionLabel, arrowX + offsetX, arrowY - 10);
        } 
    }
    ctx.stroke();
}

// Helper function to draw a loop arrow for self-transition
function drawLoopArrow(ctx, stateIndex, label) {
    const canvas = document.getElementById('nfaCanvas');
    var listOfStates = getStatesNFA();

    var x = offsetX + (stateIndex + 1) * canvas.width / (listOfStates.length + 1);
    var y = canvas.height / 2;

    ctx.beginPath();
    ctx.moveTo(x, y - 20);
    // Draw a small half-circle loop
    ctx.arc(x, y - 20, 20, Math.PI, 0);

    // Draw arrowhead
    ctx.moveTo(x - 20, y - 20);
    ctx.lineTo(x - 30, y - 30);

    // Draw the label on top of the line
    ctx.fillText(label, x, y - 50);
    ctx.stroke();
}