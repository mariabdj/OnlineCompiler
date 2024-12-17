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
try {
  if (!fs.existsSync(miniDELPath)) {
    console.error("Error: miniDEL executable not found at", miniDELPath);
    process.exit(1);
  }
  fs.chmodSync(miniDELPath, "755"); // Grant read, write, and execute permissions to owner, and read+execute to others
} catch (err) {
  console.error("Error setting permissions for miniDEL:", err);
  process.exit(1);
}

// Enhanced logging for debugging
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url} at ${new Date().toISOString()}`);
  next();
});

app.post("/compile", async (req, res) => {
  const code = req.body.code;
  if (!code) {
    console.error("Error: No code provided in request body.");
    return res.status(400).json({ output: "Error: No code provided!" });
  }

  try {
    const tempFilePath = path.resolve(__dirname, "tmp.txt");
    fs.writeFileSync(tempFilePath, code, { mode: 0o644 }); // Ensure the file is readable by all and writable by owner

    const command = `./miniDEL tmp.txt`; // Use the file as a direct argument

    console.log("Executing command:", command);
    const startTime = Date.now();

    exec(command, { cwd: __dirname, shell: true, maxBuffer: 1024 * 1024, timeout: 60000 }, (error, stdout, stderr) => {
      const executionTime = Date.now() - startTime;
      console.log(`Command executed in ${executionTime}ms.`);
      fs.unlinkSync(tempFilePath); // Clean up the temporary file

      if (error) {
        console.error("Command execution error:", error);
        return res.status(500).json({ output: `Error: ${error.message}` });
      }

      res.status(200).json({ output: stdout || stderr || "No output generated." });
    });
  } catch (err) {
    console.error("Unexpected server error:", err);
    res.status(500).json({ output: "Error: Internal server error." });
  }
});

app.get("/health", (req, res) => res.status(200).json({ message: "Server is running!" }));

// Enhanced server startup logging
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT} at ${new Date().toISOString()}`));
