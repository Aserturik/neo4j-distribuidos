require("dotenv").config();
const express = require("express");
const neo4j = require("neo4j-driver");
const { Pool } = require('pg');
const app = express();
const PORT = process.env.EXPRESS_PORT || 3000;

// Connect to Neo4j with environment variables
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD),
);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://myuser:mypassword@postgres:5432/etl_data'
});

// Endpoint para crear la tabla etl_data
app.post('/api/create-table', async (req, res) => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS etl_data (
        id TEXT PRIMARY KEY,
        nombre TEXT,
        popularidad INTEGER,
        clasificacion_popularidad TEXT,
        velocidad INTEGER,
        clasificacion_velocidad TEXT,
        paradigma TEXT,
        año_creacion INTEGER,
        eficiencia NUMERIC
      );
    `;
    await pool.query(createTableQuery);
    res.status(200).json({
      success: true,
      message: 'Tabla etl_data creada exitosamente.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
jj   });
  }
});

// Ejemplo de endpoint para probar la conexión a la base de datos
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API Endpoint to Get lenguajes
app.get("/api/extract", async (req, res) => {
  const session = driver.session();

  // Función para convertir un string a camelCase
  const toCamelCase = (str) => {
    return str
      .toLowerCase()
      .split(" ")
      .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
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
      const id = record.get("id");
      const nombre = record.get("nombre");

      // Convertir valores BigInt a Number para evitar errores de tipo
      const popularidad = Number(record.get("popularidad"));
      const velocidad = Number(record.get("velocidad"));
      const año_creacion = Number(record.get("año_creacion"));

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
        paradigma: record.get("paradigma"),
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
