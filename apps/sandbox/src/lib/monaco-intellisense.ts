import type { EditorProps } from "@monaco-editor/react";

type MonacoInstance = Parameters<NonNullable<EditorProps["beforeMount"]>>[0];
type CompletionRange = {
  startLineNumber: number;
  endLineNumber: number;
  startColumn: number;
  endColumn: number;
};

type CompletionSeed = {
  label: string;
  kind: number;
  insertText: string;
  detail: string;
  documentation?: string;
  insertTextRules?: number;
};

const SNIPPET_RULE = 4;
const KEYWORD_KIND = 14;
const FUNCTION_KIND = 1;
const SNIPPET_KIND = 15;
const CLASS_KIND = 7;
const VARIABLE_KIND = 6;
const MODULE_KIND = 9;
const METHOD_KIND = 3;

function keyword(label: string, detail: string, insertText = label): CompletionSeed {
  return { label, kind: KEYWORD_KIND, insertText, detail };
}

function fn(label: string, insertText: string, detail: string): CompletionSeed {
  return { label, kind: FUNCTION_KIND, insertText, detail, insertTextRules: SNIPPET_RULE };
}

function snippet(label: string, insertText: string, detail: string): CompletionSeed {
  return { label, kind: SNIPPET_KIND, insertText, detail, insertTextRules: SNIPPET_RULE };
}

