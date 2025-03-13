require("dotenv").config();
const express = require("express");
const neo4j = require("neo4j-driver");
const { Pool } = require('pg');
const app = express();
const PORT = process.env.EXPRESS_PORT || 3000;
const fs = require('fs');
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
    });
  }
});


app.post('/api/extract-and-load', async (req, res) => {
  try {
    // Endpoint externo que devuelve la información en JSON
    const externalEndpoint = 'http://backend:3000/api/extract'; // Reemplaza con el correcto

    // Obtener datos desde el endpoint
    const response = await fetch(externalEndpoint);
    const jsonData = await response.json();

    if (!jsonData.success) {
      throw new Error('Error obteniendo datos del endpoint externo');
    }

    // Preparar datos para inserción
    const insertQuery = `
      INSERT INTO etl_data (id, nombre, popularidad, clasificacion_popularidad, 
                            velocidad, clasificacion_velocidad, paradigma, año_creacion, eficiencia)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO NOTHING;
    `;

    for (const item of jsonData.data) {
      await pool.query(insertQuery, [
        item.id,
        item.nombre,
        item.popularidad,
        item.clasificacionPopularidad,
        item.velocidad,
        item.clasificacionVelocidad,
        item.paradigma,
        item.año_creacion,
        item.eficiencia
      ]);
    }

    res.status(200).json({
      success: true,
      message: `Datos insertados correctamente (${jsonData.data.length} registros)`
    });
  } catch (error) {
    console.error('Error en ETL:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint para exportar la data a un CSV y enviarlo como descarga
app.get('/api/export-csv', async (req, res) => {
  try {
    // Definir la ruta donde se creará el CSV en el contenedor
    const filePath = '/var/lib/postgresql/data/etl_data.csv';

    // Ejecutar el comando COPY para generar el CSV
    await pool.query(`
      COPY etl_data TO '${filePath}' WITH CSV HEADER;
    `);

    // Leer el archivo CSV y enviarlo como descarga
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error leyendo el archivo CSV:', err);
        return res.status(500).send('Error leyendo el archivo CSV');
      }
      res.setHeader('Content-Disposition', 'attachment; filename=etl_data.csv');
      res.setHeader('Content-Type', 'text/csv');
      res.send(data);
    });
  } catch (error) {
    console.error('Error exportando CSV:', error);
    res.status(500).send(error.message);
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
