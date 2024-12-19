// Global variable declarations
const codeInput = document.getElementById("code-input");
const lineNumbers = document.getElementById("line-numbers");
const outputContent = document.getElementById("output-container");
const compileButton = document.getElementById("compile-button");
const clearButton = document.getElementById("clear-output");
const highlightLineDiv = document.querySelector(".highlight-line");
const saveButton = document.getElementById("save-button");
const loadingHand = document.getElementById("loading-hand");

// Add custom styles for syntax highlighting using CodeMirror add-ons
CodeMirror.defineMode("customMode", function(config, parserConfig) {
  const keywords = /\b(PROGRAMME|VAR|BEGIN|END|IF|ELSE|FOR|WHILE|readln|writeln|INTEGER|FLOAT|CONST)\b/;
  const brackets = /[(){}[\]]/;
  const operators = /[\+\-\*\/\=<>]|<=|>=|==|!=|,|:|\|\||&&|!/;
  const semicolon = /;/;

  return {
      token: function(stream) {
          if (stream.match(keywords)) {
              return "keyword-bold-red";
          } else if (stream.match(brackets)) {
              return "bracket-bold-blue";
          } else if (stream.match(operators)) {
              return "operator-bold-green";
          } else if (stream.match(semicolon)) {
              return "semicolon-bold-black";
          } else {
              stream.next();
              return null;
          }
      },
  };
});

// Initialize CodeMirror with custom mode
const editor = CodeMirror.fromTextArea(document.getElementById("code-input"), {
    mode: "customMode",
    theme: "default",
    lineNumbers: true,
    matchBrackets: true,
    autoCloseBrackets: true,
    indentUnit: 4,
    indentWithTabs: true,
    lineWrapping: true,
    styleActiveLine: { nonEmpty: true },
    viewportMargin: Infinity, // Makes the editor not depend on content height
});

// Add custom styles dynamically
const style = document.createElement("style");
style.innerHTML = `
    .CodeMirror-activeline-background {
        background: #BDE0FE;
    }
        body.dark-mode  .CodeMirror-activeline-background {
background-color: #274C77;
}
`;
document.head.appendChild(style);

// Ensure the editor's active line is highlighted
editor.on("cursorActivity", function() {
    // Remove the active line class from all lines
    editor.eachLine((line) => {
        editor.removeLineClass(line, "wrap", "CodeMirror-activeline-background");
    });

    // Add the active line class to the current line
    const currentLine = editor.getCursor().line;
    editor.addLineClass(currentLine, "wrap", "CodeMirror-activeline-background");
});

// Sync CodeMirror content with the original textarea
editor.on("change", () => {
  codeInput.value = editor.getValue();
});

// Handle compilation
async function compileCode() {
  const code = editor.getValue().trim();
    outputContent.textContent = "";
  
    if (!code) {
      outputContent.textContent = "Error: Code editor is empty!";
      return;
    }
  
    // Show the typewriter animation and message
    loadingHand.style.display = "block";
  
    try {
      const response = await fetch("https://onlinecompiler-74qt.onrender.com/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
  
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
  
      const result = await response.json();
  
      // Hide the typewriter animation and display output or warnings
      loadingHand.style.display = "none";
      outputContent.textContent = result.output || "No output.";
  
      if (result.error) {
        outputContent.textContent += `\n\n[Warning]: ${result.error}`;
      }
  
      // Save output
      localStorage.setItem("miniDelOutput", result.output || "");
    } catch (err) {
      loadingHand.style.display = "none";
      outputContent.textContent = `Error: ${err.message}`;
    }
  }
  

// Clear output and reset state
function clearOutput() {
  outputContent.textContent = "";
  loadingHand.style.display = "none";
  localStorage.removeItem("miniDelOutput");
  highlightLineDiv.style.top = "-9999px";
  console.log("Output cleared.");
}

// Save code to a file
function saveCode() {
  const codeContent = editor.getValue();
  if (!codeContent) {
    alert("The code editor is empty. Please write some code before saving.");
    return;
  }

  const blob = new Blob([codeContent], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "code.txt";
  link.click();
  URL.revokeObjectURL(link.href);
}

// Initialize event listeners
document.addEventListener("DOMContentLoaded", () => {
    const toggleSwitch = document.querySelector(".theme-switch__checkbox");
    const body = document.body;
  
    // Theme toggle handling
    const savedTheme = localStorage.getItem("theme") || "light-mode";
    body.classList.add(savedTheme);
    toggleSwitch.checked = savedTheme === "dark-mode";
  
    toggleSwitch.addEventListener("change", () => {
      if (toggleSwitch.checked) {
        body.classList.replace("light-mode", "dark-mode");
        localStorage.setItem("theme", "dark-mode");
      } else {
        body.classList.replace("dark-mode", "light-mode");
        localStorage.setItem("theme", "light-mode");
      }
    });
  
    // Initialize other event listeners
    compileButton.addEventListener("click", compileCode);
    clearButton.addEventListener("click", clearOutput);
    saveButton.addEventListener("click", saveCode);
  
    codeInput.addEventListener("input", () => {
      localStorage.setItem("miniDelCode", codeInput.value);
    });
    
    // Load saved state
    const savedCode = localStorage.getItem("miniDelCode");
    if (savedCode) codeInput.value = savedCode;
  
    const savedOutput = localStorage.getItem("miniDelOutput");
    if (savedOutput) outputContent.textContent = savedOutput;
  });
