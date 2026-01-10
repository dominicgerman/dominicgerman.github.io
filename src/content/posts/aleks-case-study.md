---
title: Automating Business Processes with Python
# description: Automating business processes with Python
pubDate: 2025-01-18
tags:
  - python
  - automation
  - api
draft: false
---

## Background

Our institution's manual process for registering students in advanced math courses was inefficient and error-prone. Students who met placement test score requirements had to email the registrar, who would then verify scores by logging into a vendor web app, confirming test scores, and manually waiving prerequisite courses. This process lacked visibility, was tedious, and relied on significant manual effort.

## Challenge

I was tasked with designing a solution using our ERP's antiquated, proprietary programming language for batch uploading test scores—an approach that was not future-proof given our planned migration to a cloud-based ERP. I hated the idea of revisiting this problem in two years so I explored alternatives.

## Solution

I leveraged JSON APIs provided by both our ERP system and the third-party vendor to create an automated ETL pipeline using Python. The script connects to the vendor API to retrieve placement scores, transforms and validates the data, and loads it into our ERP system via its API. It runs every morning on a cron job. Here’s a summary of the implementation:

1. Open a connection to our logging database to track the process.
2. Authenticate with the vendor API and retrieve placement scores for tests taken the previous day.
3. Validate each score object to check for missing or malformed data.
4. Map student records from our ERP, verify eligibility, and write valid scores to the system.

I utilized a cloned production environment for rigorous testing over several weeks to ensure reliability.

## Results

The solution replaced a clunky, manual process with an automated, scalable, and cloud-compliant workflow. More importantly, it dramatically reduced the waiting period between a student taking their placement test and being able to register for their classes. The system is sustainable, aligns with our long-term cloud strategy, and can serve as a model for future integrations.
