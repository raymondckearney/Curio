// The prototype's sample statement of work (fictional client) and the
// extraction it should produce. Used as the engine test fixture and for the
// "Use the sample" option on step 1. Taxonomy tags are filled in from the
// taxonomy list by the caller (sampleActivities).

export const SAMPLE_SOW = `STATEMENT OF WORK (SAMPLE DOCUMENT, FICTIONAL CLIENT)
Client: Harbor & Pine Outdoor Co.
Engagement: Loyalty program redesign
Duration: 12 weeks. Estimated effort: 1,560 hours.

Scope of services
Phase 1, Discover (weeks 1 to 4). Interview executive sponsors to understand goals for the program. Design the customer research approach. Conduct customer interviews and a member survey. Analyze existing loyalty and transaction data. Benchmark competitor programs.

Phase 2, Define (weeks 5 to 6). Synthesize research into insights. Define the program vision and member value proposition. Facilitate a concept workshop with the client team.

Phase 3, Design (weeks 7 to 10). Design program mechanics and tier structure. Prototype the member experience and test with customers. Identify and contact potential rewards partners.

Phase 4, Deliver (weeks 11 to 12). Build the roadmap and launch plan. Present the executive readout.

Deliverables: research report, program blueprint, tested prototype, business case, launch roadmap.`;

export const SAMPLE_PHASES = [
  { key: 'ph-discover', name: 'Discover', start: 1, end: 4, ongoing: false },
  { key: 'ph-define', name: 'Define', start: 5, end: 6, ongoing: false },
  { key: 'ph-design', name: 'Design', start: 7, end: 10, ongoing: false },
  { key: 'ph-deliver', name: 'Deliver', start: 11, end: 12, ongoing: false },
  { key: 'ph-ongoing', name: 'Ongoing', start: 1, end: 12, ongoing: true },
];

// [name, taxonomy id, phase key, share, delivery, source, tag override]
const RAW = [
  ['Executive sponsor interviews', 9, 'ph-discover', 6, 'Pair', 'Stated'],
  ['Customer research design', 10, 'ph-discover', 4, 'Solo', 'Stated'],
  ['Customer interviews and member survey', 11, 'ph-discover', 10, 'Small team', 'Stated'],
  ['Loyalty and transaction data analysis', 13, 'ph-discover', 9, 'Pair', 'Stated'],
  ['Competitor program benchmarking', 15, 'ph-discover', 4, 'Solo', 'Stated'],
  ['Research synthesis', 12, 'ph-define', 8, 'Small team', 'Stated'],
  ['Program vision and value proposition', 1, 'ph-define', 7, 'Pair', 'Stated'],
  ['Concept workshop with client team', 58, 'ph-define', 4, 'Whole team', 'Stated'],
  ['Program mechanics and tier design', 23, 'ph-design', 9, 'Pair', 'Stated'],
  ['Member experience prototype and testing', 26, 'ph-design', 9, 'Small team', 'Stated'],
  ['Business case modeling', 13, 'ph-design', 6, 'Solo', 'Inferred'],
  ['Rewards partner outreach', 0, 'ph-design', 3, 'Solo', 'Stated', 'WHAT-WHY'],
  ['Roadmap and launch plan', 29, 'ph-deliver', 5, 'Pair', 'Stated'],
  ['Executive readout', 51, 'ph-deliver', 4, 'Small team', 'Stated'],
  ['Project management and status reporting', 38, 'ph-ongoing', 7, 'Solo', 'Inferred'],
  ['Client relationship management', 55, 'ph-ongoing', 5, 'Solo', 'Inferred'],
];

export function sampleActivities(taxonomy) {
  const tagOf = id => (taxonomy.find(t => t.id === id) || {}).tag;
  return RAW.map(([name, tax, phase, share, mode, src, tag], i) => ({
    key: `act-${i + 1}`, name, tax, tag: tag || tagOf(tax), phase, share, mode, src,
  }));
}

export const SAMPLE_ROSTER = [
  { key: 'p-maya', name: 'Maya', profile: 'WHY-WHAT', avail: 50 },
  { key: 'p-daniel', name: 'Daniel', profile: 'HOW-WHY', avail: 100 },
  { key: 'p-priya', name: 'Priya', profile: 'WHAT-HOW', avail: 100 },
  { key: 'p-tomas', name: 'Tomas', profile: 'WHY-HOW', avail: 100 },
  { key: 'p-jordan', name: 'Jordan', profile: 'WHAT-WHY', avail: 75 },
];

export const SAMPLE_PROJECT = { weeks: 12, hours: 1560 };
