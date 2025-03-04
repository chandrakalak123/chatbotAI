const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

const genAI = new GoogleGenerativeAI("AIzaSyCfSqgOm7Hp0rKxi_AeL_4YHPRnCdF0gIo",{
  apiVersion: "v1"  // Ensure stable version
});

// Use a known model such as 'text-bison'
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
app.post('/api/query', async (req, res) => {
  const { message } = req.body;

  try {
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: message }],
        },
        {
          role: "model",
          parts: [{ text: "You are AI assistant helping the user query's to answer queries. add hyperlinks as well if needed " }],
        },
      ],
    });

    let result = await chat.sendMessage(message);
    // console.log(result.response.text());
    res.json({ text: result.response.candidates[0].content.parts[0].text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
