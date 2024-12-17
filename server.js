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

app.post("/compile", async (req, res) => {
  const code = req.body.code;
  if (!code) {
    return res.status(400).json({ output: "Error: No code provided!" });
  }

  try {
    const tempFilePath = path.resolve(__dirname, "tempCode.txt");
    fs.writeFileSync(tempFilePath, code, { mode: 0o644 }); // Ensure the file is readable by all and writable by owner

    const command = `./miniDEL ${tempFilePath}`; // Use the file as a direct argument
    exec(command, { cwd: __dirname, shell: true, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
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

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
