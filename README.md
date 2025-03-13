# Proyecto ETL: Neo4j, Express y PostgreSQL

Este proyecto implementa un proceso ETL que extrae datos de Neo4j, los transforma y los carga en una base de datos PostgreSQL. Además, permite exportar los datos cargados a un archivo CSV.

## Requisitos

- Docker y Docker Compose instalados en tu máquina.
- Archivo de dataset: `Dataset-Programacion.csv`.
- La carpeta `csv` debe existir en la raíz del proyecto y contener el dataset.

## Estructura de Contenedores

El archivo `docker-compose.yml` levanta tres servicios:
- **Neo4j:** Para almacenar y consultar los datos originales.
- **PostgreSQL:** Para la persistencia de los datos transformados.
- **Backend (Express):** Para orquestar el proceso ETL y exponer los endpoints.

## Pasos para Ejecutar el Proceso ETL

### 1. Preparar el Dataset

Copia el archivo `Dataset-Programacion.csv` a la carpeta `csv` del proyecto.

### 2. Levantar los Contenedores

Desde la raíz del proyecto, ejecuta:

```bash
docker-compose up --build -d
```

Esto construirá y levantará los servicios definidos en el `docker-compose.yml`.

### 3. Cargar Datos en Neo4j

Accede al contenedor de Neo4j y abre el Cypher Shell:

```bash
docker exec -it alex-database-neo4j cypher-shell -u neo4j -p 12345678
```

Dentro del shell, ejecuta la siguiente consulta para cargar el dataset:

```cypher
LOAD CSV WITH HEADERS FROM 'file:///Dataset-Programacion.csv' AS row
CREATE (:Lenguaje {
    id: row.id,
    nombre: row.nombre,
    popularidad: toInteger(row.popularidad),
    velocidad: toInteger(row.velocidad),
    paradigma: row.paradigma,
    año_creacion: toInteger(row.año_creacion)
});
```

### 4. Crear la Tabla en PostgreSQL

Con el backend Express corriendo, crea la tabla `etl_data` en PostgreSQL mediante el siguiente endpoint:

```bash
curl -X POST http://localhost:3000/api/create-table
```

### 5. Ejecutar el Proceso ETL

Carga los datos transformados desde Neo4j hacia PostgreSQL usando el endpoint de ETL:

```bash
curl -X POST http://localhost:3000/api/extract-and-load
```

*Nota:* Si necesitas ejecutar el proceso más de una vez, repite el comando anterior.

### 6. Exportar los Datos a un CSV

Una vez cargados los datos en PostgreSQL, descarga el archivo CSV generado con:

```bash
curl -o etl_data.csv http://localhost:3000/api/export-csv
```

El archivo `etl_data.csv` se guardará en tu directorio actual.

## Notas Adicionales

- Verifica que las variables de entorno en el archivo `.env` (utilizado por Docker Compose) estén configuradas correctamente para conectar con los servicios.
- El comando `docker-compose up --build -d` levanta todos los contenedores en segundo plano.
- Asegúrate de que la ruta utilizada en el comando `COPY` de PostgreSQL tenga los permisos necesarios y esté correctamente mapeada en el volumen.

