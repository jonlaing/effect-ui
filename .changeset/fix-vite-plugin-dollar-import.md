---
"@effex/vite-plugin": patch
---

Fix `stripDeadImports` misclassifying `$` imports as dead. The dead-import
detector used `\b<name>\b` boundaries to test whether a specifier appears
in the code; `\b` is a `\w`↔`\W` boundary, and `$` is a `\w` character
that at a real call site sits between `\W` neighbours (whitespace on the
left, `.` on the right) — so `\b$\b` never matched a genuine `$.tag(...)`
use, and any `import { $ }` with no other used specifier was stripped
from client builds. The bug was hidden while `collect` shared the import
line, because the "all specifiers dead" check short-circuited on any one
visibly-used name.

Replaces the boundary check with identifier-aware lookarounds:

```
(?<![A-Za-z0-9_$])<name>(?![A-Za-z0-9_$])
```

Adds regression fixtures covering `$`-only imports, `$` alongside a used
specifier, and a genuinely-dead `$`-only import.
