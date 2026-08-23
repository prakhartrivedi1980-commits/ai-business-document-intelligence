# System Architecture

> **Module:** 02 — System Architecture  
> **Pattern:** Service-Oriented Architecture (SOA) & Event-Driven Workflows  
> **Status:** Production Design Baseline  

---

## 📌 Architectural Overview

The AI Business Document Intelligence Platform is built on a **Modular Service-Oriented Architecture (SOA)** [cite: source]. Designed around strict separation of concerns, each independent service exposes well-defined HTTP/REST interfaces [cite: source]. This decoupled paradigm provides distinct advantages:

* **High Scalability:** Compute-heavy processes (like local LLM inference) scale independently from core API layers [cite: source].
* **Maintainability:** Individual services can be tested, refactored, or upgraded in isolation without downstream breakage [cite: source].
* **Extensibility:** New document processors, vector stores, or third-party AI integrations can be attached with minimal system configuration [cite: source].

---

## 🏗️ High-Level System Architecture

```
                                  ┌─────────────────────────┐
                                  │       User / Client     │
                                  └────────────┬────────────┘
                                               │
                                               ▼
                                  ┌─────────────────────────┐
                                  │      React Frontend     │
                                  └────────────┬────────────┘
                                               │
                                               ▼
                                  ┌─────────────────────────┐
                                  │     FastAPI Gateway     │
                                  └────────────┬────────────┘
                                               │
                       ┌───────────────────────┴───────────────────────┐
                       ▼                                               ▼
          ┌─────────────────────────┐                     ┌─────────────────────────┐
          │   Document Processing   │                     │       API Services      │
          └────────────┬────────────┘                     └─────────────────────────┘
                       │
                       ▼
          ┌─────────────────────────┐
          │   n8n Workflow Engine   │
          └────────────┬────────────┘
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   Ollama    │ │ PostgreSQL  │ │   Qdrant    │
└─────────────┘ └─────────────┘ └─────────────┘
```

---

## 🧩 Component Responsibilities

| Component | Architecture Role | Core Purpose | Key Responsibilities |
| :--- | :--- | :--- | :--- |
| **React** [cite: source] | **Presentation Layer** [cite: source] | User Interface [cite: source] | • Document uploads & interactive chat [cite: source]<br>• Real-time summary display & analytics rendering [cite: source] |
| **FastAPI** [cite: source] | **API Gateway & Parser** [cite: source] | Document Ingestion [cite: source] | • Document validation, text extraction & structured JSON generation [cite: source]<br>• Handshake with `n8n` *(does **not** perform AI reasoning)* [cite: source] |
| **n8n** [cite: source] | **Workflow Engine** [cite: source] | Orchestration [cite: source] | • Executes AI pipelines, invokes `Ollama`, and persists metadata [cite: source]<br>• Coordinates downstream business logic *(does **not** parse files)* [cite: source] |
| **Ollama** [cite: source] | **Inference Engine** [cite: source] | Local LLM Runtime [cite: source] | • Contextual summarization & key metadata extraction [cite: source]<br>• Zero-shot classification & document QA [cite: source] |
| **PostgreSQL** [cite: source] | **Relational Store** [cite: source] | Structured Data [cite: source] | • Stores metadata, upload history, summaries & user data [cite: source]<br>• Core analytics persistence [cite: source] |
| **Qdrant** [cite: source] | **Vector Store** [cite: source] | Semantic Database [cite: source] | • Stores high-dimensional vector embeddings [cite: source]<br>• Enables semantic similarity search & RAG workflows [cite: source] |

---

## 🔄 End-to-End Data Execution Flows

### 1. Current Operational Flow (Phase 1)

```
┌──────────┐     ┌─────────┐     ┌────────────────┐     ┌──────┐     ┌─────┐     ┌─────────┐
│ PDF File │ ──► │ FastAPI │ ──► │ Text Extractor │ ──► │ JSON │ ──► │ n8n │ ──► │ Ollama  │ ──► Summary
└──────────┘     └─────────┘     └────────────────┘     └──────┘     └─────┘     └─────────┘
```

### 2. Future Target Flow (Full Production Pipeline)

```
┌──────────────┐     ┌───────────┐     ┌─────────┐     ┌────────────────┐     ┌─────┐
│ User Upload  │ ──► │ React UI  │ ──► │ FastAPI │ ──► │ Text Extractor │ ──► │ n8n │
└──────────────┘     └───────────┘     └─────────┘     └────────────────┘     └──┬──┘
                                                                                 │
 ┌────────────────┐     ┌───────────┐     ┌────────────┐     ┌─────────────┐     │
 │ Chat Interface │ ◄── │ Qdrant DB │ ◄── │ Embeddings │ ◄── │ PostgreSQL  │ ◄───┘ (AI Summary
 └────────────────┘     └───────────┘     └────────────┘     └─────────────┘       & Metadata)
```

---

## 📐 Core Engineering Principles

* **Single Responsibility Principle (SRP):** Each microservice handles exactly one core concern (e.g., FastAPI parses documents; n8n orchestrates; Ollama infers) [cite: source].
* **Service-Oriented Isolation:** All inter-service communication is enforced through strict, standardized HTTP REST contracts [cite: source].
* **Pluggable Modularity:** New file parsers, database engines, or alternative LLMs can be swapped in without modifying surrounding layers [cite: source].
* **Horizontal Scalability:** High-overhead units like vector search and local LLM execution can be scaled independently on dedicated hardware [cite: source].
* **Independent Testability:** Each system tier can be unit tested, mocked, and deployed isolated from the rest of the stack [cite: source].
