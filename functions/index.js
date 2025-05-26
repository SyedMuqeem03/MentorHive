const functions = require('firebase-functions');
const { Groq } = require('groq-sdk');
const cors = require('cors')({origin: true});

// Initialize Groq with your API key
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "MENTOR_AI"
});

// Create the chat API endpoint
exports.chat = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  return cors(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }
    
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
      res.setHeader('Transfer-Encoding', 'chunked');
      
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
      }
      
      res.end();
      
    } catch (error) {
      console.error('Error calling Groq API:', error);
      res.status(500).send(`Error: ${error.message}`);
    }
  });
});