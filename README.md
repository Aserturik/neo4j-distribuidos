// Cargar Pokémon con todas las propiedades
LOAD CSV WITH HEADERS FROM 'file:///pokemon.csv' AS row
CREATE (p:Pokemon {
  id: toInteger(row.id),
  name: row.name,
  height: toFloat(row.height),
  weight: toFloat(row.weight),
  hp: toInteger(row.hp),
  attack: toInteger(row.attack),
  defense: toInteger(row.defense),
  s_attack: toInteger(row.s_attack),
  s_defense: toInteger(row.s_defense),
  speed: toInteger(row.speed),
  evo_set: toInteger(row.evo_set),
  info: row.info
});

// Crear nodos de Tipo y relaciones
LOAD CSV WITH HEADERS FROM 'file:///pokemon.csv' AS row
WITH row, split(row.type, ',') AS tipos
UNWIND tipos AS tipo
MERGE (t:Type {name: trim(tipo)})
WITH t, row
MATCH (p:Pokemon {id: row.id})
MERGE (p)-[:HAS_TYPE]->(t);

// Opcional: Crear relaciones de evolución (si tienes datos de evoluciones)
// Ejemplo si "evo_set" representa un grupo de evolución:
MATCH (p1:Pokemon {evo_set: 1}), (p2:Pokemon {evo_set: 1})
WHERE p1.id < p2.id
MERGE (p1)-[:EVOLVES_TO]->(p2);
