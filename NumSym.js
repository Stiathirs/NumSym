var interpreter;
var i;
var ignoreEndCmd;
var inputi;
var running = 0;
var level;
var outputConsole = document.getElementById("output");
var button = document.getElementById("button");
var stack;
var balance;
var error = document.getElementById("error");
function initialize(){
  var code = document.getElementById("code").value;
  error.innerHTML = "";
  i = 0;
  inputi = 0;
  ignoreEndCmd = 0;
  var input = document.getElementById("input").value;
  level = 0;
  stack = [];
  balance = 0;
  code = code.replace(/[^0-9\+\-\*\/%^!@;#$<=>\[\]]/g,"");
  button.onclick = terminateCode;
  button.innerHTML = "Stop Running";
  running = 1;
  outputConsole.innerHTML = "";
  interpret(code,input);
}

function terminateCode(){
  button.onclick = initialize;
  running = 0; 
  button.innerHTML = "Run Code";
}

function interpret(inputCode,inputText){
  // Get current working character, non command
  var currentChar = inputCode.charAt(i);

  // Push number to stack
  if (/[0-9]/.test(currentChar)){
    stack.push(Number(currentChar));
  }
  
  // Push user input as ASCII code to stack
  if (/\^/g.test(currentChar)){
    if(inputi < inputText.length){
      stack.push(inputText.charAt(inputi).charCodeAt(0));
      inputi++;
    }else{
      stack.push(0);
    }
  }
  
  // Pop top value of stack, push it twice to stack, essentially duplicating it
  if (/!/.test(currentChar)){
    if(stack.length > 0){
      var temp = stack.pop();
      stack.push(temp,temp);
    }else{
      terminateCode();
      error.innerHTML = "Error when Duplicating: Stack is empty.";
    }
  }
  
  // Reverse stack
  if (/@/.test(currentChar)){
    stack = stack.reverse();
  }
  // /[A-Za-z]/
  // Pop top two values and apply operation, push result to stack
  if (/[\+\*\-\/\%]/.test(currentChar)){
    if(stack.length > 1){
      var right = stack.pop();
      var left = stack.pop();
      var str = left.toString()+currentChar+right.toString();
      stack.push(eval(str));
    }else{
      terminateCode();
      error.innerHTML = "Error when doing Arithmetic: Stack contains less than two values.";
    }
  }
  
  // Pop and print as number
  if (/\#/.test(currentChar)){
    if(stack.length > 0){
      outputConsole.innerHTML = outputConsole.innerHTML + stack.pop().toString();
    }else{
      terminateCode();
      error.innerHTML = "Error when Printing Number: Stack is empty.";
    }
  }
  
  // Pop and print as ASCII
  if (/\$/.test(currentChar)){
    if (stack.length > 0){
      outputConsole.innerHTML = outputConsole.innerHTML + String.fromCharCode(stack.pop());
    }else{
      terminateCode();
      error.innerHTML = "Error when printing ASCII character: Stack is empty.";
    }
  }
  
  // Pop and discard
  if (/;/.test(currentChar)){
    if(stack.length > 0){
      stack.pop();
    }else{
      terminateCode();
      error.innerHTML = "Error when Discarding: Stack is empty.";
    }
  }
  
  // Pop top two values and do conditional statement, push 1 if true or 0 if false
  if (/[=<>]/.test(currentChar)){
    if (stack.length > 1){
      var right = stack.pop();
      var left = stack.pop();
      if (currentChar == "="){
        if (right == left){
          stack.push(1);
        }else{
          stack.push(0);
        } 
      }else{
        var str = left.toString()+currentChar+right.toString();
        if (eval(str)){
          stack.push(1);
        }else{
          stack.push(0);
        }
      }
    }else{
      terminateCode();
      error.innerHTML = "Error when doing conditional: Stack contains less than two values.";
    }
  }  
  
  // Check if top value equals 1, if so, start a loop, otherwise find its corresponding end point and go there.
  if (/\[/g.test(currentChar)){
    if(stack.length > 0){
      var temp = stack.pop();
      stack.push(temp,temp);
      if (stack.pop() != 0){
        balance++;
      }else{
        var origBal = balance;
        balance++;
        while(balance != origBal && i < inputCode.length){
          i++;
          currentChar = inputCode.charAt(i);
          if(currentChar == "["){
            balance++;
          }else if (currentChar == "]"){
            balance--;
          }
        }
        ignoreEndCmd = 1;
      }
    }else{
      terminateCode();
      error.innerHTML = "Error when checking to start loop: Stack is empty.";
    }
  }
  
  // Signifies end of a loop. If not in a loop, ignore this instruction.
  if(ignoreEndCmd == 0){
    if (/\]/g.test(currentChar)){
      if (balance > 0){
        var origBal = balance;
        balance--;
        while(balance != origBal && i < inputCode.length){
          i--;
          currentChar = inputCode.charAt(i);
          if(currentChar == "["){
            balance++;
          }else if (currentChar == "]"){
            balance--;
          }
        }
        i--;
      }
    }
  }
  ignoreEndCmd = 0;
  
  // If we're still running and haven't reached the end, increment the code pointer and interpret.
  if (running == 1 && i < inputCode.length){
    i++;
    setTimeout(interpret,1,inputCode,inputText);
  }else{
    terminateCode();
  }
}