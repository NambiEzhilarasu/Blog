---
title: "ASIL A & Hardware Metrics"
description: "A structured approach to analyzing semiconductor safety manuals and selecting safety mechanisms for ASIL A systems."
publishedAt: 2026-11-23
tags:
  - Functional Safety
  - ISO 26262
  - ASIL A
coverImage: /images/articles/asil-a-hw-metrics.png
coverImageAlt: "Decision flow for selecting ASIL A safety mechanisms and deriving requirements for the final lists."
# TODO: Confirm the template credit and URL before publishing.
templateCreditText: "safety-manual analysis template from Functional Safety First"
templateCreditUrl: "https://www.drivvize.com/post/seooc-analysis-template"
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

<!-- TODO: Confirm whether Functional Safety First or Drivvize should be credited and verify the link target. -->
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

![Decision flow for selecting ASIL A safety mechanisms, retaining applicable constraints and assumptions, and deriving requirements for the final lists.](<./ASIL A HW Metrics.png>)

## Flow summary

1. Use the semiconductor safety manual to list safety mechanisms and record
   their characteristics.
2. Extract the Functional Safety Constraints and Assumptions. Keep those that
   apply to the system and exclude those that do not.
3. Exclude mechanisms related to non-safety functions or unused peripherals.
4. Exclude mechanisms that cover latent faults.
5. Exclude faults detected by an alternative system-level measure for a
   single-point fault.
6. Finalize the applicable constraints and assumptions and the remaining list
   of safety mechanisms.
7. Derive and add safety requirements for those mechanisms, constraints, and
   assumptions to the TSRs.

## Wrap-up

This strategy helps provide a rationale for including or excluding a safety
mechanism in an ASIL A system. Analyzing the safety manual with a structured
template also helps establish traceability between safety mechanisms and
technical safety requirements (TSRs), while making mechanism characteristics
clear to software developers.

Finalizing safety mechanisms is a joint activity for software, hardware, and
system safety engineers. Because finalizing safety mechanisms is a joint
activity, this approach also helps the software, hardware and system safety
teams agree where a system-level measure is needed for faults that a safety
mechanism does not cover.

If you have questions or use a different strategy for selecting safety
mechanisms, share your thoughts in the comments.
