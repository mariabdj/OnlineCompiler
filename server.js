// server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware configuration
app.use(cors({ origin: "*", methods: ["GET", "POST"], allowedHeaders: ["Content-Type"] }));
app.use(bodyParser.json());
app.options("/compile", cors());

const miniDELPath = path.resolve(__dirname, "miniDEL");

// Ensure miniDEL has the necessary permissions
if (!fs.existsSync(miniDELPath)) {
  console.error(`Error: miniDEL executable not found at ${miniDELPath}`);
  process.exit(1);
}
fs.chmodSync(miniDELPath, "755"); // Set executable permissions

// Enhanced logging middleware
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url} at ${new Date().toISOString()}`);
  next();
});

// Vérification des dépendances ici
exec(`ldd ./miniDEL`, (error, stdout, stderr) => {
  if (error) {
    console.error("Error checking miniDEL dependencies:", error.message);
    console.error("stderr:", stderr);
  } else {
    console.log("miniDEL dependencies:");
    console.log(stdout);
  }
});

// Compilation route
app.post("/compile", async (req, res) => {
  const code = req.body.code;
  if (!code) {
    console.error("Error: No code provided in request body.");
    return res.status(400).json({ output: "Error: No code provided!" });
  }

  const tempFilePath = path.resolve(__dirname, "tmp.txt");
  try {
    fs.writeFileSync(tempFilePath, code, { mode: 0o644 });

    console.log("Temporary file contents:", fs.readFileSync(tempFilePath, "utf-8"));


    const command = `./miniDEL < tmp.txt`;

    console.log("Executing command:", command);

    exec(command, { cwd: __dirname, timeout: 10000 }, (error, stdout, stderr) => {
      fs.unlinkSync(tempFilePath); // Clean up temp file

      if (error) {
        console.error("Execution error:", error);
        return res.status(500).json({ output: `Execution error: ${error.message}` });
      }

      const output = stdout || stderr || "No output generated.";
      console.log("Command output:", output);
      res.status(200).json({ output });
    });
  } catch (err) {
    console.error("Unexpected server error:", err);
    res.status(500).json({ output: "Internal server error." });
  }
});

// Health check route
app.get("/health", (req, res) => res.status(200).json({ message: "Server is running!" }));

// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT} at ${new Date().toISOString()}`));
