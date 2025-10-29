
## ✅ 1️⃣ Antes de comenzar

📍 Colocar el archivo `languages.tsv` en:

```
Neo4j/import/languages.tsv
```

Formato: **TSV** con columnas seleccionadas:

| name | first_release | paradigms | types |

`paradigms` y `types` vienen como listas en texto, separadas por coma.

---

## 🗑️ 2️⃣ Eliminar datos anteriores (si existen)

```cypher
MATCH (n)
DETACH DELETE n;
```

---

## 🧱 3️⃣ Crear constraints (evita duplicados)

```cypher
CREATE CONSTRAINT IF NOT EXISTS FOR (l:Lenguaje) REQUIRE l.nombre IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (p:Paradigma) REQUIRE p.nombre IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (t:Tipo) REQUIRE t.nombre IS UNIQUE;
```

---

## 🚀 4️⃣ Importación del dataset

### ✅ Crear nodos Lenguaje

```cypher
LOAD CSV WITH HEADERS FROM 'file:///languages.tsv' AS row FIELDTERMINATOR '\t'
MERGE (l:Lenguaje {nombre: row.name})
SET l.anio = toInteger(row.first_release);
```

---

### ✅ Crear nodos Paradigma y relaciones

```cypher
LOAD CSV WITH HEADERS FROM 'file:///languages.tsv' AS row FIELDTERMINATOR '\t'
WITH row, split(row.paradigms, ',') AS paradigmas
MATCH (l:Lenguaje {nombre: row.name})
UNWIND paradigmas AS paradigma
WITH l, trim(paradigma) AS p
WHERE p <> ""
MERGE (par:Paradigma {nombre: p})
MERGE (l)-[:USA_PARADIGMA]->(par);
```

---

### ✅ Crear nodos Tipo y relaciones

```cypher
LOAD CSV WITH HEADERS FROM 'file:///languages.tsv' AS row FIELDTERMINATOR '\t'
WITH row, split(row.types, ',') AS tipos
MATCH (l:Lenguaje {nombre: row.name})
UNWIND tipos AS tipo
WITH l, trim(tipo) AS t
WHERE t <> ""
MERGE (tip:Tipo {nombre: t})
MERGE (l)-[:USA_TIPO]->(tip);
```

---

## 🧹 5️⃣ Limpieza y normalización


```cypher
MATCH (n)
WHERE n.nombre IS NOT NULL
SET n.nombre = replace(replace(replace(replace(n.nombre, "'", ""), "\"", ""), "[", ""), "]", "");

```
---

### 🔹 Eliminar nodos vacíos by accident

```cypher
MATCH (n:Paradigma)
WHERE n.nombre IS NULL OR n.nombre = ""
DETACH DELETE n;

MATCH (n:Tipo)
WHERE n.nombre IS NULL OR n.nombre = ""
DETACH DELETE n;
```

---
## 6️⃣ Consultas útiles de análisis

### Lenguajes con sus paradigmas

```cypher
MATCH (l:Lenguaje)-[:USA_PARADIGMA]->(p:Paradigma)
RETURN l.nombre, collect(p.nombre) AS paradigmas LIMIT 50;
```

### Cuántos lenguajes por paradigma

```cypher
MATCH (p:Paradigma)<-[:USA_PARADIGMA]-(l:Lenguaje)
RETURN p.nombre AS paradigma, COUNT(l) AS cantidad
ORDER BY cantidad DESC;
```

### Tipos más comunes

```cypher
MATCH (t:Tipo)<-[:USA_TIPO]-(l:Lenguaje)
RETURN t.nombre AS tipo, COUNT(l) AS cantidad
ORDER BY cantidad DESC;
```

### Tipos y paradigmas de un lenguaje

```cypher
MATCH (l:Lenguaje {nombre: "Rust"})
OPTIONAL MATCH (l)-[:USA_PARADIGMA]->(p)
OPTIONAL MATCH (l)-[:USA_TIPO]->(t)
RETURN l.nombre AS lenguaje,
       collect(DISTINCT p.nombre) AS paradigmas,
       collect(DISTINCT t.nombre) AS tipos;
```

---
