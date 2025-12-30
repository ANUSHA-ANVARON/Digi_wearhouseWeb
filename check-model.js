
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
// using the model that didn't 403
const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

console.log("Checking Model Capabilities...");

async function checkModel() {
  try {
    const payload = {
      contents: [{
        parts: [{ text: "Can you generate images? Please reply with YES or NO and a brief explanation." }]
      }]
    };

    const response = await axios.post(URL, payload);
    console.log("Response Status:", response.status);
    console.log("Full Response:", JSON.stringify(response.data, null, 2));

    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log("\n--- MODEL REPLY ---");
    console.log(text);

  } catch (error) {
    console.error("Error:", error.message);
    if (error.response) {
       console.error("API Error Body:", JSON.stringify(error.response.data, null, 2));
    }
  }
}

checkModel();
