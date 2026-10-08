# MindPrint™ Activity Taxonomy

**Version:** 1.1 (approved by Ray Kearney, October 2026; score bands renamed Owner range / Contributor range / Draining so "lead" is never used for a person)
**Owner:** Ray Kearney, Curio
**Purpose:** The shared list of work activities and the cognitive orientation each one demands. Governs how Team Builder, and any future tool, tags activities found in a work plan, SOW, project plan or team charter.
**Precedence:** Subordinate to `lib/mindprint-source-of-truth.md`. If anything here conflicts with the Source of Truth, the Source of Truth wins and this file must be corrected.

---

## 1. How to read a tag

Every activity carries a demand tag in profile notation: LEAD-SUPPORT.

- The first orientation is the one the activity demands most. It is where the work lives.
- The second orientation is the supporting demand.
- The orientation not named is the residual demand.

A tag of HOW-WHY means the activity is most energizing for a person whose profile is HOW-WHY to lead, and draining for anyone whose tertiary orientation is HOW.

Tags describe the work, never a person. Skills in every activity can be learned. The tag describes energy cost, not ability.

## 2. Default demand split

For scoring, each tag converts to a demand split:

| Position in tag | Share of demand |
|---|---|
| Lead orientation | 60% |
| Support orientation | 30% |
| Residual orientation | 10% |

The split feeds the Section 6 formula in the Source of Truth without modification, so activity scores can never contradict the Role Alignment Analyzer.

Resulting score for a person against a single activity:

| Relationship of the activity tag to the person's profile | Score | Band |
|---|---|---|
| Tag matches the profile exactly | 83 | Owner range |
| Lead is the person's secondary, support is their primary | 77 | Owner range |
| Lead is the person's primary, support is their tertiary | 63 | Owner range |
| Lead is the person's secondary, support is their tertiary | 55 | Contributor range |
| Lead is the person's tertiary, support is their primary | 32 | Draining |
| Lead is the person's tertiary, support is their secondary | 29 | Draining |

Bands: 60 and above is the owner range, 40 to 59 is the contributor range, and below 40 is draining work for that person, which needs a mitigation if it is assigned.

## 3. Context shift rule

The same activity can change character with context. A workshop that sets vision is different work from a workshop that aligns a team on process.

- A tool may move a tag by one step when the source document supports it: swap the lead and support orientations, or replace the support orientation.
- A tool may never replace the lead orientation with the residual orientation.
- Every shift must be shown to the user with a one-sentence reason drawn from the document.
- Activities that match nothing on this list are tagged by the closest match and marked as inferred.

## 4. The list

Source key: S = Source of Truth, R = MindPrint™ Roles and Tasks guide, New = added for consulting and project work.

### Group 1: Framing and direction
| ID | Activity | Demand | Source |
|---|---|---|---|
| 1 | Defining vision and long-range goals | WHY-WHAT | S, R |
| 2 | Problem definition and reframing | WHY-HOW | New |
| 3 | Identifying market opportunities and white space | WHY-WHAT | S, R |
| 4 | Setting strategic priorities | WHY-WHAT | S, R |
| 5 | Evaluating proposals from a purpose lens | WHY-WHAT | R |
| 6 | Assumption surfacing and pre-mortem | WHY-HOW | New |
| 7 | High-level roadmap and milestone planning | WHY-WHAT | S, R |

### Group 2: Discovery and research
| ID | Activity | Demand | Source |
|---|---|---|---|
| 8 | Client-facing discovery conversations | WHAT-WHY | S, R |
| 9 | Deep diagnostic interviews with leadership | WHY-HOW | R |
| 10 | Research design (method, sample, guides) | HOW-WHY | New |
| 11 | Data collection and fieldwork | HOW-WHAT | New |
| 12 | Research synthesis into insights and principles | WHY-HOW | S, R |
| 13 | Quantitative analysis and data modeling | HOW-WHY | R |
| 14 | Root cause analysis | HOW-WHY | S, R |
| 15 | Benchmarking and competitive analysis | HOW-WHY | R |
| 16 | Current-state process audit | HOW-WHY | S, R |
| 17 | Organizational assessment and gap analysis | HOW-WHAT | R |

