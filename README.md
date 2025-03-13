paso 1

### copiar el dataset a la carpeta csv

docker-compose up --build -d

docker exec -it alex-database-neo4j cypher-shell -u neo4j -p 12345678

LOAD CSV WITH HEADERS FROM 'file:///Dataset-Programacion.csv'
             AS row
             CREATE (:Lenguaje {
                 id: row.id,
                 nombre: row.nombre,
                 popularidad: toInteger(row.popularidad),
                 velocidad: toInteger(row.velocidad),
                 paradigma: row.paradigma,
                 año_creacion: toInteger(row.año_creacion)
             });


