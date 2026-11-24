---
title: "ASIL A & Hardware Metrics"
description: "A structured approach to analyzing semiconductor safety manuals and selecting safety mechanisms for ASIL A systems."
publishedAt: 2026-11-23
tags:
  - Functional Safety
  - ISO 26262
  - ASIL A
coverImage: /images/articles/asil-a-hw-metrics.png
coverImageAlt: "Flowchart for selecting safety mechanisms in an ASIL A system"
---

## Context

Analyzing a safety manual and identifying the right safety mechanisms for your
system are important steps in avoiding unreasonable risk.

This article outlines a structured approach to safety-manual analysis and to
selecting safety mechanisms for an ASIL A system.

## Strategy

### Safety-manual analysis

Semiconductor vendors such as NXP, Texas Instruments, and Renesas provide safety
manuals in different formats, without a common structure.

The [safety-manual analysis template from Functional Safety
First](https://www.drivvize.com/post/seooc-analysis-template) can help organize
the analysis. It consolidates safety-mechanism characteristics such as
operational intervals and diagnostic capabilities, including whether a
mechanism detects permanent or transient faults.

### Safety mechanisms for ASIL A

For ASIL B and higher, safety mechanisms are selected in part by how much
diagnostic coverage they provide toward hardware metrics. For ASIL A, the
hardware-metric targets used for higher ASILs do not apply, so the selection
strategy must still ensure that safety-critical failures are addressed.

The flow below shows a process for selecting safety mechanisms for an ASIL A
system.

![Flowchart for selecting safety mechanisms for an ASIL A system](/images/articles/asil-a-safety-mechanism-selection.svg)

## Wrap-up

This strategy helps provide a rationale for including or excluding a safety
mechanism in an ASIL A system. Analyzing the safety manual with a structured
template also helps establish traceability between safety mechanisms and
technical safety requirements (TSRs), while making mechanism characteristics
clear to software developers.

Finalizing safety mechanisms is a joint activity for software, hardware, and
system safety engineers. This approach can help identify system-level solutions
for faults covered by safety mechanisms for single-point faults.

If you have questions or use a different strategy for selecting safety
mechanisms, share your thoughts in the comments.
