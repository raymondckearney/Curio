import Head from 'next/head';
import { useEffect } from 'react';

export default function Manual() {
  useEffect(() => {
    const links = document.querySelectorAll('.nav-link[href^="#"]');
    const sections = Array.from(links)
      .map(l => document.querySelector(l.getAttribute('href')))
      .filter(Boolean);

    function updateActive() {
      let current = sections[0];
      for (const s of sections) {
        if (s.getBoundingClientRect().top <= 80) current = s;
      }
      links.forEach(l =>
        l.classList.toggle('active', l.getAttribute('href') === '#' + current?.id)
      );
    }

    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
    return () => window.removeEventListener('scroll', updateActive);
  }, []);

  return (
    <>
      <Head>
        <title>Curio — Product Manual</title>
        <meta name="robots" content="noindex, nofollow" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <style>{css}</style>
      </Head>

      <div className="shell">
        {/* Sidebar */}
        <nav className="sidebar">
          <div className="sidebar-brand">
            <div className="sidebar-wordmark">Curio<span>.</span></div>
            <div className="sidebar-subtitle">Product Manual</div>
          </div>

          <div className="nav-group">
            <div className="nav-group-label">Overview</div>
            <a href="#overview" className="nav-link">How It Works</a>
            <a href="#roles" className="nav-link">Roles & Access</a>
            <a href="#assessment-flow" className="nav-link">Assessment Flow</a>
          </div>

          <div className="nav-group">
            <div className="nav-group-label">Admin Panel</div>
            <a href="#admin-tokens" className="nav-link">Tokens</a>
            <a href="#admin-assessments" className="nav-link">Assessments</a>
            <a href="#admin-engagements" className="nav-link">Engagements</a>
            <a href="#admin-career" className="nav-link">Career Reports</a>
            <a href="#admin-accounts" className="nav-link">Accounts</a>
            <a href="#admin-cleanup" className="nav-link">Cleanup</a>
          </div>

          <div className="nav-group">
            <div className="nav-group-label">Client Portal</div>
            <a href="#portal-dashboard" className="nav-link">Dashboard</a>
            <a href="#portal-team" className="nav-link">My Team</a>
            <a href="#portal-tokens" className="nav-link">Assessment Tokens</a>
            <a href="#portal-results" className="nav-link">Assessment Results</a>
            <a href="#portal-tools" className="nav-link">AI Tools</a>
            <a href="#portal-companions" className="nav-link">AI Companions</a>
            <a href="#portal-translator" className="nav-link">Orientation Translator</a>
            <a href="#portal-library" className="nav-link">Client Library</a>
          </div>

          <div className="nav-group">
            <div className="nav-group-label">Public</div>
            <a href="#public-flows" className="nav-link">Public Flows</a>
            <a href="#email-notifications" className="nav-link">Email Notifications</a>
          </div>
        </nav>

        {/* Content */}
        <main className="content">

          <div className="page-header">
            <div className="page-eyebrow">Curio Internal Reference</div>
            <h1 className="page-title">Product Manual</h1>
            <p className="page-desc">A complete reference for the Curio platform — covering the admin panel, the client portal, access control, and how all the pieces connect.</p>
            <div className="page-meta">Last updated July 2026 · choosecurio.com</div>
          </div>

          {/* ─── Overview ─── */}
          <section className="section" id="overview">
            <div className="section-header">
              <h2 className="section-title">How It Works</h2>
            </div>
            <p style={{fontSize:'0.9rem',color:'var(--sub)',marginBottom:16,lineHeight:1.7}}>Curio is an assessment and career intelligence platform. At its core, it distributes single-use assessment tokens, collects MindPrint™ profile results, and provides AI-powered career and role-fit tools through a branded client portal.</p>
            <div className="grid-2">
              <Card title="Admin Panel">Your private back-office at <code>/admin</code>. Generate tokens, monitor engagement progress, manage accounts, and view all data across every client.</Card>
              <Card title="Client Portal">A branded workspace at <code>/portal</code> for clients to view their MindPrint™ profile, distribute tokens to their team, and use AI career tools.</Card>
              <Card title="Assessment Flow">A token link → Typeform quiz → results page → optional account creation. Each token is single-use and tied to one profile.</Card>
              <Card title="AI Tools">Role Analyzer, Career Guidance Tool, and JD Analyzer — all powered by the MindPrint™ profile and streamed in real time. Gated by license.</Card>
            </div>
          </section>

          {/* ─── Roles ─── */}
          <section className="section" id="roles">
            <div className="section-header">
              <h2 className="section-title">Roles & Access</h2>
            </div>
            <div className="table-wrap">
              <table className="ref-table">
                <thead><tr><th>Role</th><th>Who</th><th>Can Do</th></tr></thead>
                <tbody>
                  <tr><td><span className="badge badge-admin">Admin</span></td><td>You (Ray)</td><td>Everything — full admin panel, all accounts, all data, generate tokens, manage roles and licenses.</td></tr>
                  <tr><td><span className="badge badge-owner">Owner</span></td><td>Enterprise account lead</td><td>Distribute tokens to their team, invite portal members, view all team assessment results, use licensed AI tools.</td></tr>
                  <tr><td><span className="badge badge-member">Member</span></td><td>Enterprise team member</td><td>View their own profile and (if permitted) team results. Use licensed AI tools. Cannot distribute tokens or invite others.</td></tr>
                  <tr><td><span className="badge badge-public">Individual</span></td><td>Self-serve / solo user</td><td>View their own profile, use tools they have licenses for. No team features.</td></tr>
                </tbody>
              </table>
            </div>
            <div className="info-block"><strong>Owner vs Member visibility:</strong> If <em>Restrict Results</em> is enabled on an account, members only see their own assessment. Owners always see everyone's results on that account.</div>
          </section>

          {/* ─── Assessment Flow ─── */}
          <section className="section" id="assessment-flow">
            <div className="section-header">
              <h2 className="section-title">Assessment Flow</h2>
            </div>
            <div className="steps">
              <Step n={1}><strong>Token is generated</strong> — by you in the admin Tokens tab, or by an enterprise owner from their portal. Each token is a UUID linked to an account and engagement.</Step>
              <Step n={2}><strong>Link is sent</strong> — <code>choosecurio.com/go/[token]</code>. The token can be pre-assigned to an email/name or sent blank.</Step>
              <Step n={3}><strong>Participant takes the Typeform quiz</strong> — roughly 20 minutes. On completion, a webhook fires and marks the token <em>used</em>, storing the H/W/Y scores and profile type.</Step>
              <Step n={4}><strong>Results page</strong> — the participant sees their MindPrint™ profile at <code>/results/[type]</code>. If the token is unused and they haven't signed up yet, they're redirected to <code>/signup</code> to create a portal account.</Step>
              <Step n={5}><strong>Account creation</strong> — token is consumed, licenses are granted, and the participant lands in their portal dashboard. You receive a notification email.</Step>
            </div>
            <div className="warn-block"><strong>Tokens are single-use.</strong> Once a participant creates an account with a token, it's marked used. A second person who clicks the same link will see the results page but won't receive any licenses when they sign up.</div>
          </section>

          <hr className="divider" />

          {/* ═══ ADMIN ═══ */}
          <SectionEyebrow>Admin Panel — /admin</SectionEyebrow>

          <section className="section" id="admin-tokens">
            <div className="section-header">
              <h2 className="section-title">Tokens</h2>
              <span className="section-path">/admin → Tokens</span>
              <span className="badge badge-admin">Admin</span>
            </div>
            <Card title="Individual Access">Creates a single token for one person. Fields: name, email, purpose (assessment or career), tier (basic/premium), tool access, engagement ID, and optional expiry. The token URL is shown immediately with a "Send Link" button to email it directly from the admin.</Card>
            <Card title="Enterprise Batch">Two modes: <strong>Named Participants</strong> — paste a list (Name, Email, Company, Role — one per line); <strong>Anonymous Batch</strong> — enter a count and generate N blank tokens for an engagement. Participants are assigned when the owner sends links from their portal.</Card>
            <Card title="Status Panel">Look up all tokens for an engagement ID. Shows each participant's name, email, status (sent / completed), and their MindPrint™ profile type once complete. Includes a "Send Link" panel to email individual tokens and a "Send Profile" button to email the completed results page.</Card>
          </section>

          <section className="section" id="admin-assessments">
            <div className="section-header">
              <h2 className="section-title">Assessments</h2>
              <span className="section-path">/admin → Assessments</span>
              <span className="badge badge-admin">Admin</span>
            </div>
            <Card title="Completed Results Table">All submitted assessments across every engagement and account. Searchable by name, email, or profile type. Columns: name, email, profile type, H/W/Y scores, engagement ID, date.</Card>
            <Card title="Role Fit Analysis">Run a real-time AI role-fit analysis for any participant from this table. Enter a role title and generate a streaming report showing alignment score, strengths, challenges, and recommendations based on their MindPrint™ profile. Results can be emailed as a PDF from the same panel.</Card>
          </section>

          <section className="section" id="admin-engagements">
            <div className="section-header">
              <h2 className="section-title">Engagements</h2>
              <span className="section-path">/admin → Engagements</span>
              <span className="badge badge-admin">Admin</span>
            </div>
            <Card title="Cohort Overview">Lists all engagement IDs that have tokens. Click any engagement to expand a cohort view showing completion rate, profile type breakdown across the group, and a per-participant status table. A "Generate More" button pre-fills the Tokens tab with that engagement ID to top up the pool.</Card>
          </section>

          <section className="section" id="admin-career">
            <div className="section-header">
              <h2 className="section-title">Career Reports</h2>
              <span className="section-path">/admin → Career Reports</span>
              <span className="badge badge-admin">Admin</span>
            </div>
            <Card title="Saved Reports">All Career Guidance Tool reports that have been generated through the portal. View the full structured report for any participant, or email the report directly as a formatted HTML email.</Card>
          </section>

          <section className="section" id="admin-accounts">
            <div className="section-header">
              <h2 className="section-title">Accounts</h2>
              <span className="section-path">/admin → Accounts</span>
              <span className="badge badge-admin">Admin</span>
            </div>
            <Card title="Account List">All client accounts with type (free / paid / enterprise), tier (basic / premium), login provider, status, and last login. Filterable by type, tier, and name/email search.</Card>
            <Card title="Invite New Account">Creates a portal account and sends a setup email. Set tier and attach licenses (assessment tokens, role analyzer, career guidance, JD analyzer, the three AI Companions, the Orientation Translator, Client Library) at creation time.</Card>
            <Card title="Edit Account">
              Click <strong>Edit</strong> on any account to expand a panel with four sections:
              <ul>
                <li><strong>Tier & Licenses</strong> — change tier, add or remove licenses with quantity and expiry.</li>
                <li><strong>Users & Roles</strong> — see all portal users on the account with their current role. Toggle any user between Owner and Member instantly.</li>
                <li><strong>Token Pool</strong> — click "Show ▼" to see Total / Available / Sent / Completed counts, a scrollable token table, and a green <strong>Add Tokens</strong> form. Enter a quantity and optional engagement label to release tokens to that account.</li>
                <li><strong>Purchase History</strong> — Stripe purchase records linked to this account.</li>
              </ul>
            </Card>
            <div className="info-block"><strong>To give an enterprise account their token allocation:</strong> Edit the account → Token Pool → enter quantity → click "Add Tokens". Those tokens immediately appear in the owner's Assessment Tokens page in the portal.</div>
          </section>

          <section className="section" id="admin-cleanup">
            <div className="section-header">
              <h2 className="section-title">Cleanup</h2>
              <span className="section-path">/admin → Cleanup</span>
              <span className="badge badge-admin">Admin</span>
            </div>
            <Card title="Delete Test Data">
              Two modes — both are permanent and require confirmation:
              <ul>
                <li><strong>By Token</strong> — paste one or more token UUIDs or full <code>/go/…</code> URLs, one per line. Deletes the token, associated assessment, portal account, licenses, and portal users.</li>
                <li><strong>By Engagement ID</strong> — deletes every token under that engagement and all linked data. Use to wipe an entire test engagement.</li>
              </ul>
              Results log shows exactly what was deleted for each token.
            </Card>
          </section>

          <hr className="divider" />

          {/* ═══ PORTAL ═══ */}
          <SectionEyebrow>Client Portal — /portal</SectionEyebrow>

          <section className="section" id="portal-dashboard">
            <div className="section-header">
              <h2 className="section-title">Dashboard / My Profile</h2>
              <span className="section-path">/portal/dashboard</span>
            </div>
            <div className="badges">
              <span className="badge badge-admin">Admin</span>
              <span className="badge badge-owner">Owner</span>
              <span className="badge badge-member">Member</span>
            </div>
            <Card title="MindPrint™ Profile Display">
              The landing page after login. Shows the user's MindPrint™ profile type (e.g. WHY-WHAT), their cognitive signal quote, and full profile breakdown — strengths, blind spots, and collaboration style.
              <ul>
                <li>Profile type shown as a colored pill label.</li>
                <li><strong>Download Full Profile PDF</strong> — opens the full results page in a new tab, pre-loaded with a print-optimized view. The "Back to dashboard" link returns them here.</li>
                <li>If the user hasn't completed an assessment yet, a pending state is shown. If they have an unused assessment token on the account, a <strong>Start Your Assessment →</strong> button links straight to their <code>/go/&lt;token&gt;</code> link, with an <strong>Email me the link</strong> fallback (<code>/api/portal/resend-assessment</code>) that re-sends the same link to their own address. If no token is found at all, it falls back to "Check your email for the link."</li>
              </ul>
            </Card>
          </section>

          <section className="section" id="portal-team">
            <div className="section-header">
              <h2 className="section-title">My Team</h2>
              <span className="section-path">/portal/team</span>
            </div>
            <div className="badges"><span className="badge badge-owner">Owner only</span></div>
            <Card title="Token Pool Summary">Four stat tiles at the top: Total, Available, Sent, and Completed tokens for this account.</Card>
            <Card title="Invite a Team Member">Enter an email, optional name, and role (Member or Owner). A portal account is created and a "Set Up Your Account" email is sent with a 7-day setup link. The invited user sets their own password.</Card>
            <Card title="Team Table">All portal users on the account with: name, email, role, assessment status (No Token / Invited / Completed), MindPrint™ profile type, and join date. Owners can remove members (but not themselves) with a confirmation prompt.</Card>
          </section>

          <section className="section" id="portal-tokens">
            <div className="section-header">
              <h2 className="section-title">Assessment Tokens</h2>
              <span className="section-path">/portal/tokens</span>
            </div>
            <div className="badges"><span className="badge badge-owner">Owner only</span></div>
            <Card title="Token Stats">Available / Sent / Completed counts drawn from the account's token pool (set by admin).</Card>
            <Card title="Send Assessment Links">
              Two modes for distributing tokens from the pool:
              <ul>
                <li><strong>Single Recipient</strong> — name (optional) and email. Assigns one token and sends a personalized email.</li>
                <li><strong>Batch</strong> — paste recipients as <code>Name, email</code> or just email, one per line. Warns if count exceeds available tokens.</li>
              </ul>
              A customizable email message supports <code>[Name]</code> and <code>[URL]</code> placeholders with a live preview toggle. You receive a BCC of every sent email.
            </Card>
            <Card title="Sent Tokens Table">All tokens that have been assigned — showing recipient name, email, sent date, completion date, and a copy-link button.</Card>
          </section>

          <section className="section" id="portal-results">
            <div className="section-header">
              <h2 className="section-title">Assessment Results</h2>
              <span className="section-path">/portal/results</span>
            </div>
            <div className="badges">
              <span className="badge badge-owner">Owner</span>
              <span className="badge badge-member">Member</span>
            </div>
            <Card title="Results Table">
              Completed assessments for the account — name, email, MindPrint™ profile type (color-coded badge), H/W/Y scores, and submission date. Searchable by name, email, or profile type.
              <ul>
                <li><strong>Owners</strong> always see all results.</li>
                <li><strong>Members</strong> see all results unless <em>Restrict Results</em> is enabled on the account (set by admin), in which case they only see their own row.</li>
              </ul>
            </Card>
          </section>

          <section className="section" id="portal-tools">
            <div className="section-header">
              <h2 className="section-title">AI Tools</h2>
              <span className="section-path">/portal/tools/…</span>
            </div>
            <div className="badges">
              <span className="badge badge-owner">Owner</span>
              <span className="badge badge-member">Member</span>
            </div>
            <p style={{fontSize:'0.855rem',color:'var(--sub)',marginBottom:12,lineHeight:1.65}}>All tools are gated by license. If an account doesn't have the relevant license, the nav item doesn't appear.</p>
            <Card title="Role Analyzer · /portal/tools/fit · license: role_analyzer">Enter any role title. Generates a real-time streaming report with an alignment score, energizers, drains, and collaboration recommendations — all calibrated to the user's MindPrint™ profile.</Card>
            <Card title="Career Guidance Tool · /portal/tools/career · license: career_guidance">Generates a structured career report with best-fit roles, energizers, challenges, and strategies. Optional inputs: current role, years of experience, additional results, strengths, and areas for growth. Includes a PDF export.</Card>
            <Card title="JD Analyzer · /portal/tools/jd · license: jd_analyzer">Paste a job description. Returns an analysis of fit vs. the user's profile — what will energize them, what will drain them, and how to position themselves for that role.</Card>
            <Card title="Analyzer History · /portal/analyzer-history · license: role_analyzer">A log of all Role Analyzer runs for the account — role title, profile, alignment score, and date. Saved automatically after each analysis.</Card>
          </section>

          {/* ─── AI Companions ─── */}
          <section className="section" id="portal-companions">
            <div className="section-header">
              <h2 className="section-title">AI Companions</h2>
              <span className="section-path">/portal/tools/precision-companion, purpose-companion, progress-companion</span>
            </div>
            <div className="badges">
              <span className="badge badge-owner">Owner</span>
              <span className="badge badge-member">Member</span>
            </div>
            <p style={{fontSize:'0.855rem',color:'var(--sub)',marginBottom:12,lineHeight:1.65}}>Each Companion generates the tertiary-orientation thinking that drains its matching profile, so the user reviews and judges instead of producing from a blank page. The system prompt is composed server-side per call (SOT preamble + companion base + mode task + the user's own profile, read from their assessment) in <code>lib/companion-prompts.js</code> and never reaches the browser. All three share one route, <code>/api/portal/companion</code>, and a 50-call-per-user daily cap. Every call writes a row to <code>tool_sessions</code>.</p>
            <Card title="Precision Companion · license: precision_companion · supports tertiary HOW">Modes: Decompose (goal to milestones/workstreams/tasks), Pre-Flight (deliverable checklist), Gap Review (paste a draft, get what's missing), Edge Cases (boundary conditions and failure modes), Definition of Done (checkable completion criteria).</Card>
            <Card title="Purpose Companion · license: purpose_companion · supports tertiary WHY">Modes: Purpose Brief (a five-question guided interview, conversational — the full message history round-trips to the model each turn), North Star (one-pager from raw notes), So-What Translator (translate content into reader-specific meaning), Opening Lines (the purpose sentence that should open a message).</Card>
            <Card title="Progress Companion · license: progress_companion · supports tertiary WHAT">Modes: Good-Enough Threshold (pre-commit shipping criteria), Milestone Backplan (work backward from an end date to a visible checkpoint chain), Progress Broadcast (raw notes to a four-line weekly update), Closing Card (meeting notes to one action/owner/date/context).</Card>
            <div className="info-block"><strong>My Profile ordering:</strong> licensed Companions appear on <code>/portal/dashboard</code> with the one matching the user's own tertiary orientation listed first. An account with no license for a Companion never sees it, there is no locked-tool teaser.</div>
          </section>

          {/* ─── Orientation Translator ─── */}
          <section className="section" id="portal-translator">
            <div className="section-header">
              <h2 className="section-title">Orientation Translator</h2>
              <span className="section-path">/portal/tools/orientation-translator</span>
            </div>
            <div className="badges">
              <span className="badge badge-owner">Owner</span>
              <span className="badge badge-member">Member</span>
            </div>
            <p style={{fontSize:'0.855rem',color:'var(--sub)',marginBottom:12,lineHeight:1.65}}>A universal tool, not personalized to the caller's own profile: it translates a pasted message into WHY-speak, WHAT-speak, HOW-speak, all three at once, or the primary register of a named person's profile. Shares the same <code>/api/portal/companion</code> route as the Companions (<code>tool: "translator"</code>), the same license/auth/50-call daily cap pattern, but skips the "complete your assessment" requirement since it doesn't need the caller's own profile to run. Register definitions and the four-step translation method (extract, reorder, add what's missing and mark it <code>(proposed)</code>, shift the register) live in <code>lib/translation-prompts.js</code>, sourced verbatim from <code>MindPrint_Language_Framework.md</code> and shared with the Purpose Companion's So-What mode.</p>
            <Card title="license: orientation_translator">Every translation ends with a "What changed and why" note naming the moves made, and any added fact not present in the source (a date, an owner, a caveat) is marked <code>(proposed)</code> for the user to confirm before sending. Source register reads are phrased as hypotheses ("reads WHAT-forward"), never as a diagnosis of the author.</Card>
            <div className="info-block"><strong>Profile dropdown:</strong> if the account has a completed assessment, its own profile appears last in the "translate to a person's profile" list rather than defaulted, since people mostly translate to others.</div>
          </section>

          {/* ─── Client Library ─── */}
          <section className="section" id="portal-library">
            <div className="section-header">
              <h2 className="section-title">Client Library ("Resources" on the page)</h2>
              <span className="section-path">/portal/library</span>
            </div>
            <div className="badges">
              <span className="badge badge-owner">Owner</span>
              <span className="badge badge-member">Member</span>
            </div>
            <p style={{fontSize:'0.855rem',color:'var(--sub)',marginBottom:12,lineHeight:1.65}}>43 resources (a guide + template PDF each, 86 files) stored in the private <code>library</code> Supabase Storage bucket, cataloged in the <code>library_items</code> table (<code>onepager_path</code>/<code>kit_path</code> columns hold the guide/template files respectively; the column names predate the "guide"/"template" copy). Gated by <code>library_full</code> or a per-collection key (<code>library_a</code>…<code>library_e</code>); the page's collection filter chips only ever show collections the account is licensed for, and files are served through short-lived signed URLs generated after a server-side license check, never a public bucket URL.</p>
            <Card title="Page copy">The tab and eyebrow read "Resources"; the header reads "Your Curated Library of Support Resources". The body introduces the four support modes (Scaffold, Teach, Support, Replace) instead of describing file formats. Each card shows the resource's <code>summary</code> (sourced from the library pipeline's per-tool "lead" field) so a user can tell what it covers without opening it, plus Download Guide / Download Template buttons. Tool numbers are not shown in the UI, only used internally to identify files.</Card>
            <Card title="Collections">A amber, "Tertiary HOW Resources" · B blue, "Tertiary WHAT Resources" · C mint, "Tertiary WHY Resources" · D teal, "Universal Resources", always included with any library license · E emerald, "Teams Resources".</Card>
            <Card title="Default filter">The collection matching the user's own tertiary orientation, when the account is licensed for it; otherwise Collection D.</Card>
            <Card title="Regenerating content">PDFs are generated by the Python pipeline in <code>library-pipeline/</code> (see its own CLAUDE.md) into <code>curio_library/</code>. After any content change, re-run <code>npm run seed:library</code> (needs <code>SUPABASE_URL</code> / <code>SUPABASE_SERVICE_KEY</code>) to re-upload the PDFs and refresh <code>library_items</code>, including <code>summary</code>.</Card>
          </section>

          <hr className="divider" />

          {/* ═══ PUBLIC ═══ */}
          <SectionEyebrow>Public Flows</SectionEyebrow>

          <section className="section" id="public-flows">
            <div className="section-header">
              <h2 className="section-title">Public Pages</h2>
            </div>
            <div className="badges"><span className="badge badge-public">Public</span></div>
            <div className="table-wrap">
              <table className="ref-table">
                <thead><tr><th>URL</th><th>Purpose</th></tr></thead>
                <tbody>
                  <tr><td><code>/go/[token]</code></td><td>Token landing page. Redirects to Typeform with the token embedded. Entry point for all assessments.</td></tr>
                  <tr><td><code>/results/[type]</code></td><td>MindPrint™ profile results. If the token is unused, redirects to <code>/signup</code> with name/email pre-filled. If from portal, shows "← Back to dashboard."</td></tr>
                  <tr><td><code>/signup</code></td><td>Account creation. Accepts <code>?token=</code>, <code>?name=</code>, <code>?email=</code> params. Supports email or Google sign-up.</td></tr>
                  <tr><td><code>/portal/login</code></td><td>Portal login with email/password or Google. Includes forgot-password flow.</td></tr>
                  <tr><td><code>/career</code></td><td>Public-facing Career Guidance Tool.</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="section" id="email-notifications">
            <div className="section-header">
              <h2 className="section-title">Email Notifications</h2>
            </div>
            <p style={{fontSize:'0.855rem',color:'var(--sub)',marginBottom:12,lineHeight:1.65}}>All outbound email goes through Resend from <code>hello@choosecurio.com</code> (participant-facing) or <code>notifications@choosecurio.com</code> (admin notifications to you). You receive a BCC on every participant email.</p>
            <div className="table-wrap">
              <table className="ref-table">
                <thead><tr><th>Trigger</th><th>Recipient</th><th>Subject</th></tr></thead>
                <tbody>
                  <tr><td>New portal account created</td><td>You</td><td>"New Portal Account — [Name]"</td></tr>
                  <tr><td>Assessment completed + account created</td><td>You</td><td>"MindPrint™ Assessment Completed — [Name]"</td></tr>
                  <tr><td>Token link sent (admin panel)</td><td>Participant + BCC you</td><td>"You're invited to take the MindPrint™ Assessment"</td></tr>
                  <tr><td>Token link sent (portal owner)</td><td>Participant + BCC you</td><td>"Your MindPrint™ Assessment Link"</td></tr>
                  <tr><td>Team member invited (portal)</td><td>New member</td><td>"You've been added to [Account] on Curio"</td></tr>
                  <tr><td>Admin invite (new account)</td><td>New account owner</td><td>"You're invited to Curio"</td></tr>
                  <tr><td>Forgot password</td><td>User</td><td>"Reset your Curio password"</td></tr>
                </tbody>
              </table>
            </div>
          </section>

        </main>
      </div>
    </>
  );
}

function Card({ title, children }) {
  return (
    <div className="feature-card">
      <div className="feature-card-title"><span className="dot"></span>{title}</div>
      <div style={{fontSize:'0.855rem',color:'var(--sub)',lineHeight:1.65}}>{children}</div>
    </div>
  );
}

function Step({ n, children }) {
  return (
    <div className="step">
      <div className="step-num">{n}</div>
      <div className="step-body">{children}</div>
    </div>
  );
}

function SectionEyebrow({ children }) {
  return <div style={{fontSize:'0.68rem',letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--green)',fontWeight:700,marginBottom:24}}>{children}</div>;
}

const css = `
  :root {
    --navy:   #0F172A;
    --green:  #059669;
    --green-l:#D1FAE5;
    --green-d:#065F46;
    --bg:     #F8FAFC;
    --card:   #FFFFFF;
    --border: #E2E8F0;
    --text:   #0F172A;
    --sub:    #475569;
    --muted:  #94A3B8;
    --code-bg:#F1F5F9;
    --badge-admin-bg:  #1E3A5F;
    --badge-admin-fg:  #BFDBFE;
    --badge-owner-bg:  #0F172A;
    --badge-owner-fg:  #34D399;
    --badge-member-bg: #F1F5F9;
    --badge-member-fg: #475569;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0B1120; --card: #1E293B; --border: #334155;
      --text: #F1F5F9; --sub: #94A3B8; --muted: #64748B; --code-bg: #0F172A;
      --badge-member-bg: #1E293B; --badge-member-fg: #94A3B8;
    }
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--text); font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.65; min-height: 100vh; }
  .shell { display: grid; grid-template-columns: 220px 1fr; min-height: 100vh; }
  .sidebar { background: var(--navy); position: sticky; top: 0; height: 100vh; overflow-y: auto; display: flex; flex-direction: column; padding: 28px 0 24px; flex-shrink: 0; }
  .sidebar-brand { padding: 0 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.08); margin-bottom: 16px; }
  .sidebar-wordmark { font-family: Georgia, 'Times New Roman', serif; font-size: 1.5rem; font-weight: 700; color: #fff; letter-spacing: -0.02em; }
  .sidebar-wordmark span { color: var(--green); }
  .sidebar-subtitle { font-size: 0.68rem; color: rgba(255,255,255,0.3); letter-spacing: 0.12em; text-transform: uppercase; margin-top: 4px; }
  .nav-group { margin-bottom: 4px; }
  .nav-group-label { font-size: 0.62rem; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.25); padding: 10px 20px 4px; font-weight: 600; }
  .nav-link { display: block; padding: 7px 20px; color: rgba(255,255,255,0.5); text-decoration: none; font-size: 0.82rem; font-weight: 500; transition: color 0.1s, background 0.1s; border-left: 2px solid transparent; }
  .nav-link:hover { color: rgba(255,255,255,0.9); background: rgba(255,255,255,0.04); border-left-color: var(--green); }
  .nav-link.active { color: #34D399; background: rgba(5,150,105,0.12); border-left-color: var(--green); }
  .content { padding: 48px 56px 80px; max-width: 860px; }
  .page-header { margin-bottom: 48px; padding-bottom: 28px; border-bottom: 1px solid var(--border); }
  .page-eyebrow { font-size: 0.68rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--green); font-weight: 700; margin-bottom: 10px; }
  .page-title { font-family: Georgia, 'Times New Roman', serif; font-size: 2.2rem; font-weight: 700; color: var(--text); line-height: 1.2; letter-spacing: -0.02em; margin-bottom: 12px; }
  .page-desc { font-size: 0.95rem; color: var(--sub); max-width: 560px; line-height: 1.7; }
  .page-meta { margin-top: 14px; font-size: 0.78rem; color: var(--muted); }
  .section { margin-bottom: 52px; scroll-margin-top: 32px; }
  .section-header { display: flex; align-items: baseline; gap: 12px; margin-bottom: 18px; padding-bottom: 10px; border-bottom: 1px solid var(--border); flex-wrap: wrap; }
  .section-title { font-family: Georgia, 'Times New Roman', serif; font-size: 1.25rem; font-weight: 700; color: var(--text); letter-spacing: -0.01em; }
  .section-path { font-family: 'Courier New', monospace; font-size: 0.72rem; color: var(--muted); background: var(--code-bg); padding: 2px 7px; border-radius: 4px; border: 1px solid var(--border); white-space: nowrap; }
  .badges { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
  .badge { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 8px; border-radius: 4px; white-space: nowrap; }
  .badge-admin  { background: var(--badge-admin-bg);  color: var(--badge-admin-fg); }
  .badge-owner  { background: var(--badge-owner-bg);  color: var(--badge-owner-fg); border: 1px solid #34D39940; }
  .badge-member { background: var(--badge-member-bg); color: var(--badge-member-fg); }
  .badge-public { background: #7C3AED20; color: #7C3AED; border: 1px solid #7C3AED30; }
  .feature-card { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 18px 20px; margin-bottom: 12px; }
  .feature-card-title { font-size: 0.88rem; font-weight: 700; color: var(--text); margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
  .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); flex-shrink: 0; }
  .feature-card ul { padding-left: 18px; line-height: 1.7; margin-top: 6px; }
  .feature-card li { margin-bottom: 2px; }
  .info-block { background: #F0FDF4; border: 1px solid #BBF7D0; border-left: 3px solid var(--green); border-radius: 0 8px 8px 0; padding: 12px 16px; margin: 14px 0; font-size: 0.845rem; color: var(--green-d); line-height: 1.65; }
  .warn-block { background: #FEF9C3; border: 1px solid #FDE047; border-left: 3px solid #D97706; border-radius: 0 8px 8px 0; padding: 12px 16px; margin: 14px 0; font-size: 0.845rem; color: #92400E; line-height: 1.65; }
  @media (prefers-color-scheme: dark) {
    .info-block { background: rgba(5,150,105,0.1); color: #34D399; border-color: rgba(5,150,105,0.3); }
    .warn-block { background: rgba(217,119,6,0.1); color: #FCD34D; border-color: rgba(217,119,6,0.3); }
  }
  .steps { display: flex; flex-direction: column; gap: 10px; margin: 12px 0; }
  .step { display: flex; gap: 14px; align-items: flex-start; }
  .step-num { flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%; background: var(--navy); color: #fff; font-size: 0.72rem; font-weight: 700; display: flex; align-items: center; justify-content: center; margin-top: 2px; }
  .step-body { font-size: 0.855rem; color: var(--sub); line-height: 1.65; }
  .step-body strong { color: var(--text); }
  code { font-family: 'Courier New', monospace; font-size: 0.82em; background: var(--code-bg); border: 1px solid var(--border); padding: 1px 5px; border-radius: 3px; color: var(--text); }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 12px 0; }
  .table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: 8px; background: var(--card); }
  .ref-table { width: 100%; border-collapse: collapse; font-size: 0.845rem; }
  .ref-table th { text-align: left; padding: 8px 12px; border-bottom: 2px solid var(--border); font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--sub); }
  .ref-table td { padding: 9px 12px; border-bottom: 1px solid var(--border); color: var(--sub); vertical-align: top; }
  .ref-table td:first-child { color: var(--text); font-weight: 500; }
  .ref-table tr:last-child td { border-bottom: none; }
  .divider { border: none; border-top: 1px solid var(--border); margin: 40px 0; }
  @media (max-width: 700px) {
    .shell { grid-template-columns: 1fr; }
    .sidebar { position: static; height: auto; }
    .content { padding: 28px 20px 60px; }
    .grid-2 { grid-template-columns: 1fr; }
  }
`;
