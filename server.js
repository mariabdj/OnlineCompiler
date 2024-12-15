const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(cors({ origin: "*", methods: ["GET", "POST"], allowedHeaders: ["Content-Type"] }));
app.use(bodyParser.json());

app.post('/compile', async (req, res) => {
  console.log("POST /compile called");
  const code = req.body.code;

  if (!code) return res.status(400).json({ output: 'Error: No code provided!' });

  const tempFilePath = './temp_input.txt';
  try {
    fs.writeFileSync(tempFilePath, code);
    console.log("Code saved to temp file.");
  } catch (writeError) {
    console.error("Error writing to file:", writeError);
    return res.status(500).json({ output: 'Error: Unable to write to file.' });
  }

  const command = `Get-Content ${tempFilePath} | ./miniDEL`;
  exec(command, { shell: 'powershell.exe', maxBuffer: 1024 * 1024, timeout: 1000000000 }, (error, stdout, stderr) => {
    if (error) {
      console.error("Command execution error:", error.message);
      return res.status(500).json({ output: `Error: ${error.message}` });
    }

    res.status(200).json({ output: stdout || stderr || "No output generated." });
  });
});

app.get('/health', (req, res) => res.status(200).json({ message: "Server is running!" }));

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
