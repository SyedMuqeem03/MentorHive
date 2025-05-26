import express from 'express';
import cors from 'cors';
import { Groq } from 'groq-sdk';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Initialize Groq with your API key
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "MENTOR_AI",
  dangerouslyAllowBrowser: true // Add this if you want to test direct browser access
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Create the chat API endpoint
app.post('/api/chat', async (req, res) => {
  try {
    // Get the request body
    const { messages, model, temperature, max_tokens } = req.body;
    
    // Validate required fields
    if (!messages) {
      res.status(400).send('Missing messages');
      return;
    }
    
    // Configure response for streaming
    res.setHeader('Content-Type', 'text/plain');
    res.flushHeaders();
    
    // Create chat completion with streaming
    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: model || "llama3-8b-8192",
      temperature: temperature || 0.7,
      max_tokens: max_tokens || 1024,
      stream: true
    });
    
    // Stream the response back to the client
    for await (const chunk of chatCompletion) {
      const content = chunk.choices[0]?.delta?.content || '';
      res.write(content);
      // Make sure the content is sent immediately
      if (content && res.flush) res.flush();
    }
    
    res.end();
    
  } catch (error) {
    console.error('Error calling Groq API:', error);
    // If headers have not been sent yet, send error response
    if (!res.headersSent) {
      res.status(500).send(`Error: ${error.message}`);
    } else {
      // Otherwise just end the response
      res.end(`Error: ${error.message}`);
    }
  }
});

// Add a test endpoint to verify the server is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API server is running' });
});

// For all routes, send the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});

// filepath: c:\Users\Public\Personal\imp\AI\project\package.json
{
  "scripts": {
    // Your existing scripts...
    "start": "node server.js"
  }
}