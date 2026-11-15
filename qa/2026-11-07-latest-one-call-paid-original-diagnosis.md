# 2026-11-07 latest normal paid first chapter: historical run + free encrypted replay

## Verified execution — do not repeat a billable call

- Explicitly authorized manual workflow dispatch **42369675176** on `fix-paid-qa-fact-bindings-20261014`, head `cdf01c58053266812834a4af71d6feef9728237b`, run attempt 1.
- All offline tests and exact-hash/consent pre-billing guard PASSED.
- Exactly **one GPT-4.1 model attempt** reached live provider and returned original structured content; the one-call runner stopped after grounding rejection, with no second batch, no synthesis and no automatic retry.
- Original rejecting code: `saju_core:month-pair-meaning-missing-from-main-paragraph`.
- Original private JSON preserved with authenticated encryption in artifact `qa-current-normal-core-20261107-encrypted`, artifact id **13573257223**, 71,893 bytes. Never print the original Korean report or customer inputs in public GitHub logs.
- Paid runner final status: **failure**. At least one call was attempted; actual billing amount is unknown. No automatic merchant/payment activation or production deployment.

## Offline replay of EXACT already-paid original

- Workflow **42370059025** downloaded/decrypted the prior encrypted artifact on a temporary private GitHub Actions runner, performed local comparisons only, and exited successfully. **Zero additional paid API calls**.
- Private source: `private-qa-first-chapter-provider-calls.json` in the temporary authenticated encrypted archive. No text or private original was published.
- The fixed month pair is **편인 / 편재**, based on the actual verified synthetic lunar chart.
- Required first chapter's main paragraph: **325 non-space/punctuation characters, 5 sentences**. Optional seasonal paragraph: **absent**.
- The provider's locked key judgment was **not** simply repeated verbatim inside the body.
- Exact existing lexical grounding checker: **편인 recognized; 편재 not recognized**, causing the specific blocker above.
- An independent, wider qualitative *word signal* detector: **both detected**, including 편재. This creates a **plausible lexical false-negative hypothesis**, not proof that the paid paragraph explains both source meanings.
- No other paid prose or entire paid report was generated. The grounding gate stopped generation. Machine pass and premium editorial value remain **unapproved**.

## Next necessary decision (do not repeat expensive QA)

1. **Read the already-paid first chapter privately** and independently decide whether the actual Korean paragraph conveyed both meanings and a valuable, nonrepetitive user-facing interpretation. Word-family signals alone cannot make this editorial decision.
2. If the reader value is present and only the narrow word match is wrong, update the *specific* checker with exactly documented equivalent meanings and regression tests; do not discard other factual/source and repetition checks.
3. If meaning or premium depth really is missing, improve the actual source-bound explanation and independent reader insight before authorizing any new paid call. Avoid returning to long chains of superficial tests or generating another fixed-scene template.
4. Explicitly prohibit old-run workflow reruns or using previously consumed approvals. Next provider call, if ever warranted, needs a new request SHA and separate explicit user approval.

**Current release verdict: NOT APPROVED.** Production branch unchanged, customer sales still blocked.

## Actual editorial read of the private ORIGINAL (2026-11-08 KST)

- The first chapter was read directly from the original encrypted archive via a one-time
  RSA-OAEP + AES-GCM encrypted reviewer transfer, without printing original Korean
  content to public GitHub logs. All private original text remains outside this repository.
- The required paragraph DOES express both verified monthly meanings, including the
  resource side as a natural sentence meaning "surrounding resources and means considered
  for use when needed." The prior word-family regex rejected this synonym.
- **Editorial judgment: HOLD / unsuitable for paid release.** The reader-facing heading
  is effectively two keyword labels. The five-sentence body describes the two symbolic
  categories, then repeats a generic two-sided caution ("if only information, miss
  resources; if only resources, miss information"). It supplies no concrete chart-specific
  applied decision, and ends in an explanatory limitation about symbolism rather than a
  distinctive customer insight. The optional independent paragraph was null.
- Separately note the specific test error and the customer-value error: the former is a
  lexical false negative; the latter is genuine lack of premium narrative depth.
- This is an assistant editorial inspection, **not** traditional-myeongri professional
  certification or an approved original-personality assessment. No real customer case
  was evaluated: the input was the existing synthetic sample.
- The correct remediation is to accept equivalent resource-use language **without**
  waiving source provenance, generic-advice and contradiction guards. Machine-pass
  after that change does NOT imply the report is ready to sell.
- **Do NOT authorize a second provider call or deploy.** First decide the
  interpretation method and a case-specific, evidence-owned reason beyond a month-pair
  dictionary summary. Stop constructing generic mirror sentences.

## Implementation and replay status

- Source: `report-grounding-review.js` includes a narrow, context-dependent
  equivalent for surrounding/multiple resources actually used when needed.
- Positive regression: archive-derived natural paraphrase; negative regression:
  generic statement that resources exist but without sourcing or use.
- Re-run the existing encrypted original through the ZERO-cost decoder and
  grounding checker; its historical lexical block is not a quality verdict.
