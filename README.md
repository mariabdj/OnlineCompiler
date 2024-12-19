# ✨ **miniDEL Compiler** ✨  
*Online compiler for the miniDEL language.*

---

## 📚 **Overview**  
This repository contains my **miniDEL compiler**, developed as part of a course project for the **Compilation Module** at Université des Sciences et de la Technologie Houari Boumediene. The project implements a **lexical analyzer** (using FLEX), a **syntax-semantic analyzer** (using BISON), and other essential components of a compiler.  

The miniDEL language is specifically designed for learning purposes and offers a minimalistic yet powerful syntax. This repository includes:  
- A complete **compiler** for miniDEL.  
- A customizable **frontend interface** showcasing interactive buttons and loaders.  
- A **server-side** deployment for real-world testing.

---

## ✨ **Features of miniDEL**  
### 📋 **Language Description**  
- **Program Structure**:  
  ```plaintext
  PROGRAMME Name
  VAR {
      Variable declarations
  }
  BEGIN
      Code block
  END.
  ```
- **Variable Types**:  
  - `INTEGER`: Signed or unsigned integers.  
  - `FLOAT`: Floating-point numbers, signed or unsigned.  

- **Operators**:  
  - Arithmetic: `+`, `-`, `*`, `/`  
  - Logical: `&&`, `||`, `!`  
  - Comparison: `>`, `<`, `>=`, `<=`, `==`, `!=`  

- **Key Constructs**:  
  - Loops (`FOR`, `WHILE`)  
  - Conditions (`IF-ELSE`)  
  - Input/Output (`writeln`, `readln`)  

### ⚠️ **Semantic Error Examples**  
```plaintext
PROGRAMME Exem
VAR{
    INTEGER a, b, x;
    FLOAT c;
    CONST pi = 3.14;
    FLOAT F[1.2]; // Invalid value for size
    CONST h = (-5.6);
    INTEGER c; // Duplicate declaration
}
BEGIN
    a = 0;
    b = a + z; // Error: Undeclared variable "z"
    tableau[11] = 10; // Error: Out-of-bounds index
    pi = 3.15; // Error: Assigning to a constant
    c = a / 0; // Error: Division by zero
END.
```

---

## 💻 **Technology Stack**  
- **Frontend**:  
  - Buttons and loaders created using [Uiverse](https://uiverse.io/).  
  - Code editor powered by the **CodeMirror** library (`simple.js` included from their GitHub).  

- **Backend**:  
  - Built with **Node.js** (`server.js`).  
  - Deployed using [Render](https://render.com/) (free tier).  

---

## 🚀 **How to Try**  
Visit the [miniDEL Online Compiler](https://mariabdj.github.io/OnlineCompiler/) and paste the following sample code to test the compiler or the previous exemple:

```plaintext
PROGRAMME Exem
VAR{
    INTEGER a, b;
}
BEGIN
    a = 5;
    b = a * 10;
    writeln('hello');
END.
```

See the results directly in your browser!

---

## 🌈 **Feedback and Contributions**  
I welcome all suggestions and feedback, whether it’s about **code optimization**, **frontend design**, or **compiler functionality**. Feel free to open an issue or submit a pull request!  

---

## ✨ **Credits**  
This project was completed as part of the **Compilation Module** for the 2024/2025 academic year at Université des Sciences et de la Technologie Houari Boumediene. 


