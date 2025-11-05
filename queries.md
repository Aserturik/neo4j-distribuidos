
| Comando Cypher                 | ¿Para qué sirve?                                                    | Ejemplo simple                                         |
| ------------------------------ | ------------------------------------------------------------------- | ------------------------------------------------------ |
| **MATCH**                      | Busca nodos o relaciones ya existentes en el grafo                  | `MATCH (l:Lenguaje)`                                   |
| **CREATE**                     | Crea **nuevos nodos o relaciones** sin verificar existencia previa  | `CREATE (p:Paradigma {nombre: "Functional"})`          |
| **MERGE**                      | Busca una entidad y **si no existe la crea** (Evita duplicados)     | `MERGE (p:Paradigma {nombre: "Object-Oriented"})`      |
| **SET**                        | Modifica o agrega propiedades a nodos o relaciones existentes       | `SET l.anio = 1995`                                    |
| **DELETE**                     | Elimina nodos o relaciones (⚠ requiere eliminar relaciones primero) | `DELETE l`                                             |
| **DETACH DELETE**              | Elimina un nodo **y todas sus relaciones asociadas**                | `DETACH DELETE l`                                      |
| **RETURN**                     | Muestra resultados de la consulta                                   | `RETURN l.nombre`                                      |
| **ORDER BY**                   | Ordena resultados ascendentes o descendentes                        | `ORDER BY l.nombre DESC`                               |
| **WHERE**                      | Filtra resultados según condiciones                                 | `WHERE l.anio > 2000`                                  |
| **WITH**                       | Permite encadenar operaciones y procesar datos en pasos             | `WITH l.nombre AS nombre`                              |
| **UNWIND**                     | Convierte una lista en filas para crear múltiples nodos/relaciones  | `UNWIND paradigmas AS p`                               |
| **LOAD CSV**                   | Importa datos desde archivos CSV/TSV externos                       | `LOAD CSV WITH HEADERS FROM 'file:///file.tsv' AS row` |
| **COUNT()**                    | Cuenta elementos retornados                                         | `RETURN COUNT(l)`                                      |
| **DISTINCT**                   | Elimina duplicados en resultados                                    | `RETURN DISTINCT t.nombre`                             |
| **REMOVE**                     | Borra una propiedad o etiqueta                                      | `REMOVE l.anio`                                        |
|**CALL {}** *(procedimientos)* | Ejecuta funciones y plugins de Neo4j                                | `CALL db.schema.visualization()`                       |


