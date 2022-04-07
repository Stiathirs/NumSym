// Define variables
var arguments = process.argv.slice(2); // Get console args
var inputCode = arguments[0]; // first argument is the code
var inputText;  // second is the input
try{inputText = arguments[1];}catch{inputText="";}
var i = 0; // Command pointer
var ignoreEndCmd = false; // Useful later
var inputi = 0;
var stack = [];
var balance = 0;

// Clean up the code
inputCode = inputCode.replace(/[^0-9\+\-\*\/%^!@;#$<=>\[\]]/g,"");

// Interpret the code
while (i < inputCode.length){
  // Get current working character
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
      throw{name: "StackUnderflowError", message: "Stack is empty"};
    }
  }
  
  // Reverse stack
  if (/@/.test(currentChar)){
    stack = stack.reverse();
  }
  // Pop top two values and apply operation, push result to stack
  if (/[\+\*\-\/\%]/.test(currentChar)){
    if(stack.length > 1){
      var right = stack.pop();
      var left = stack.pop();
      var str = left.toString()+currentChar+right.toString();
      stack.push(eval(str));
    }else{
      throw{name: "StackUnderflowError", message: "Stack contains less than two values"};
    }
  }
  
  // Pop and print as number
  if (/\#/.test(currentChar)){
    if(stack.length > 0){
      process.stdout.write(stack.pop().toString());
    }else{
      throw{name: "StackUnderflowError", message: "Stack is empty"};
    }
  }
  
  // Pop and print as ASCII
  if (/\$/.test(currentChar)){
    if (stack.length > 0){
      process.stdout.write(String.fromCharCode(stack.pop()));
    }else{
      throw{name: "StackUnderflowError", message: "Stack is empty"};
    }
  }
  
  // Pop and discard
  if (/;/.test(currentChar)){
    if(stack.length > 0){
      stack.pop();
    }else{
      throw{name: "StackUnderflowError", message: "Stack is empty"};
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
      throw{name: "StackUnderflowError", message: "Stack contains less than two values"};
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
        ignoreEndCmd = true;
      }
    }else{
      throw{name: "StackUnderflowError", message: "Stack is empty"};
    }
  }
  
  // Signifies end of a loop. If not in a loop, ignore this instruction.
  if(!ignoreEndCmd){
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
  ignoreEndCmd = false; // Make sure to re-enable ]

  i++; // Increment the code pointer
}