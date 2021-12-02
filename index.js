const express = require("express");
const cors = require("cors");
const path = require("path");
const axios = require("axios");

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

  retrieval_body = {
    instances: [user_id],
  };

  const retrieval = await axios.default.post(
    "https://ccp2-capstone-ml-models-retrival-cr-yxiyypij7a-an.a.run.app/v1/models/retrieval:predict",
    retrieval_body
  );

  const ranking_body = {
    instances: [],
  };

  for (media of retrieval.data.predictions[0].output_2) {
    ranking_body.instances.push({
      movie_title: media,
      user_id: user_id,
    });
  }

  const ranking = await axios.default.post(
    "https://ccp2-capstone-ml-models-ranking-cr-yxiyypij7a-an.a.run.app//v1/models/ranking:predict",
    ranking_body
  );

  const media_and_ranking = [];

  for (let i = 0; i < retrieval.data.predictions[0].output_2.length; i++) {
    media_and_ranking.push({
      media: retrieval.data.predictions[0].output_2[i],
      ranking: ranking.data.predictions[i][0],
    });
  }

  const compareRanking = (a, b) => {
    if (a.ranking < b.ranking) return 1;
    if (a.ranking > b.ranking) return -1;
    if (a.ranking === b.ranking) return 0;
  };

  sorted_media_and_ranking = media_and_ranking.sort(compareRanking);

  const results = [];

  for (item of sorted_media_and_ranking) {
    results.push(item.media);
  }

  if (results.length < 10) {
    res.status(400).json([]);
  } else {
    res.status(200).json(results);
  }
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
