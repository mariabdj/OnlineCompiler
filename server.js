// Updated server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware configuration
app.use(cors({ origin: "*" })); // Allow cross-origin requests
app.use(bodyParser.json());

// Path to miniDEL executable
const miniDELPath = path.resolve(__dirname, "miniDEL");

// Ensure miniDEL has the necessary permissions
try {
  if (!fs.existsSync(miniDELPath)) {
    console.error("Error: miniDEL executable not found at", miniDELPath);
    process.exit(1);
  }
  fs.chmodSync(miniDELPath, 0o755); // Ensure the executable is readable and executable
} catch (err) {
  console.error("Error setting permissions for miniDEL:", err);
  process.exit(1);
}

// Compilation endpoint
app.post("/compile", async (req, res) => {
  const code = req.body.code;

  if (!code) {
    console.error("Error: No code provided in the request body.");
    return res.status(400).json({ output: "Error: No code provided!" });
  }

  const tempFilePath = path.resolve(__dirname, "tempCode.txt");

  try {
    // Write code to temporary file
    fs.writeFileSync(tempFilePath, code, { mode: 0o644 }); // Ensure file has proper permissions

    const command = `./miniDEL ${tempFilePath}`; // Execute miniDEL with the file
    console.log(`Executing command: ${command}`);

    exec(
      command,
      { cwd: __dirname, shell: true, maxBuffer: 1024 * 1024 },
      (error, stdout, stderr) => {
        fs.unlinkSync(tempFilePath); // Clean up the temporary file
        if (error) {
          console.error("Execution error:", error.message);
          return res
            .status(500)
            .json({ output: `Execution error: ${stderr || error.message}` });
        }

        console.log("Command output:", stdout || stderr);
        res.status(200).json({ output: stdout || stderr || "No output generated." });
      }
    );
  } catch (err) {
    console.error("Unexpected server error:", err.message);
    res.status(500).json({ output: "Error: Internal server error." });
  }
});

// Health check endpoint
app.get("/health", (req, res) => res.status(200).json({ message: "Server is running!" }));

// Start the server
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