const phpSeeds: CompletionSeed[] = [
  snippet("<?php", "<?php\n\n$0", "PHP opening tag"),
  snippet("echo", "echo ${1:$value};", "PHP statement"),
  snippet("if", "if (${1:$condition}) {\n\t$0\n}", "PHP control flow"),
  snippet("if / else", "if (${1:$condition}) {\n\t$2\n} else {\n\t$0\n}", "PHP control flow"),
  snippet("elseif", "elseif (${1:$condition}) {\n\t$0\n}", "PHP control flow"),
  snippet(
    "switch",
    "switch (${1:$value}) {\n\tcase ${2:'value'}:\n\t\t$3\n\t\tbreak;\n\tdefault:\n\t\t$0\n}",
    "PHP control flow",
  ),
  snippet(
    "match",
    "match (${1:$value}) {\n\t${2:'key'} => ${3:'result'},\n\tdefault => ${0:null},\n};",
    "PHP expression",
  ),
  snippet("for", "for ($${1:i} = 0; $${1:i} < ${2:10}; $${1:i}++) {\n\t$0\n}", "PHP loop"),
  snippet("foreach", "foreach (${1:$items} as ${2:$item}) {\n\t$0\n}", "PHP loop"),
  snippet(
    "foreach key => value",
    "foreach (${1:$items} as ${2:$key} => ${3:$value}) {\n\t$0\n}",
    "PHP loop",
  ),
  snippet("while", "while (${1:$condition}) {\n\t$0\n}", "PHP loop"),
  snippet("do while", "do {\n\t$0\n} while (${1:$condition});", "PHP loop"),
  snippet("function", "function ${1:name}(${2:$value}): ${3:void}\n{\n\t$0\n}", "PHP function"),
  snippet("arrow function", "fn(${1:$value}) => ${0:$value}", "PHP arrow function"),
  snippet(
    "class",
    "class ${1:Name}\n{\n\tpublic function __construct(${2})\n\t{\n\t\t$0\n\t}\n}",
    "PHP class",
  ),
  snippet(
    "interface",
    "interface ${1:Name}\n{\n\tpublic function ${2:method}(${3}): ${4:void};\n}",
    "PHP interface",
  ),
  snippet("trait", "trait ${1:Name}\n{\n\t$0\n}", "PHP trait"),
  snippet(
    "try / catch",
    "try {\n\t$1\n} catch (\\${2:Throwable} $${3:e}) {\n\t$0\n}",
    "PHP exceptions",
  ),
  snippet("namespace", "namespace ${1:App};\n\n$0", "PHP namespace"),
  snippet("use", "use ${1:App\\\\ClassName};", "PHP import"),
  keyword("declare(strict_types=1);", "PHP strict types"),
  keyword("return", "PHP statement", "return "),
  keyword("break", "PHP statement", "break;"),
  keyword("continue", "PHP statement", "continue;"),
  keyword("throw", "PHP statement", "throw "),
  keyword("new", "PHP operator", "new "),
  keyword("clone", "PHP operator", "clone "),
  keyword("instanceof", "PHP operator", "instanceof "),
  keyword("extends", "PHP inheritance", "extends "),
  keyword("implements", "PHP interface implementation", "implements "),
  keyword("public", "PHP visibility", "public "),
  keyword("protected", "PHP visibility", "protected "),
  keyword("private", "PHP visibility", "private "),
  keyword("static", "PHP modifier", "static "),
  keyword("final", "PHP modifier", "final "),
  keyword("abstract", "PHP modifier", "abstract "),
  keyword("readonly", "PHP modifier", "readonly "),
  keyword("null", "PHP literal"),
  keyword("true", "PHP literal"),
  keyword("false", "PHP literal"),
  fn("strlen", "strlen(${1:$string})", "PHP string length"),
  fn("str_contains", "str_contains(${1:$haystack}, ${2:$needle})", "PHP string helper"),
  fn("str_replace", "str_replace(${1:$search}, ${2:$replace}, ${3:$subject})", "PHP string helper"),
  fn("trim", "trim(${1:$string})", "PHP string helper"),
  fn("explode", "explode(${1:','}, ${2:$string})", "PHP string helper"),
  fn("implode", "implode(${1:','}, ${2:$array})", "PHP string helper"),
  fn("count", "count(${1:$array})", "PHP array size"),
  fn("array_map", "array_map(${1:$callback}, ${2:$array})", "PHP array helper"),
  fn("array_filter", "array_filter(${1:$array}, ${2:$callback})", "PHP array helper"),
  fn("array_reduce", "array_reduce(${1:$array}, ${2:$callback}, ${3:0})", "PHP array helper"),
  fn("in_array", "in_array(${1:$needle}, ${2:$haystack}, ${3:true})", "PHP array helper"),
  fn("isset", "isset(${1:$value})", "PHP variable helper"),
  fn("empty", "empty(${1:$value})", "PHP variable helper"),
  fn("var_dump", "var_dump(${1:$value});", "PHP debug helper"),
  fn("print_r", "print_r(${1:$value});", "PHP debug helper"),
  fn("json_encode", "json_encode(${1:$value})", "PHP JSON helper"),
  fn("json_decode", "json_decode(${1:$json}, true)", "PHP JSON helper"),
  fn("file_get_contents", "file_get_contents(${1:'file.txt'})", "PHP filesystem helper"),
  fn("require", "require ${1:'file.php'};", "PHP include"),
  fn("require_once", "require_once ${1:'file.php'};", "PHP include"),
  fn("include", "include ${1:'file.php'};", "PHP include"),
  fn("include_once", "include_once ${1:'file.php'};", "PHP include"),
  {
    label: "__construct",
    kind: METHOD_KIND,
    insertText: "__construct(${1})",
    detail: "PHP magic method",
    insertTextRules: SNIPPET_RULE,
  },
  {
    label: "__toString",
    kind: METHOD_KIND,
    insertText: "__toString(): string",
    detail: "PHP magic method",
    insertTextRules: SNIPPET_RULE,
  },
  { label: "DateTime", kind: CLASS_KIND, insertText: "DateTime", detail: "PHP standard class" },
  { label: "PDO", kind: CLASS_KIND, insertText: "PDO", detail: "PHP database class" },
  { label: "Exception", kind: CLASS_KIND, insertText: "Exception", detail: "PHP exception class" },
  { label: "$_GET", kind: VARIABLE_KIND, insertText: "$_GET", detail: "PHP superglobal" },
  { label: "$_POST", kind: VARIABLE_KIND, insertText: "$_POST", detail: "PHP superglobal" },
  { label: "$_SERVER", kind: VARIABLE_KIND, insertText: "$_SERVER", detail: "PHP superglobal" },
  { label: "$_SESSION", kind: VARIABLE_KIND, insertText: "$_SESSION", detail: "PHP superglobal" },
  { label: "$_COOKIE", kind: VARIABLE_KIND, insertText: "$_COOKIE", detail: "PHP superglobal" },
  { label: "$_FILES", kind: VARIABLE_KIND, insertText: "$_FILES", detail: "PHP superglobal" },
];

