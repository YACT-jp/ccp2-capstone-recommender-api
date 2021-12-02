const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Server Middleware
app.use(cors());
app.use(express.json());

// API Basic Interface
app.get("/", (req, res) => {
  res.status(200).sendFile(path.resolve(__dirname, "api.html"));
});

/* Query Endpoint */
// Takes the User ID and makes calls to the ML model
app.get("/recommender", async (req, res) => {
  const { user_id } = req.body;

  console.log(user_id);
  let result = "Testing!";

  res.status(200).json(result);
});

(() => {
  try {
    app.listen(process.env.PORT || 3000, () => {
      if (process.env.PORT) {
        console.log(`API listening on port ${process.env.PORT}!`);
      } else {
        console.log(`Server running on http://localhost:3000`);
      }
    });
  } catch (err) {
    console.error("Error starting API!", err);
    process.exit(-1);
  }
})();
