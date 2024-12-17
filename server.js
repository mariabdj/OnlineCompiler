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
    
      // Récupérer la sortie principale (stdout ou stderr)
      const output = stdout || stderr || "No output generated.";
    
      // Log utile pour le serveur
      console.log("Command output:", output);
    
      // Toujours envoyer la sortie à `script.js`
      if (error) {
        console.error("Execution error:", error.message);
        console.error("stderr:", stderr);
        console.error("stdout:", stdout);
    
        // Envoyer stdout avec une clé spécifique même en cas d'erreur
        return res.status(200).json({
          output,
        });
      }
    
      // Cas succès, envoyer uniquement stdout
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