### Group 3: Strategy and solution design
| ID | Activity | Demand | Source |
|---|---|---|---|
| 18 | Systems mapping and interdependencies | WHY-HOW | R |
| 19 | Framework and model development | WHY-HOW | S, R |
| 20 | Comprehensive strategy, vision through task | WHY-HOW | S, R |
| 21 | Concept generation and ideation | WHY-WHAT | New |
| 22 | Program or initiative structure design | WHY-WHAT | R |
| 23 | Solution design and optimization | HOW-WHY | R |
| 24 | Operating model and org structure design | HOW-WHAT | S, R |
| 25 | End-to-end process design | HOW-WHAT | S, R |
| 26 | Prototyping and rapid iteration | WHAT-HOW | R |
| 27 | Hypothesis testing and validation | HOW-WHY | S, R |

### Group 4: Planning and mobilization
| ID | Activity | Demand | Source |
|---|---|---|---|
| 28 | Breaking initiatives into workstreams | WHAT-HOW | S, R |
| 29 | Detailed project planning | WHAT-HOW | S, R |
| 30 | Milestone setting and lightweight sprint plans | WHAT-WHY | R |
| 31 | Effort estimation and resourcing | HOW-WHAT | New |
| 32 | Kickoff and team mobilization | WHAT-WHY | S, R |
| 33 | Decision rights and accountability design | HOW-WHAT | R |

### Group 5: Delivery management
| ID | Activity | Demand | Source |
|---|---|---|---|
| 34 | Standups and progress check-ins | WHAT-WHY | R |
| 35 | Sprints, retrospectives and planning sessions | WHAT-HOW | S, R |
| 36 | Managing dependencies and blockers | WHAT-HOW | R |
| 37 | Multi-workstream program management | HOW-WHAT | S, R |
| 38 | Metrics, dashboards and status tracking | WHAT-HOW | S, R |
| 39 | Fast decisions and real-time course correction | WHAT-WHY | S, R |
| 40 | Bottleneck identification and resolution | HOW-WHAT | S, R |
| 41 | Holding teams to timelines and deliverables | WHAT-HOW | R |
| 42 | Technology and system implementation | HOW-WHAT | R |

### Group 6: Quality and documentation
| ID | Activity | Demand | Source |
|---|---|---|---|
| 43 | Quality and consistency review | HOW-WHAT | S, R |
| 44 | Deliverable pre-flight and closing pass | HOW-WHAT | New |
| 45 | Technical documentation and specifications | HOW-WHY | R |
| 46 | SOPs, playbooks and operational documentation | HOW-WHAT | S, R |
| 47 | Edge case and risk review | HOW-WHY | New |
| 48 | Compliance and administrative work | HOW-WHAT | New |
| 49 | Post-mortems and lessons learned | WHAT-HOW | R |

### Group 7: Communication and client
| ID | Activity | Demand | Source |
|---|---|---|---|
| 50 | Narrative building and pitching | WHY-WHAT | S, R |
| 51 | Executive storyline and presentation | WHY-WHAT | New |
| 52 | Thought leadership and white papers | WHY-HOW | S, R |
| 53 | Translating findings into recommendations | WHY-WHAT | New |
| 54 | Aligning stakeholders around a new direction | WHY-WHAT | R |
| 55 | Client relationship and account management | WHAT-WHY | New |
| 56 | Progress communications to the client | WHAT-HOW | New |
| 57 | Solution pitching and business development | WHAT-WHY | S, R |

### Group 8: Facilitation, change and transition
| ID | Activity | Demand | Source |
|---|---|---|---|
| 58 | Vision-setting workshops and offsites | WHY-WHAT | R |
| 59 | Structured problem-solving sessions | HOW-WHY | R |
| 60 | Process alignment working sessions | HOW-WHAT | R |
| 61 | Change management and adoption | WHAT-WHY | R |
| 62 | Training and methodology coaching | HOW-WHY | S, R |
| 63 | Handoff and transition to the client | HOW-WHAT | New |

## 5. Resolved source conflicts

Three activities appear under two profiles in the source documents. One tag was chosen for each:

| Activity | Appears under | Tag chosen |
|---|---|---|
| Root cause analysis | WHY-HOW and HOW-WHY | HOW-WHY |
| Org structure design | WHY-HOW and HOW-WHAT | HOW-WHAT |
| Change management | WHAT-WHY and HOW-WHAT | WHAT-WHY |

## 6. Change control

Changes to tags, the default split or the role bands require Ray's review. Any change must be checked against Sections 3, 4 and 6 of the Source of Truth before it is considered live.
