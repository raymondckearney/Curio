// Client-safe UI metadata for the MindPrint(tm) AI Companions: labels, field
// definitions, copy. No prompt content lives here - see lib/companion-prompts.js
// (server-only) for that.

export const COMPANIONS_UI = {
  precision: {
    label: 'Precision Companion',
    supports: 'HOW',
    licenseKey: 'precision_companion',
    brand: {
      accent: '#FCD34D', accentText: '#92400E', soft: 'rgba(252,211,77,0.16)',
    },
    banner: {
      match: 'Detail work drains your wiring. The Companion produces it; you judge it.',
      other: 'Built for tertiary HOW profiles, but the precision modes work for anyone.',
    },
    modes: {
      decompose: {
        tab: 'Decompose', verb: 'Generate breakdown',
        desc: 'Turn a goal into milestones, workstreams, and next physical actions, with the invisible work included.',
        fields: [
          { id: 'goal', label: 'The goal', ph: 'The outcome in one or two sentences. e.g. Launch the client portal to our first 10 enterprise accounts by end of Q3.', rows: 3 },
          { id: 'context', label: 'Context (optional)', ph: 'Team, constraints, deadlines, what exists already.', rows: 3 },
        ],
      },
      checklist: {
        tab: 'Pre-Flight', verb: 'Generate checklist',
        desc: 'A completeness checklist for a deliverable, so nothing depends on remembering details.',
        fields: [
          { id: 'deliverable', label: 'The deliverable', ph: 'What is shipping, to whom, and how. e.g. Quarterly business review deck emailed to the client exec team Thursday.', rows: 3 },
        ],
      },
      gaps: {
        tab: 'Gap Review', verb: 'Find the gaps',
        desc: 'Paste a draft or plan and get what is missing, ranked by consequence.',
        fields: [
          { id: 'draft', label: 'Your draft or plan', ph: 'Paste the full text.', rows: 10 },
        ],
      },
      edges: {
        tab: 'Edge Cases', verb: 'Test the boundaries',
        desc: 'The boundary conditions and failure modes a HOW-primary would raise.',
        fields: [
          { id: 'plan', label: 'The plan', ph: 'Paste or describe the plan, system, or process.', rows: 8 },
        ],
      },
      dod: {
        tab: 'Definition of Done', verb: 'Draft the definition',
        desc: 'Checkable completion criteria, a confirmer, and the not-included line.',
        fields: [
          { id: 'work', label: 'The work', ph: 'What is being produced and for whom.', rows: 3 },
          { id: 'receiver', label: 'The receiver (optional)', ph: 'Who accepts it.', rows: 1 },
        ],
      },
    },
  },

  purpose: {
    label: 'Purpose Companion',
    supports: 'WHY',
    licenseKey: 'purpose_companion',
    brand: {
      accent: '#6EE7B7', accentText: '#065F46', soft: 'rgba(110,231,183,0.16)',
    },
    banner: {
      match: 'Purpose framing drains your wiring. The Companion produces it; you judge it.',
      other: 'Built for tertiary WHY profiles, but the framing modes work for anyone.',
    },
    modes: {
      brief: {
        tab: 'Purpose Brief', chat: true,
        desc: 'A guided ten-minute interview. The Companion asks the five questions one at a time, then writes your brief.',
      },
      northstar: {
        tab: 'North Star', verb: 'Draft the page',
        desc: 'Paste sponsor notes or interview raw material; get the one-page North Star.',
        fields: [
          { id: 'notes', label: 'Raw material', ph: 'Paste sponsor notes, a vision extraction interview, kickoff notes, or an email thread that contains the intent.', rows: 9 },
        ],
      },
      sowhat: {
        tab: 'So-What Translator', verb: 'Translate it',
        desc: 'Convert detailed content into audience meaning: which means that, for this reader...',
        fields: [
          { id: 'reader', label: 'The reader', ph: 'Title and current worry. e.g. COO, worried about integration costs ahead of the board meeting.', rows: 2 },
          { id: 'content', label: 'The content', ph: 'Paste the sections, findings, or draft.', rows: 8 },
        ],
      },
      openers: {
        tab: 'Opening Lines', verb: 'Write the line',
        desc: 'Paste any email or doc; get the one purpose sentence that should open it.',
        fields: [
          { id: 'message', label: 'Your message', ph: 'Paste the email, update, or document opening.', rows: 7 },
        ],
      },
    },
  },

  progress: {
    label: 'Progress Companion',
    supports: 'WHAT',
    licenseKey: 'progress_companion',
    brand: {
      accent: '#93C5FD', accentText: '#1E40AF', soft: 'rgba(147,197,253,0.16)',
    },
    banner: {
      match: 'Progress work drains your wiring. The Companion produces it; you judge it.',
      other: 'Built for tertiary WHAT profiles, but the progress modes work for anyone.',
    },
    modes: {
      threshold: {
        tab: 'Good-Enough Threshold', verb: 'Draft the threshold',
        desc: 'Pre-commit the shipping criteria before the pull toward one more improvement arrives.',
        fields: [
          { id: 'work', label: 'The work', ph: 'What is being produced and its current state.', rows: 3 },
          { id: 'receiver', label: 'The receiver', ph: 'Who accepts it, and what they will actually use it for.', rows: 2 },
        ],
      },
      backplan: {
        tab: 'Milestone Backplan', verb: 'Build the backplan',
        desc: 'From end state and date, backward, to a visible milestone chain with the first one close.',
        fields: [
          { id: 'end', label: 'The end state', ph: 'The deliverable and its fixed date. e.g. Signed pilot agreement with two design partners by September 30.', rows: 2 },
          { id: 'context', label: 'What the work involves (optional)', ph: 'The system view: components, dependencies, people.', rows: 4 },
        ],
      },
      broadcast: {
        tab: 'Progress Broadcast', verb: 'Write the broadcast',
        desc: 'Raw notes in, the four-line weekly update out. Five minutes, no register management.',
        fields: [
          { id: 'notes', label: 'Raw notes from the week', ph: 'Messy is fine: what you worked on, what happened, what is stuck. Bullet fragments welcome.', rows: 7 },
        ],
      },
      closing: {
        tab: 'Closing Card', verb: 'Extract the card',
        desc: 'Paste meeting notes; get the card: one action, one owner, one date, one line of context.',
        fields: [
          { id: 'meeting', label: 'Meeting notes or transcript', ph: 'Paste whatever you have from the conversation.', rows: 8 },
        ],
      },
    },
  },
};