const sqlSeeds: CompletionSeed[] = [
  snippet("SELECT", "SELECT ${1:*}\nFROM ${2:table};", "SQL query"),
  snippet("SELECT WHERE", "SELECT ${1:*}\nFROM ${2:table}\nWHERE ${3:condition};", "SQL query"),
  snippet("INSERT", "INSERT INTO ${1:table} (${2:column})\nVALUES (${3:value});", "SQL statement"),
  snippet(
    "UPDATE",
    "UPDATE ${1:table}\nSET ${2:column} = ${3:value}\nWHERE ${4:condition};",
    "SQL statement",
  ),
  snippet("DELETE", "DELETE FROM ${1:table}\nWHERE ${2:condition};", "SQL statement"),
  snippet(
    "CREATE TABLE",
    "CREATE TABLE ${1:table_name} (\n\tid INTEGER PRIMARY KEY,\n\t$0\n);",
    "SQL DDL",
  ),
  snippet("CREATE INDEX", "CREATE INDEX ${1:index_name}\nON ${2:table} (${3:column});", "SQL DDL"),
  snippet(
    "INNER JOIN",
    "SELECT ${1:*}\nFROM ${2:table_a}\nINNER JOIN ${3:table_b} ON ${4:table_a.id} = ${5:table_b.table_a_id};",
    "SQL join",
  ),
  snippet(
    "LEFT JOIN",
    "SELECT ${1:*}\nFROM ${2:table_a}\nLEFT JOIN ${3:table_b} ON ${4:table_a.id} = ${5:table_b.table_a_id};",
    "SQL join",
  ),
  snippet(
    "GROUP BY",
    "SELECT ${1:column}, ${2:COUNT(*)}\nFROM ${3:table}\nGROUP BY ${4:column};",
    "SQL aggregation",
  ),
  snippet(
    "ORDER BY",
    "SELECT ${1:*}\nFROM ${2:table}\nORDER BY ${3:column} ${4:ASC};",
    "SQL sorting",
  ),
  snippet(
    "subquery",
    "SELECT ${1:*}\nFROM (\n\tSELECT ${2:*}\n\tFROM ${3:table}\n) AS ${4:sub};",
    "SQL subquery",
  ),
  snippet(
    "WITH CTE",
    "WITH ${1:cte_name} AS (\n\tSELECT ${2:*}\n\tFROM ${3:table}\n)\nSELECT ${4:*}\nFROM ${1:cte_name};",
    "SQL common table expression",
  ),
  keyword("FROM", "SQL clause", "FROM "),
  keyword("WHERE", "SQL clause", "WHERE "),
  keyword("JOIN", "SQL clause", "JOIN "),
  keyword("LEFT JOIN", "SQL clause", "LEFT JOIN "),
  keyword("RIGHT JOIN", "SQL clause", "RIGHT JOIN "),
  keyword("INNER JOIN", "SQL clause", "INNER JOIN "),
  keyword("ON", "SQL clause", "ON "),
  keyword("GROUP BY", "SQL clause", "GROUP BY "),
  keyword("HAVING", "SQL clause", "HAVING "),
  keyword("ORDER BY", "SQL clause", "ORDER BY "),
  keyword("LIMIT", "SQL clause", "LIMIT "),
  keyword("OFFSET", "SQL clause", "OFFSET "),
  keyword("DISTINCT", "SQL modifier"),
  keyword("AS", "SQL alias", "AS "),
  keyword("AND", "SQL logical operator"),
  keyword("OR", "SQL logical operator"),
  keyword("NOT", "SQL logical operator"),
  keyword("IN", "SQL operator", "IN "),
  keyword("BETWEEN", "SQL operator", "BETWEEN "),
  keyword("LIKE", "SQL operator", "LIKE "),
  keyword("IS NULL", "SQL condition"),
  keyword("IS NOT NULL", "SQL condition"),
  keyword("PRIMARY KEY", "SQL constraint"),
  keyword("FOREIGN KEY", "SQL constraint"),
  keyword("REFERENCES", "SQL constraint", "REFERENCES "),
  keyword("UNIQUE", "SQL constraint"),
  keyword("CHECK", "SQL constraint", "CHECK "),
  keyword("DEFAULT", "SQL constraint", "DEFAULT "),
  keyword("BEGIN TRANSACTION", "SQL transaction"),
  keyword("COMMIT", "SQL transaction"),
  keyword("ROLLBACK", "SQL transaction"),
  keyword("INTEGER", "SQLite type"),
  keyword("REAL", "SQLite type"),
  keyword("TEXT", "SQLite type"),
  keyword("BLOB", "SQLite type"),
  fn("COUNT", "COUNT(${1:*})", "SQL aggregate"),
  fn("SUM", "SUM(${1:column})", "SQL aggregate"),
  fn("AVG", "AVG(${1:column})", "SQL aggregate"),
  fn("MIN", "MIN(${1:column})", "SQL aggregate"),
  fn("MAX", "MAX(${1:column})", "SQL aggregate"),
  fn("ROUND", "ROUND(${1:value}, ${2:2})", "SQL numeric function"),
  fn("COALESCE", "COALESCE(${1:value}, ${2:fallback})", "SQL null-handling"),
  fn("LENGTH", "LENGTH(${1:value})", "SQL string function"),
  fn("LOWER", "LOWER(${1:value})", "SQL string function"),
  fn("UPPER", "UPPER(${1:value})", "SQL string function"),
  fn("SUBSTR", "SUBSTR(${1:value}, ${2:start}, ${3:length})", "SQL string function"),
  fn("DATE", "DATE(${1:value})", "SQLite date function"),
  fn("DATETIME", "DATETIME(${1:value})", "SQLite date function"),
  fn("STRFTIME", "STRFTIME(${1:'%Y-%m-%d'}, ${2:value})", "SQLite date function"),
];

