require("dotenv").config();
const express = require("express");
const neo4j = require("neo4j-driver");

const app = express();
const PORT = process.env.EXPRESS_PORT || 3000;

// Connect to Neo4j with environment variables
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD),
);

// API Endpoint to Get lenguajes
app.get("/api/extract", async (req, res) => {
  const session = driver.session();

  // Función para convertir un string a camelCase
  const toCamelCase = (str) => {
    return str
      .toLowerCase()
      .split(" ")
      .map((word, index) => {
        return index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join("");
  };

  try {
    // Consulta para obtener los nodos de Lenguaje
    const result = await session.run(`
      MATCH (l:Lenguaje)
      RETURN 
        l.id AS id, 
        l.nombre AS nombre, 
        l.popularidad AS popularidad, 
        l.velocidad AS velocidad, 
        l.paradigma AS paradigma, 
        l.año_creacion AS año_creacion
    `);

    const lenguajes = result.records.map(record => {
      // Obtenemos cada propiedad del registro
      const id = record.get("id");
      const nombre = record.get("nombre");
      const popularidad = record.get("popularidad");
      const velocidad = record.get("velocidad");
      const paradigma = record.get("paradigma");
      const año_creacion = record.get("año_creacion");

      // Convertir el nombre a camelCase
      const nombreCamel = toCamelCase(nombre);

      // Clasificar la popularidad
      const clasificacionPopularidad = popularidad < 30 
        ? "Poco Usado" 
        : (popularidad <= 70 ? "Moderado" : "Muy Popular");

      // Clasificar la velocidad
      const clasificacionVelocidad = velocidad < 40 
        ? "Lento" 
        : (velocidad <= 70 ? "Rápido" : "Muy Rápido");

      // Calcular el índice de eficiencia
      const eficiencia = (popularidad + velocidad) / 2;

      return {
        id,
        nombre: nombreCamel,
        popularidad,
        clasificacionPopularidad,
        velocidad,
        clasificacionVelocidad,
        paradigma,
        año_creacion,
        eficiencia
      };
    });

    res.json({
      success: true,
      count: lenguajes.length,
      data: lenguajes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  } finally {
    await session.close();
  }
});
// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
