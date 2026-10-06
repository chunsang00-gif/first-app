# Legacy prototype migration

The live calculation/report modules are ready. The legacy `index.html` still contains the old sample report function.

To activate the migration layer, load this script immediately before `</body>`:

```html
<script src="runtime-loader.js"></script>
```

`runtime-loader.js` loads the validator, prompt contract, API contract, renderer, live report UI, unknown-time control, and lunar leap-month control. When step 5 becomes active it replaces the legacy sample output with the live `/api/calculate` -> `/api/report` flow.

The old sample report should be deleted after the live endpoint smoke test passes; until then it is retained only as rollback material and must not be treated as a production calculation source.