const pythonSeeds: CompletionSeed[] = [
  snippet("if", "if ${1:condition}:\n\t$0", "Python control flow"),
  snippet("if / else", "if ${1:condition}:\n\t$2\nelse:\n\t$0", "Python control flow"),
  snippet("elif", "elif ${1:condition}:\n\t$0", "Python control flow"),
  snippet(
    "match",
    "match ${1:value}:\n\tcase ${2:pattern}:\n\t\t$0",
    "Python structural pattern matching",
  ),
  snippet("for", "for ${1:item} in ${2:items}:\n\t$0", "Python loop"),
  snippet("for range", "for ${1:i} in range(${2:stop}):\n\t$0", "Python loop"),
  snippet("while", "while ${1:condition}:\n\t$0", "Python loop"),
  snippet("def", "def ${1:name}(${2:arg}):\n\t$0", "Python function"),
  snippet(
    "def typed",
    "def ${1:name}(${2:arg}: ${3:str}) -> ${4:None}:\n\t$0",
    "Python typed function",
  ),
  snippet("lambda", "lambda ${1:x}: ${0:x}", "Python lambda"),
  snippet("class", "class ${1:Name}:\n\tdef __init__(self, ${2:value}):\n\t\t$0", "Python class"),
  snippet(
    "try / except",
    "try:\n\t$1\nexcept ${2:Exception} as ${3:error}:\n\t$0",
    "Python exceptions",
  ),
  snippet(
    "try / except / finally",
    "try:\n\t$1\nexcept ${2:Exception} as ${3:error}:\n\t$2\nfinally:\n\t$0",
    "Python exceptions",
  ),
  snippet("with", "with ${1:expression} as ${2:value}:\n\t$0", "Python context manager"),
  snippet("list comprehension", "[${1:expr} for ${2:item} in ${3:items}]", "Python comprehension"),
  snippet(
    "dict comprehension",
    "{${1:key}: ${2:value} for ${3:item} in ${4:items}}",
    "Python comprehension",
  ),
  snippet("import", "import ${1:module}", "Python import"),
  snippet("from import", "from ${1:module} import ${2:name}", "Python import"),
  keyword("return", "Python statement", "return "),
  keyword("yield", "Python generator", "yield "),
  keyword("break", "Python statement"),
  keyword("continue", "Python statement"),
  keyword("pass", "Python statement"),
  keyword("raise", "Python exceptions", "raise "),
  keyword("assert", "Python statement", "assert "),
  keyword("global", "Python scope", "global "),
  keyword("nonlocal", "Python scope", "nonlocal "),
  keyword("async", "Python async keyword", "async "),
  keyword("await", "Python async keyword", "await "),
  keyword("True", "Python literal"),
  keyword("False", "Python literal"),
  keyword("None", "Python literal"),
  fn("print", "print(${1:value})", "Python builtin"),
  fn("len", "len(${1:items})", "Python builtin"),
  fn("range", "range(${1:stop})", "Python builtin"),
  fn("enumerate", "enumerate(${1:items}, start=${2:0})", "Python builtin"),
  fn("zip", "zip(${1:first}, ${2:second})", "Python builtin"),
  fn("map", "map(${1:function}, ${2:iterable})", "Python builtin"),
  fn("filter", "filter(${1:function}, ${2:iterable})", "Python builtin"),
  fn("sum", "sum(${1:items})", "Python builtin"),
  fn("min", "min(${1:items})", "Python builtin"),
  fn("max", "max(${1:items})", "Python builtin"),
  fn("sorted", "sorted(${1:items}, key=${2:None}, reverse=${3:False})", "Python builtin"),
  fn("list", "list(${1:iterable})", "Python builtin"),
  fn("dict", "dict(${1:mapping})", "Python builtin"),
  fn("set", "set(${1:iterable})", "Python builtin"),
  fn("tuple", "tuple(${1:iterable})", "Python builtin"),
  fn("open", "open(${1:'file.txt'}, ${2:'r'}, encoding='utf-8')", "Python file helper"),
  fn("isinstance", "isinstance(${1:value}, ${2:type})", "Python builtin"),
  fn("getattr", "getattr(${1:object}, ${2:'name'})", "Python builtin"),
  fn("hasattr", "hasattr(${1:object}, ${2:'name'})", "Python builtin"),
  { label: "str", kind: CLASS_KIND, insertText: "str", detail: "Python built-in type" },
  { label: "int", kind: CLASS_KIND, insertText: "int", detail: "Python built-in type" },
  { label: "float", kind: CLASS_KIND, insertText: "float", detail: "Python built-in type" },
  { label: "bool", kind: CLASS_KIND, insertText: "bool", detail: "Python built-in type" },
  {
    label: "Exception",
    kind: CLASS_KIND,
    insertText: "Exception",
    detail: "Python exception class",
  },
  {
    label: "ValueError",
    kind: CLASS_KIND,
    insertText: "ValueError",
    detail: "Python exception class",
  },
  {
    label: "__init__",
    kind: METHOD_KIND,
    insertText: "__init__(self, ${1:value})",
    detail: "Python magic method",
    insertTextRules: SNIPPET_RULE,
  },
  {
    label: "__str__",
    kind: METHOD_KIND,
    insertText: "__str__(self)",
    detail: "Python magic method",
    insertTextRules: SNIPPET_RULE,
  },
  { label: "__name__", kind: VARIABLE_KIND, insertText: "__name__", detail: "Python dunder" },
  {
    label: "if __name__ == '__main__'",
    kind: SNIPPET_KIND,
    insertText: "if __name__ == '__main__':\n\t$0",
    detail: "Python entrypoint",
    insertTextRules: SNIPPET_RULE,
  },
  { label: "math", kind: MODULE_KIND, insertText: "math", detail: "Python standard module" },
  { label: "random", kind: MODULE_KIND, insertText: "random", detail: "Python standard module" },
  { label: "json", kind: MODULE_KIND, insertText: "json", detail: "Python standard module" },
  { label: "pathlib", kind: MODULE_KIND, insertText: "pathlib", detail: "Python standard module" },
];

