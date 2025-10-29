## Índices recomendados (ejecuta una sola vez)

```cypher
CREATE INDEX IF NOT EXISTS FOR (l:Lenguaje) ON (l.name);
CREATE INDEX IF NOT EXISTS FOR (p:Paradigma) ON (p.nombre);
CREATE INDEX IF NOT EXISTS FOR (t:Tipo) ON (t.nombre);
```


