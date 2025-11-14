// // server.js
// import 'dotenv/config';
// import express from "express";
// import cors from "cors";
// import handler from "./api/drape-saree-parts.js"; // import your function

// console.log('Cloudinary Name:', process.env.CLOUDINARY_CLOUD_NAME);
// console.log('Gemini Key:', process.env.GEMINI_API_KEY);

// const app = express();

// // CORS middleware
// app.use(cors());

// // Wrap Next.js-style handler into Express
// app.post("/api/drape-saree-parts", (req, res) => {
//   handler(req, res);
// });

// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`✅ Backend running at http://localhost:${PORT}`);
// });
