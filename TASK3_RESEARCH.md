# TASK 3 — Research plan: Evaluating open-source models for student competence analysis

## Research plan (2 paragraphs)

**Paragraph 1 — Goal & scope.**  
My goal is to evaluate one or more freely available models for the specific task of *high-level student competence analysis* in Python programming. I will focus on models that can (a) analyze a short Python function or snippet, (b) identify conceptual gaps or misconceptions (for example misuse of loops, off-by-one logic, incorrect use of types), and (c) generate prompts or diagnostic questions that help a student reflect and learn — without giving away exact fixes. To keep the evaluation concrete, I will use a small benchmark of 10 student-written Python snippets covering typical beginner mistakes (variable scoping, loop logic, off-by-one, incorrect conditionals, misuse of built-in functions). Evaluation will assess whether the model: identifies likely misconceptions, suggests lines/areas to inspect, and proposes scaffolded prompts that encourage reasoning rather than direct answers.

**Paragraph 2 — approach & plan.**  
I will evaluate one open-source model from the family of medium-size LLMs (for example an openly licensed LLaMA derivative or similar model available via Hugging Face). For this short research plan I will: (1) prepare the benchmark of 10 Python examples and an expected checklist of conceptual issues for each example; (2) prompt the model with the same structured instruction (see NOTES) and collect its responses; (3) measure suitability using a small rubric: (A) *Detection accuracy* — whether the model mentions the correct conceptual issue(s) (scored 0/1 each), (B) *Helpfulness of hints* — how well hints point students to inspect code (0–2), and (C) *No-direct-answer* — whether the reply avoids giving the full solution (true/false). I will summarize results in a small table and provide qualitative examples of good and bad model outputs. If time permits, I will also test a lighter-weight programming-specific model and compare its trade-offs in response quality vs. latency and interpretability.

---

## Why this model & criteria

- **Why this model:** I choose a moderately sized open model (free to use, small inference cost) because it hits a balance: expressive enough to reason about code but small enough to run locally or on low-cost inference. The goal is not to reach state-of-the-art correctness but to evaluate whether off-the-shelf open models are *suitable* as competence-analytics assistants with minimal fine-tuning.
- **Criteria for suitability:** (1) *Accuracy* — identifies the conceptual issue; (2) *Pedagogical tone* — provides scaffolded prompts that guide thinking (mentor-like); (3) *Non-revealing* — does not provide a full solution; (4) *Explainability* — gives short rationale for its suggestion; (5) *Resource trade-offs* — latency and inference cost for potential classroom use.

---

## How I will test / validate

1. **Dataset:** 10 short Python snippets with known conceptual issues (each annotated with expected conceptual labels).  
2. **Prompting:** Use a single, repeatable prompt template that asks the model to (a) identify likely conceptual mistake(s), (b) suggest places in the code to inspect, (c) provide 2 scaffolded questions for the student, and (d) explicitly avoid giving the fixed code. (This prompt will be included in the repo as `TASK3_PROMPT_TEMPLATE.md` if helpful.)  
3. **Metrics & analysis:** For each example compute boolean detection accuracy, score hint helpfulness (0–2), and flag if the model revealed the full fix. Aggregate results and present qualitative examples. Discuss limitations, failure modes, and next steps (fine-tuning, additional prompt engineering, or using program-analysis tools alongside the model).

---

## References & notes (short)
- I will use freely-available model weights from Hugging Face or a permissively-licensed LLM repository (document exact model name in README).  
- I will include the prompt template, dataset (inlined small examples), and evaluation rubric in the repo so reviewers can reproduce results.

