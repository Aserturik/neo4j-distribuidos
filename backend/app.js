require("dotenv").config();
const express = require("express");
const neo4j = require("neo4j-driver");

const app = express();
const PORT = process.env.EXPRESS_PORT || 3000;

// Connect to Neo4j with environment variables
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

// API Endpoint to Get Movies
app.get("/movies", async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run("MATCH (m:Movie) RETURN m.title AS title LIMIT 10");
    const movies = result.records.map(record => record.get("title"));
    res.json({ movies });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
