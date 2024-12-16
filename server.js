
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware configuration
app.use(cors({ origin: '*', methods: ['GET', 'POST'], allowedHeaders: ['Content-Type'] }));
app.use(bodyParser.json());

// Ensure miniDEL executable path is correct
const miniDELPath = path.resolve(__dirname, 'miniDEL'); // Remove .exe for Linux compatibility

// Endpoint to compile code
app.post('/compile', async (req, res) => {
  console.log('POST /compile called');
  const code = req.body.code;

  if (!code) {
    console.error('No code provided!');
    return res.status(400).json({ output: 'Error: No code provided!' });
  }

  try {
    // Save code to a temporary file
    const tempFilePath = path.resolve(__dirname, 'tempCode.txt');
    fs.writeFileSync(tempFilePath, code);

    // Add execute permissions for miniDEL
    exec(`chmod +x ${miniDELPath}`, (chmodError) => {
      if (chmodError) {
        console.error('chmod error:', chmodError.message);
        return res.status(500).json({ output: `Error: ${chmodError.message}` });
      }

      // Execute the code using the external program
      const command = `${miniDELPath} < ${tempFilePath}`;
      exec(command, { shell: true, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
        fs.unlinkSync(tempFilePath); // Clean up temporary file

        if (error) {
          console.error('Command execution error:', error.message);
          return res.status(500).json({ output: `Error: ${error.message}` });
        }

        console.log('Command executed successfully.');
        res.status(200).json({ output: stdout || stderr || 'No output generated.' });
      });
    });
  } catch (error) {
    console.error('Error during command execution:', error.message);
    return res.status(500).json({ output: 'Error: Internal server error.' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => res.status(200).json({ message: 'Server is running!' }));

// Start the server
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));

