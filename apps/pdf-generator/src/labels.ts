const categoryLabels = new Map<string, string>([
  ["cpp", "C++"],
  ["java", "Java"],
  ["php", "PHP"],
  ["python", "Python"],
  ["sql", "SQL"],
]);

const sectionLabels = new Map<string, string>([
  ["advanced", "Tecniche avanzate"],
  ["aggregation", "Aggregazione"],
  ["basics", "Le basi"],
  ["data-manipulation", "Modifica dei dati"],
  ["data-structures", "Strutture dati"],
  ["database", "Database"],
  ["design", "Progettazione"],
  ["ecosystem", "Ecosistema"],
  ["errors", "Gestione degli errori"],
  ["flow-control", "Controllo del flusso"],
  ["functions", "Funzioni"],
  ["graphics", "Grafica e interfacce"],
  ["input-output", "Input e output"],
  ["joins-subqueries", "Join e sottoquery"],
  ["memory", "Memoria"],
  ["modules-and-stdlib", "Moduli e libreria standard"],
  ["oop", "Programmazione a oggetti"],
  ["operations", "Operativita"],
  ["programming", "Programmazione"],
  ["queries", "Query"],
  ["reading-data", "Lettura dei dati"],
  ["tools", "Strumenti"],
  ["transactions", "Transazioni"],
  ["web", "Applicazioni web"],
]);

export function labelCategory(slug: string): string {
  return categoryLabels.get(slug) ?? titleize(slug);
}

export function labelSection(slug: string): string {
  return sectionLabels.get(slug) ?? titleize(slug);
}

export function titleize(slug: string): string {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}
