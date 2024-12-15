const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware configuration
app.use(cors({ origin: '*', methods: ['GET', 'POST'], allowedHeaders: ['Content-Type'] }));
app.use(bodyParser.json());

// Helper function to create unique temp file paths
const createTempFilePath = () => {
  const timestamp = Date.now();
  return path.join(__dirname, `temp_code_${timestamp}.txt`);
};

// Endpoint to compile code
app.post('/compile', async (req, res) => {
  console.log('POST /compile called');
  const code = req.body.code;

  if (!code) {
    console.error('No code provided!');
    return res.status(400).json({ output: 'Error: No code provided!' });
  }

  const tempFilePath = createTempFilePath();

  try {
    // Write code to a temporary file
    fs.writeFileSync(tempFilePath, code);
    console.log(`Code saved to temp file at ${tempFilePath}.`);

    // Execute command using miniDEL compiler
    const command = `./miniDEL < ${tempFilePath}`;
    exec(command, { shell: true, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      // Clean up temp file
      fs.unlinkSync(tempFilePath);

      if (error) {
        console.error('Command execution error:', error.message);
        return res.status(500).json({ output: `Error: ${error.message}` });
      }

      console.log('Command executed successfully.');
      res.status(200).json({ output: stdout || stderr || 'No output generated.' });
    });
  } catch (error) {
    console.error('Error handling file operations or executing command:', error.message);
    return res.status(500).json({ output: 'Error: Internal server error.' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => res.status(200).json({ message: 'Server is running!' }));

// Start the server
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