const registeredLanguages = new Set<string>();

function toCompletionItem(item: CompletionSeed, range: CompletionRange) {
  return {
    ...item,
    range,
  };
}

function getWordSuggestions(
  model: { getValue(): string },
  prefix: string,
  kind: number,
  detail: string,
  range: CompletionRange,
) {
  const suggestions = new Set<string>();
  const matches = model.getValue().matchAll(/\b[A-Za-z_][A-Za-z0-9_]*\b/g);

  for (const match of matches) {
    const value = match[0];

    if (
      value.length < 3 ||
      value === prefix ||
      !value.toLowerCase().startsWith(prefix.toLowerCase())
    ) {
      continue;
    }

    suggestions.add(value);
  }

  return [...suggestions].slice(0, 50).map((label) => ({
    label,
    kind,
    insertText: label,
    detail,
    range,
  }));
}

function registerCompletionProvider(
  monaco: MonacoInstance,
  language: string,
  seeds: CompletionSeed[],
  triggerCharacters: string[],
) {
  if (registeredLanguages.has(language)) {
    return;
  }

  monaco.languages.registerCompletionItemProvider(language, {
    triggerCharacters,
    provideCompletionItems(model: any, position: any) {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };
      const prefix = word.word.trim();

      const seededSuggestions = seeds
        .filter(
          (item) =>
            prefix.length === 0 || item.label.toLowerCase().startsWith(prefix.toLowerCase()),
        )
        .map((item) => toCompletionItem(item, range));

      const dynamicSuggestions = getWordSuggestions(
        model,
        prefix,
        monaco.languages.CompletionItemKind.Text as number,
        "Identificatore nel file corrente",
        range,
      );

      return {
        suggestions: [...seededSuggestions, ...dynamicSuggestions],
      };
    },
  });

  registeredLanguages.add(language);
}

export function ensureWorkbenchIntellisense(monaco: MonacoInstance) {
  registerCompletionProvider(monaco, "php", phpSeeds, ["$", "-", ">", "_"]);
  registerCompletionProvider(monaco, "sql", sqlSeeds, [" ", "."]);
  registerCompletionProvider(monaco, "python", pythonSeeds, [".", "_"]);
}
