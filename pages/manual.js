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
            <a href="#portal-tools-page" className="nav-link">Tools page</a>
            <a href="#portal-ai-delegation-guide" className="nav-link">AI & Delegation Guide</a>
            <a href="#portal-team" className="nav-link">My Team</a>
            <a href="#portal-dynamics" className="nav-link">Dynamics</a>
            <a href="#portal-onboarding-resources" className="nav-link">Onboarding Resources</a>
            <a href="#portal-tokens" className="nav-link">Send Assessment</a>
            <a href="#portal-analytics" className="nav-link">Analytics</a>
            <a href="#portal-meeting-architect" className="nav-link">Meeting Architect</a>
            <a href="#portal-team-builder" className="nav-link">Team Builder</a>
            <a href="#portal-assistant" className="nav-link">Curio Assistant</a>
            <a href="#portal-tools" className="nav-link">AI Tools</a>
            <a href="#portal-companions" className="nav-link">AI Companions</a>
            <a href="#portal-translator" className="nav-link">MindPrint Language Tools</a>
            <a href="#portal-library" className="nav-link">Client Library</a>
            <a href="#portal-insights" className="nav-link">Recent Articles</a>
          </div>

          <div className="nav-group">
            <div className="nav-group-label">Public</div>
            <a href="#public-flows" className="nav-link">Public Flows</a>
            <a href="#language-mirror" className="nav-link">Language Mirror (hidden)</a>
            <a href="#email-notifications" className="nav-link">Email Notifications</a>
          </div>
        </nav>

        {/* Content */}
        <main className="content">

          <div className="page-header">
            <div className="page-eyebrow">Curio Internal Reference</div>
            <h1 className="page-title">Product Manual</h1>
            <p className="page-desc">A complete reference for the Curio platform — covering the admin panel, the client portal, access control, and how all the pieces connect.</p>
            <div className="page-meta">Last updated October 2026 · choosecurio.com</div>
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
              <Card title="AI Tools">Role Analyzer, Career Guidance Tool, and Job Description Analyzer — all powered by the MindPrint™ profile and streamed in real time. Gated by license.</Card>
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
                  <tr><td><span className="badge badge-owner">Owner</span></td><td>Enterprise account lead</td><td>Distribute assessment links to their team, invite portal members, view all team assessment results and analytics, use licensed AI tools.</td></tr>
                  <tr><td><span className="badge badge-member">Member</span></td><td>Enterprise team member</td><td>View their own profile. Use licensed AI tools. Cannot see other team members' results, distribute links, or invite others.</td></tr>
                  <tr><td><span className="badge badge-public">Individual</span></td><td>Self-serve / solo user</td><td>View their own profile, use tools they have licenses for. No team features.</td></tr>
                </tbody>
              </table>
            </div>
            <div className="info-block"><strong>Owner vs Member visibility:</strong> A member only ever sees their own MindPrint™ profile — they have no page that shows other team members' results. Owners and managers see the whole account's (or their team's) results and analytics together on Analytics. The account-level <code>restrict_results</code> field still exists in the schema but is no longer read anywhere — it only ever gated the member-facing Assessment Results page, which was retired once members had no use for it.</div>
          </section>

          {/* ─── Assessment Flow ─── */}
          <section className="section" id="assessment-flow">
            <div className="section-header">
              <h2 className="section-title">Assessment Flow</h2>
            </div>
            <div className="steps">
              <Step n={1}><strong>Token is generated</strong> — by you in the admin Tokens tab, or by an enterprise owner from their portal. Each token is a UUID linked to an account and engagement.</Step>
              <Step n={2}><strong>Link is sent</strong> — <code>choosecurio.com/go/[token]</code>. The token can be pre-assigned to an email/name or sent blank.</Step>
              <Step n={3}><strong>Participant takes the Typeform quiz</strong> — roughly 7-10 minutes. On completion, a webhook fires and marks the token <em>used</em>, storing the H/W/Y scores and profile type.</Step>
              <Step n={4}><strong>Results page</strong> — <code>/results/[type]</code> holds off rendering the profile (a brief spinner instead) while it looks up the token, so a brand-new participant never sees their results flash before the redirect below fires. An unused token belonging to an existing account (e.g. an owner or team member retaking their own pending assessment from the dashboard) is applied directly to that account if they're still logged in, and they land straight back on their dashboard, never re-shown a signup form. A cold token with no account yet redirects to <code>/signup</code> to create one. Only if neither applies (unused token, already-used token, or a logged-in session that doesn't own it) does the full profile render in place.</Step>
              <Step n={5}><strong>Account creation</strong> — token is consumed, licenses are granted, and the participant lands in their portal dashboard. You receive a notification email.</Step>
            </div>
            <div className="warn-block"><strong>Tokens are single-use.</strong> Once a participant creates an account with a token, it's marked used. A second person who clicks the same link will see the results page but won't receive any licenses when they sign up.</div>
            <Card title="Self-Serve Purchase Flow (choosecurio.com/buy)">
              When someone purchases directly via the public buy page, Stripe fires a webhook (<code>checkout.session.completed</code>) that generates an assessment token, stores a purchase record, and sends a confirmation email with the token link. The buyer then lands on <code>/buy/success</code>, where the primary call to action is <strong>"Begin Assessment →"</strong> — this links directly to their <code>/go/[token]</code> URL so they take the assessment immediately and create their account at the end (the same flow as all other token paths). If the token cannot be resolved in time, the page falls back to directing them to check their inbox for the emailed link. Account creation before assessment completion is no longer offered on this page, which prevents landing on an empty dashboard.
            </Card>
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
            <Card title="Individual Access">Creates a single token for one person. Fields: name, email, purpose (assessment or career), tier (basic/premium), tool access, engagement ID, and access duration. The duration selector offers four options: <strong>1 Month</strong>, <strong>1 Year</strong> (default), <strong>2 Years</strong>, or <strong>Custom</strong> (date picker). The token URL is shown immediately with a "Send Link" button to email it directly from the admin.</Card>
            <Card title="How tier gets derived from tool access">Picking the tier dropdown is a shortcut, not the source of truth — the token's stored <code>granted_tier</code> is actually derived from whichever tools end up checked. It's <strong>premium</strong> the moment the grant includes any one of Role Analyzer, Career Guidance, or JD Analyzer (not all three) — plain Assessment Tokens access alone stays <strong>basic</strong>. This same rule runs in both token-creation paths (<code>pages/api/tokens/generate.js</code> and the account Token Pool's <code>generate-tokens.js</code>) so they always agree. This derived tier is also the single switch that gates premium-only portal tools like the AI &amp; Delegation Guide's task classifier — none of the Companion or Resources-collection checkboxes affect it either way.</Card>
            <Card title="Tool access: Companion / Library — matches their profile">The tool access checklist includes two special options — <strong>Companion — matches their profile</strong> and <strong>Client Library — matches their profile</strong> — alongside the specific Companion and Resources-collection checkboxes. Check these instead of guessing a profile upfront: the participant hasn't taken the assessment yet at token-creation time, so there's nothing to pre-select. They're stored on the token as-is, then resolved into the real Companion or collection license (e.g. tertiary HOW → Precision Companion, Collection A) the moment the participant's assessment completes — in <code>pages/api/auth/signup.js</code> for a brand-new account, or <code>pages/api/portal/complete-assessment.js</code> if they're already logged in and retaking. The specific per-Companion/per-collection checkboxes remain for building demo accounts, where a profile is deliberately chosen ahead of time.</Card>
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
            <Card title="Cohort Overview">Lists all engagement IDs that have tokens. Click any engagement to expand a cohort view showing completion rate, profile type breakdown across the group, and a per-participant status table with an Expires column showing each token's expiration date. A "Generate More" button pre-fills the Tokens tab with that engagement ID to top up the pool.</Card>
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
            <Card title="Account List">All client accounts with type (free / paid / enterprise), tier (basic / premium), login provider, status, last login, and an Expiry column showing the soonest upcoming license expiration date (shown in red if already past due, "No expiry" if none set). Filterable by type, tier, and name/email search.</Card>
            <Card title="Invite New Account">Creates a portal account and sends a setup email. Set tier and attach licenses (assessment tokens, role analyzer, career guidance, JD analyzer, the three AI Companions, the Orientation Translator, Session Architect, Meeting Architect, the Team account flag that turns on My Team, the Curio Assistant, extra Resources collections beyond the free default) at creation time.</Card>
            <Card title="Edit Account">
              Click <strong>Edit</strong> on any account to expand a panel with these sections:
              <ul>
                <li><strong>Tier & Licenses</strong> — change tier (saved via "Update Profile"), add or remove licenses with quantity and expiry. Each add/remove hits <code>/api/admin/accounts/[id]/licenses</code> immediately, one license at a time — not batched into the tier save. A blanket delete-all/reinsert-all on every save used to run here, which silently discarded any license this browser tab's Edit panel didn't know about (a Stripe renewal, another admin tab open on the same account) — most visibly <code>assessment_tokens</code>, whose loss hides the entire My Team nav group for that account. Immediate per-license calls remove that staleness window entirely.</li>
                <li><strong>Users & Roles</strong> — see all portal users on the account with their current role and team. Change a user's role with the Owner / Manager / Member dropdown, and their team with the adjacent team dropdown, instantly. The <strong>+ Add User</strong> row creates a new portal login directly on this account (no assessment required) and emails them a "set up your account" link via the same <code>admin_invite</code> template Invite New Account uses — this is the only way to add a brand-new login to an existing account; it's admin-only, there's no owner/manager-facing equivalent (see My Team below).</li>
                <li><strong>Teams</strong> — create or delete sub-teams within an enterprise account. Deleting a team unassigns its members and tokens rather than deleting them. A Manager's visibility and actions in the portal are scoped to whichever team they're assigned to here, so a team must exist before assigning anyone the Manager role meaningfully.</li>
                <li><strong>MindPrint™ Profiles</strong> — one row per login on the account, with that person's own profile (or "No profile") and a <strong>Set profile</strong> button (<code>lib/adminProfiles.js</code>, <code>/api/admin/accounts/[id]/profiles</code>). Two ways to set it:
                  <ul>
                    <li><strong>Copy from an existing assessment</strong> — search every account's assessments by name or email (e.g. the same person's old email), then "Use this". The profile, scores, and original date are copied to this login. If the assessment is on another account, that account keeps it untouched. If it's on this same account (the same person under an old email), it's moved to this login rather than duplicated, so team views don't list them twice; the old login no longer has it.</li>
                    <li><strong>Enter manually</strong> — pick one of the six profiles, scores optional (all three or none; if they don't tie they must point at the chosen profile). Use this when someone has no assessment to copy.</li>
                  </ul>
                  Either way the login then works exactly as if they'd taken the assessment: profile page, AI &amp; Delegation Guide, their Companion, Resources, and team views. The profile is saved with the login's exact email on both the assessment and its assessment link (every portal lookup and the team roster match on email); a person with an unused assessment link already assigned to their email gets that link completed rather than a second one. Copied and hand-entered profiles are marked in <code>assessments.source</code> (<code>admin_copied</code> / <code>admin_entered</code>; null = took the assessment), shown as a tag next to the profile here and in the copy search. That column comes from <code>supabase/migrations/0013_assessment_source.sql</code>; until it's run, profiles still save, just without the tag. Every change targets one specific login. The old account-level "Update Profile" (removed) changed whichever assessment on the account was newest, which on a team account could be a teammate's, and saved the type as <code>why_what</code> instead of <code>why-what</code>. Licenses: on a single-person account, when the tertiary changes, the Companion and Resources collection licenses that existed for the old tertiary move to the new one (nothing new is granted). On a team account licenses are shared, so they're never changed.</li>
                <li><strong>Token Pool</strong> — click "Show ▼" to see Total / Available / Sent / Completed counts, a scrollable token table (including each token's Team, Expires date shown in red once past due), and a green <strong>Add Tokens</strong> form. Enter a quantity, optional engagement label, and — once the account has teams — a Team to assign the new batch to (leave as "Enterprise-wide" to keep them outside any team's pool). Tokens generated for a team are only visible to and sendable by that team's manager, not other teams' managers.</li>
                <li><strong>Purchase History</strong> — Stripe purchase records linked to this account.</li>
              </ul>
            </Card>
            <div className="info-block"><strong>To give an enterprise account their token allocation:</strong> Edit the account → Token Pool → enter quantity → click "Add Tokens". Those tokens immediately appear as available links on the owner's Send Assessment page in the portal.</div>
          </section>

          <section className="section" id="admin-emails">
            <div className="section-header">
              <h2 className="section-title">Emails</h2>
              <span className="section-path">/admin → Emails</span>
              <span className="badge badge-admin">Admin</span>
            </div>
            <Card title="Email List">All transactional and custom emails in one table. Columns: <strong>Email</strong> (name + description), <strong>Recipient</strong> (who gets it), <strong>Trigger</strong> (what event fires it), <strong>Schedule</strong> (when/how often), <strong>Status</strong> (Default / Customized / Custom). Built-in emails show Default until their body is saved; custom emails you created always show Custom.</Card>
            <Card title="Edit View">Click <strong>Edit</strong> on any row. Built-in emails show a read-only metadata summary (recipient, trigger, schedule, send type) above the subject and HTML body editor. Custom emails allow all fields to be edited — name, recipient, trigger, schedule, send type, subject, and body. Save with the <strong>Save</strong> button. Variables use double-braces: <code>{'{{name}}'}</code>, <code>{'{{renewalUrl}}'}</code>.</Card>
            <Card title="Send Test Email">In the edit view, enter any address and click <strong>Send Test</strong>. Delivers immediately with a <strong>[TEST]</strong> prefix in the subject. Requires a saved custom body.</Card>
            <Card title="Send Now (Manual Emails)">Manual emails show a <strong>Send Now</strong> field in the edit view and a <strong>Send</strong> button in the list. Enter one or more comma-separated email addresses and send immediately. Useful for announcements, follow-ups, or one-off outreach without leaving the admin panel.</Card>
            <Card title="Create New Email">Click <strong>+ New Email</strong> to open the creation form. Fields: name, recipient description, description, send type (Manual or Automated), trigger (if automated), schedule/timing, subject, and HTML body. Automated emails fire when their trigger event occurs — currently supported triggers map to existing cron jobs and webhook events. A new trigger type (e.g. a new lifecycle event) requires a one-time code addition to wire it in, but once added it appears in the trigger dropdown for future emails.</Card>
            <div className="info-block">All emails — built-in and custom — are stored in the <code>email_templates</code> Supabase table. Built-in emails fall back to the hardcoded defaults in <code>lib/emailTemplates.js</code> if no saved body exists. Custom emails are flagged <code>is_custom = true</code> and are fully DB-driven.</div>
            <Card title="Weekly Profile Tips — on/off switch">A green/gray banner at the top of this Emails tab toggles the whole feature on or off with one click — no code change or deploy needed. Backed by a single row in a generic <code>app_settings</code> table (<code>weekly_tips_enabled</code>). Starts OFF for every new deployment; the weekly cron always runs on schedule but checks this flag first and sends nothing while it's off.</Card>
            <Card title="Weekly Profile Tips — what it sends">Every Monday (<code>/api/cron/weekly-tips</code>, scheduled in <code>vercel.json</code>), anyone with a completed assessment — any tier, any role, owner/manager/member alike — who hasn't unsubscribed gets the next tip in their own profile's 20-tip sequence, one person's own <code>tip_index</code> ahead per week (starts at Tip 1, never loops once all 20 are sent). The recipient list is every <code>client_users</code> row across every account whose own assessment resolves via the same <code>resolveMyProfile()</code> matching used everywhere else in the portal.</Card>
            <Card title="Weekly Profile Tips — content and design">The 120 tips (6 profiles × 20) live in <code>lib/weeklyTips.js</code> as static content — changing tip copy needs a code deploy. The card's visual design is the <strong>"Weekly Profile Tip"</strong> row in this same Emails list, so its HTML is editable and testable exactly like any other template here, with no deploy required to change how it looks. Above the card, the email opens with a short line explaining what the weekly tip is and a link back to choosecurio.com, before the tip card itself.</Card>
            <Card title="Weekly Profile Tips — unsubscribe">Every send includes a one-click, no-login-required unsubscribe link (<code>/api/unsubscribe</code>, HMAC-signed the same way portal session cookies are) plus a <code>List-Unsubscribe</code> header. Clicking it sets <code>client_users.weekly_tip_opt_out = true</code> permanently for that person; nothing else about their account changes, and it has no effect on any other (transactional) email they receive.</Card>
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
                <li><strong>Your tools →</strong> — a filled button at the bottom of the profile header, next to the PDF link, that opens the Tools page. The profile page itself no longer lists tools, to keep it clean.</li>
                <li><strong>Download Full Profile PDF</strong> — downloads the full profile as a real PDF file in one tap (<code>lib/profilePdf.js</code>, built in the browser with <code>jsPDF</code>, same approach as the Onboarding Resources and Meeting Architect PDFs), with the person's name on the cover; saved as <code>curio-mindprint-profile-&lt;type&gt;-&lt;name&gt;.pdf</code>. The results page's two "Save as PDF" buttons (<code>/results/[type]</code>) use the same builder. This replaced an HTML print page opened in a new tab, which iPhones often wouldn't open and which took two more taps to reach a PDF. When the results page is opened from the portal (<code>?from=portal</code>), its top link reads "Back to dashboard" and returns here.</li>
                <li>If the user hasn't completed an assessment yet, a pending state is shown. If they have an unused assessment token on the account, a <strong>Start Your Assessment →</strong> button links straight to their <code>/go/&lt;token&gt;</code> link, with an <strong>Email me the link</strong> fallback (<code>/api/portal/resend-assessment</code>) that re-sends the same link to their own address. If no token is found at all, it falls back to "Check your email for the link."</li>
                <li>The profile hero band carries an enlarged brain/fingerprint mark (<code>/images/brain-fingerprint-watermark.webp</code>) as a faint watermark in its top-right corner, clipped by the band's own edge so roughly 35% of it bleeds off the page. Purely decorative (<code>aria-hidden</code>, non-interactive) — sits behind all profile text.</li>
              </ul>
            </Card>
            <Card title="Whose assessment is &quot;mine&quot;?">Resolved by the shared <code>resolveMyProfile()</code> helper in <code>lib/ownProfile.js</code> (also used by <code>/api/portal/ai-delegation-guide</code>), which matches the logged-in user's own completed assessment by email against every token the account has ever issued — never a team-scoped subset, even for a manager, since a manager's own assessment may have been taken on a token from before they were ever assigned to a team. If nothing matches, the account has exactly one assessment, and it has only ever issued one assessment link, it falls back to that one (covers a genuine single-person account whose stored assessment email differs slightly from their portal login email). It never falls back on an account with more than one link: on a team account the one finished assessment is a teammate's, and every other login used to be shown it as their own profile. If the account has more than one assessment and none match, <code>myAssessment</code> stays null rather than falling back to some other person's. This same value drives <code>isIndividual</code> (used for this page's own My-Profile-vs-team-overview layout choice, and to gate the AI &amp; Delegation Guide tab) and the tertiary used for the free Companion/Resources defaults below.</Card>
            <Card title="isTeamAccount and the nav">My Team / Send Assessment / Analytics are gated in <code>components/PortalSidebar.js</code> by <code>isTeamAccount</code> together with an owner-only check on all three. The rule lives in one place, <code>lib/teamAccount.js</code>: an account is a team account if it has more than one assessment token, <strong>or</strong> it has an active <code>team_account</code> license. A self-serve buyer's account is provisioned with exactly one token (their own), so these tabs correctly stay hidden for them; any account with a real token pool — however it was provisioned — sees them. The <code>team_account</code> license (admin Accounts → Edit Account → Tier &amp; Licenses → "team account") is the explicit override for an admin-invited owner who only has their own token so far: add it and My Team appears on their next page load; remove it (or let its expiry date pass) and the account falls back to the token count. The same rule also decides whether an owner gets the AI &amp; Delegation Guide's six-profile switcher, and an account with this license shows as Enterprise in the admin Account List. Every portal page must pass <code>isTeamAccount</code> to the sidebar, or My Team silently disappears while the user is on that page: pages that load <code>/api/portal/dashboard</code> pass its <code>isTeamAccount</code> field, and pages that use <code>loadCompanionProps</code> (<code>lib/companionAuth.js</code>: Session Architect, Meeting Architect, Orientation Translator, the three Companions) get the same value computed there with the same rule. <code>client_accounts.tier</code> ('basic' | 'premium') is not used for this, since it never holds an 'enterprise' value.</Card>
            <Card title="My Team accordion">Send Assessment and Analytics render as an indented, collapsible group under <strong>My Team</strong> rather than separate top-level tabs. Clicking the label navigates to My Team as normal; clicking the chevron toggles the group open or closed without navigating. It auto-opens when the active page is My Team or one of the grouped pages. A member never sees any of this — My Team, Send Assessment, and Analytics are all owner/manager only, and a member has no assessment-results view of any kind any more (see Roles &amp; Access above).</Card>
            <Card title="Your Communication Field Guide">A card just below the profile hero, shown to any user with a completed assessment, no extra license required. <strong>View Field Guide →</strong> is a plain link to the web page at <code>/portal/library/field-guide/&lt;profile&gt;</code> matching the user's own profile (e.g. <code>why-what</code>) — no signed URL or PDF fetch involved, same as the Resources page's own field guide cards.</Card>
          </section>

          <section className="section" id="portal-ai-delegation-guide">
            <div className="section-header">
              <h2 className="section-title">AI &amp; Delegation Guide</h2>
              <span className="section-path">/portal/tools/ai-delegation-guide</span>
            </div>
            <Card title="What it is">A static, tier-agnostic task-routing table per MindPrint™ profile: for each of a profile's ten named tertiary (draining) task types, whether to hand it to AI, delegate it to a teammate, or collaborate on it, with a one-line rationale and a link to the relevant scaffold tool in the Client Library (<code>/portal/library/&lt;slug&gt;</code>). Content lives in <code>lib/aiDelegationGuide.js</code> — no AI generation, no per-call cost, both basic and premium tiers see it. Named "AI &amp; Delegation Guide" rather than "Tertiary Support" specifically to avoid colliding with the existing Resources tab, which is already branded end-to-end as the "MindPrint™ Tertiary Support Library" (a different feature — a PDF library, not a task-routing table).</Card>
            <Card title="Access — nav gate">Hidden entirely (in <code>components/PortalSidebar.js</code>, via a <code>requiresProfile</code> nav flag) until the logged-in user has a completed assessment of their own — no license or tier requirement, since it depends only on having a profile to render a table for.</Card>
            <Card title="Access — whose table you see">Enforced server-side in <code>/api/portal/ai-delegation-guide</code>, never just hidden client-side: a plain member, or a solo self-serve buyer with no one to manage, receives only their own profile's table over the wire. A manager, or an owner of a genuine multi-person team account, additionally receives all six profiles and a switcher to browse any of them — for coaching direct reports, not restricted to their own team's actual profile mix. A solo owner (exactly one token ever issued on the account, same signal as <code>isTeamAccount</code> elsewhere) does not get the switcher, even though the role column says "owner" — there's no one for them to coach.</Card>
            <Card title="Universal Supports">A collapsible panel below the task table (collapsed by default), listing four tools that apply regardless of profile: the Energy Budget Planner, the Tertiary Triage Decision Tree, the Team Trade Board, and the Drain Signals Field Guide.</Card>
            <Card title="Task Classifier (premium)">Below the static table, premium accounts get a free-text module: describe any task in your own words and get a live AI routing call — AI / Delegate / Collaborate / not tertiary at all — with a one-line rationale and, where relevant, a specific scaffold tool link. Absent entirely for basic accounts (gated by <code>tier !== 'basic'</code>, re-checked server-side on every call, not just hidden client-side). Served by <code>/api/portal/tertiary-task-classify</code>.</Card>
            <Card title="Classifier — whose profile it classifies against">Same <code>canSwitch</code> rule as the table's switcher above (<code>role === 'manager' || (role === 'owner' &amp;&amp; isTeamAccount)</code>): a plain member or solo owner always gets classified against their own completed assessment, and any <code>profileCode</code> sent from the client is silently ignored for them — never trusted at face value. A manager or multi-person-team owner may pass a <code>profileCode</code> for whichever of the six profiles they currently have selected in the switcher, and it's honored.</Card>
            <Card title="Classifier — generation grounding">Every call re-reads <code>/ai_delegation_task_classifier_system_prompt.md</code> and <code>lib/mindprint-source-of-truth.md</code> from disk (never cached, always current) and injects, verbatim: the Section 2 language rules, the Section 3 energy model, only the requested profile's Section 4 truth-table slice (never the other five profiles' text), and the Section 8 Layer 1 non-negotiable prohibitions. It also injects the existing static task-routing table for that profile (<code>lib/aiDelegationGuide.js</code>, calibration reference only) and a closed candidate list of exactly the 14 scaffold tools that profile is allowed to cite — its matched Collection (A/B/C) plus Collection D's four universal tools, built from <code>lib/guideContent.js</code> via <code>lib/aiDelegationCandidates.js</code>. Any scaffold the model returns that isn't an exact match against that candidate list (by slug and number) is stripped server-side before the response ever reaches the client, and logged.</Card>
            <Card title="Classifier — cost &amp; abuse controls">Capped at 25 calls per user per UTC calendar day (own counter from the shared <code>tool_sessions</code> table, tool name <code>tertiary_task_classify</code> — separate from the Companion tools' 50/day cap). Task input is limited to 1000 characters and wrapped in the request as data to classify, never as instructions to the model. Uses the same non-streaming <code>claude-sonnet-4-6</code> call pattern as the Companion tools (a single small JSON object back, no need for SSE).</Card>
            <Card title="Not built yet">Collection E (team/meeting tools) is deliberately out of scope for the classifier's candidate list — it needs a team context this page doesn't use content from yet.</Card>
          </section>

          <section className="section" id="portal-renewal">
            <div className="section-header">
              <h2 className="section-title">License Expiry &amp; Renewal</h2>
              <span className="section-path">/portal/dashboard</span>
            </div>
            <Card title="Expiry Banners">The portal dashboard checks the earliest active license expiry for the account on every load. Two banners may appear at the top of the main content area:
              <ul>
                <li><strong>Amber banner</strong> — shown when the license expires within 30 days. Displays the exact expiry date and a "Renew Now →" button.</li>
                <li><strong>Red banner</strong> — shown when all licenses have expired (no active licenses remain). Displays a "Renew Access →" button. Tool access is suspended until renewed.</li>
              </ul>
            </Card>
            <Card title="Renewal Flow">Clicking either renewal button calls <code>/api/portal/renewal-checkout</code>, which creates a Stripe Checkout session for the account's current tier (basic or premium — same price as the original purchase). On payment success, the Stripe webhook extends all account_licenses <code>expires_at</code> values by one year from their current expiry date (not from today), so time is never lost. A renewal confirmation email is sent to the buyer.</Card>
            <Card title="Automated Reminder Emails">A Vercel Cron job (<code>/api/cron/renewal-reminders</code>, runs daily at 12:00 UTC) sends two types of reminders:
              <ul>
                <li>30-day warning email to the primary account user when a license expires in 29–31 days.</li>
                <li>Expiry notice email on the day the license expires (within the last 24 hours).</li>
              </ul>
              Emails are sent once per account, using the earliest expiry across all licenses.
            </Card>
            <Card title="Default Expiry">All newly created accounts (self-serve purchases and admin-generated tokens) are assigned a one-year expiry by default. The admin token generator offers 1 Month, 1 Year (default), 2 Years, or Custom.</Card>
          </section>

          <section className="section" id="portal-team">
            <div className="section-header">
              <h2 className="section-title">My Team</h2>
              <span className="section-path">/portal/team</span>
            </div>
            <div className="badges"><span className="badge badge-owner">Owner and Manager</span></div>
            <Card title="Token Pool Summary">Four stat tiles at the top: Total, Available, Sent, and Completed tokens. An owner sees the whole account's pool; a manager sees only their own team's.</Card>
            <Card title="Teams (owner only, self-serve)">Owners can create and delete sub-teams directly from this page without needing admin — enter a name and click "+ Add Team". Deleting a team unassigns its members and tokens (sets <code>team_id</code> to null) rather than deleting them. Every mutation here (<code>/api/portal/teams</code>) verifies the team actually belongs to the caller's own account before acting, since a self-serve owner session — unlike an admin session — is not trusted for other accounts.</Card>
            <Card title="No self-serve invite">Owners and managers cannot create a brand-new portal login from here. Creating a login with no assessment attached (an owner/manager account that will never take the MindPrint™ assessment) is an admin-only action now — see admin Accounts → Edit Account → Users & Roles. Getting a <em>new</em> person onto the roster self-serve still works two ways: send them an assessment link (Send Assessment tab) — completing it auto-creates their account as a <code>member</code> — or promote an existing member to Manager/Owner and assign their team right here in the Team Table below.</Card>
            <Card title="Team Table">An owner sees every portal user on the account and gets an inline Role dropdown (Owner / Manager / Member) and Team dropdown per row to reassign either instantly — this is how a member becomes a manager and gets attached to a team. An owner cannot change their own role here (a safety guard against accidentally locking themselves out) and cannot remove themselves. A manager sees only the users on their own team, as plain read-only rows with no dropdowns. Columns: name, email, role, team (owner only), assessment status (No Token / Invited / Completed), MindPrint™ profile type, and join date.</Card>
            <Card title="Manager role and team scoping">A third role, <code>manager</code>, sits alongside owner and member on <code>client_users</code>, backed by a <code>teams</code> table and a <code>team_id</code> column on both <code>client_users</code> and <code>tokens</code> — assignable here by the owner, or in admin Accounts → Edit Account → Teams and Users & Roles. A manager sees the same five tabs as an owner — My Team, Dynamics, Onboarding Resources, Send Assessment, Analytics — but every one of them is filtered server-side to the manager's own <code>team_id</code>, including the link pool they can send from on Send Assessment (their one write action) and the stats/recent-assessments shown on their own My Profile dashboard. A manager gets no other owner action: no invite/remove, no team creation/deletion, no license or tier changes, no visibility into other teams or the enterprise-wide unassigned token pool. <code>isTeamAccount</code> (which gates whether these tabs appear at all) is still computed from the whole account's token count, not the manager's own team size, so a small or brand-new team doesn't lose the tabs.</Card>
          </section>

          {/* ─── Dynamics ─── */}
          <section className="section" id="portal-dynamics">
            <div className="section-header">
              <h2 className="section-title">Dynamics</h2>
              <span className="section-path">/portal/team-dynamics</span>
            </div>
            <div className="badges"><span className="badge badge-owner">Owner and Manager</span></div>
            <p style={{fontSize:'0.855rem',color:'var(--sub)',marginBottom:12,lineHeight:1.65}}>Formerly the standalone <code>/workshop</code> dashboard (retired) — moved into the portal as a tab under My Team, gated the same way (<code>assessment_tokens</code> license + <code>isTeamAccount</code> + owner/manager). The manual team/participant entry is gone: it now auto-populates from the account's real roster instead, same <code>/api/portal/team</code> data Session Architect uses, filtered to members with a completed MindPrint™ assessment (unresolved members can't be placed on the WHY/WHAT/HOW grid).</p>
            <Card title="Team switcher">A manager's roster is already scoped server-side to their own team, so there's nothing to switch — no tabs shown. An owner with no named sub-teams sees the whole account as one implicit team, also no tabs. An owner with actual sub-teams (<code>/portal/team</code>'s Teams panel) gets a pill-tab row, one per team plus "Unassigned" when that bucket has anyone with a completed profile, defaulting to whichever team has the most eligible people rather than array order.</Card>
            <Card title="Six analysis modules">Team Canvas (type distribution + member grid), Problem Match (lead/support/caution/hold-back roles by work type), Friction Spotter (pairwise tension patterns for all 21 type combinations), Energy Map (energizes/neutral/drains per person), Collaboration (AI-recommended pairings for a described task, via <code>/api/analyze</code>), and Blind Spot Report (missing-primary and tertiary-clustering risks). All content lives in <code>components/TeamDynamics.js</code>, verbatim from the retired workshop tool except for participant sourcing.</Card>
          </section>

          {/* ─── Onboarding Resources ─── */}
          <section className="section" id="portal-onboarding-resources">
            <div className="section-header">
              <h2 className="section-title">Onboarding Resources</h2>
              <span className="section-path">/portal/onboarding-resources</span>
            </div>
            <div className="badges"><span className="badge badge-owner">Owner and Manager</span></div>
            <p style={{fontSize:'0.855rem',color:'var(--sub)',marginBottom:12,lineHeight:1.65}}>A tab under My Team, gated the same way as Dynamics (<code>assessment_tokens</code> license + <code>isTeamAccount</code> + owner/manager). Unlike the rest of My Team it has no dependency on the account's actual roster — it's static reference content, one Manager Integration Guide and one New Hire Brief per MindPrint™ profile, transcribed from Curio's source onboarding PDFs into <code>lib/onboardingResources.js</code>.</p>
            <Card title="Profile picker and view toggle">Six pill buttons (one per profile, colored by primary orientation) select which of the 12 guides to display; nothing renders until one is picked. A Manager View / New Hire View segmented toggle switches between the two guides for that profile. All content and state lives client-side in <code>components/OnboardingResources.js</code> — there's no server call beyond the initial auth/role check.</Card>
            <Card title="Manager View">Energizing Early On / Draining If Unmanaged (with a concrete example each), Day 1 Done Right / Week 1 Done Right, The 90-Day Check-Ins (day 30/60/90), Best-Fit Onboarding Partner, and Common Misreadings.</Card>
            <Card title="New Hire View">Second-person guide for the new hire themselves: What Will Energize You / What Might Drain You (with a "try saying" scripted phrase), Your First 90 Days (day 30/60/90), and Worth Knowing About Yourself.</Card>
            <Card title="Download PDF">Builds a branded PDF of whatever profile + view is currently on screen, client-side via <code>jsPDF</code> with the standard <code>helvetica</code> font (no Google Fonts dependency, so it can't hit the same font-embedding failure the results PDF once did). Section headers reserve room for their first block of following content before triggering a page break, so a header can never get stranded alone at the bottom of a page with its content pushed to the next one — see <code>dayBlock</code>/<code>numberedNotes</code>/the <code>followHeight</code> param on <code>sectionHeader</code> in the component.</Card>
            <Card title="Phones">The page uses the full screen width on phones (the content column clears the menu button, the two-column cards stack, Day 30/60/90 labels sit above their text, and Download PDF spans the width). Dynamics, the page next to it under My Team, got the same full-width fix. Both used to be squeezed into a narrow strip because their main column was capped at the desktop width minus the sidebar.</Card>
          </section>

          {/* ─── Tools page ─── */}
          <section className="section" id="portal-tools-page">
            <div className="section-header">
              <h2 className="section-title">Tools page</h2>
              <span className="section-path">/portal/tools</span>
            </div>
            <div className="badges">
              <span className="badge badge-owner">Owner</span>
              <span className="badge badge-member">Member</span>
            </div>
            <p style={{fontSize:'0.855rem',color:'var(--sub)',marginBottom:12,lineHeight:1.65}}>The sidebar is limited to My Profile, Tools, My Team (with its Dynamics / Onboarding Resources / Send Assessment / Analytics sub-tabs), Resources, and Recent Articles. Every individual tool lives on the Tools page instead, as a thumbnail card with a screenshot of the tool, its name, a one-line description, and Open. The Curio Assistant button is unchanged.</p>
            <Card title="What each person sees">Their tools first, then everything else. Access uses <code>navLockReason</code> in <code>lib/portalNav.js</code>, the same rule the sidebar used when tools were sidebar items: licenses, a completed assessment for the AI &amp; Delegation Guide, and the premium-tier default Companion (a non-basic account gets the Companion matching its own tertiary without a license). The sidebar's Tools entry shows for everyone, since "More from Curio" is useful even with no tools yet.</Card>
            <Card title="Recently used">A row at the top with the person's last four opened tools, newest first. Remembered per person on that device (<code>lib/toolRecents.js</code>, <code>localStorage</code>, recorded by the sidebar whenever a tool page opens), so it's a convenience, not account data; it's simply absent on a new device or after clearing browser data.</Card>
            <Card title="Groups">Cards are grouped by what they're for (<code>TOOL_SECTIONS</code>): <strong>Work with your profile</strong> (AI &amp; Delegation Guide, the three Companions, Orientation Translator), <strong>Teams, sessions and meetings</strong> (Session Architect, Meeting Architect, Team Builder), and <strong>Roles and career</strong> (Role Analyzer, Career Guidance Tool, Job Description Analyzer). A group with no cards for that person is hidden. The Companion that matches the person's tertiary gets a yellow "Built for your tertiary" badge.</Card>
            <Card title="More from Curio">Tools the account doesn't have, as grayed-out cards with <strong>Request access</strong>, which uses the same request flow as the Curio Assistant (<code>lib/accessRequests.js</code>, via <code>/api/portal/request-access</code>, open to any logged-in user): it lands in Admin → Assistant (marked "requested from the Tools page"), emails Curio as the approver and the account owner(s) as an FYI, and the card shows "Requested" from then on, including after a reload. The AI &amp; Delegation Guide, which unlocks with a completed assessment rather than a license, shows "Go to My Profile" instead.</Card>
            <Card title="Card design">Shared component <code>components/ToolCard.js</code> (also used on My Profile): a screenshot thumbnail, then a mint description area (<code>#ECFDF5</code>, the style guide's "Gold Pale") with the name, a one-line description, and Open, inside a thin light-gray outline (<code>#E2E8F0</code>) that darkens slightly and lifts on hover. Sized to fit four across on a laptop screen.</Card>
            <Card title="Find a tool">A search box above the cards filters every section (including More from Curio) by tool name and description as you type. If nothing matches, a note offers to clear the search or, for accounts with the Curio Assistant, to ask Curio.</Card>
            <Card title="Jump links">A row of pill links under the search box (Recently used, each group, More from Curio) scrolls to that section. It only shows the sections that person actually has, and hides while searching or when there's only one section.</Card>
            <Card title="Not sure where to start?">For accounts with the Curio Assistant (same rule as the button: the <code>curio_assistant</code> license on a team account), a yellow <strong>Ask Curio</strong> button next to the search box opens the assistant panel. It works by sending the <code>OPEN_ASSISTANT_EVENT</code> browser event exported from <code>components/CurioAssistant.js</code>, which any page can use the same way. Accounts without the assistant don't see the prompt.</Card>
            <Card title="Where you are">While inside any tool, the sidebar keeps "Tools" highlighted (the tool's key is mapped to <code>tools</code>).</Card>
            <Card title="Tool page headers">Every tool page opens with the same colored banner (<code>components/ToolHeader.js</code>): a small "&larr; All tools" link back to the Tools page followed by the tool's group name, the tool's name in white (from its <code>NAV_ITEMS</code> label), one line on what it does (its <code>blurb</code> unless the page passes its own), and the brain-print mark as a faint watermark on the right. The banner color comes from the tool's Tools page group (<code>TOOL_TONES</code>), using the style guide's dark backgrounds so each group reads as a family while the layout ties them together: <strong>Work with your profile</strong> is navy (<code>#0F172A</code>, mint accents), <strong>Teams, sessions and meetings</strong> is deep emerald (<code>#065F46</code>), and <strong>Roles and career</strong> is deep blue (<code>#1E3A5F</code>, light-blue accents). The same colors mark each group's heading on the Tools page. Controls sit on the banner's right, styled for the dark background with the shared <code>bannerControl</code> styles: Role Analyzer's "View past analyses", the AI &amp; Delegation Guide's "Viewing profile" switcher, the Orientation Translator's Translate / Detect toggle (the line under the name changes with the mode), and the admin-only profile override on the Companions. Notes sit on the page just under the banner: the Companions' "Replace / Supports Tertiary" band, the Translator's mode note, the AI &amp; Delegation Guide's profile code and tagline, and the Career Guidance Tool's "the more detail you provide" note. On phones the banner clears the menu button (the <code>tool-page-col</code> / <code>tool-main</code> classes), and Session Architect and the Career Guidance Tool use the full phone width.</Card>
            <Card title="My Profile">The profile page has no tool cards. The old Role Analyzer, "Your AI Companions", and Orientation Translator cards are gone, and there's no tools row; instead a <strong>Your tools →</strong> button at the bottom of the profile header links to the Tools page. Team owners without their own assessment reach the Tools page from the sidebar.</Card>
            <Card title="Thumbnails and descriptions">Each tool's <code>blurb</code>, <code>section</code>, and placement are set on its entry in <code>NAV_ITEMS</code>. Thumbnails are 800×500 screenshots of each tool at <code>public/images/tools/&lt;key&gt;.webp</code>, captured from the real tool pages (content area only, assistant button hidden) with a test account; they were recaptured after the colored banners went in. Recapture them when a tool's look changes noticeably. A new tool needs an <code>inTools</code> entry with a <code>section</code>, a <code>blurb</code>, and a thumbnail.</Card>
          </section>

          {/* ─── Session Architect ─── */}
          <section className="section" id="portal-session-architect">
            <div className="section-header">
              <h2 className="section-title">Session Architect</h2>
              <span className="section-path">/portal/tools/session-architect</span>
            </div>
            <div className="badges">
              <span className="badge badge-owner">Owner</span>
              <span className="badge badge-member">Member</span>
            </div>
            <p style={{fontSize:'0.855rem',color:'var(--sub)',marginBottom:12,lineHeight:1.65}}>Builds MindPrint&trade;-informed team session plans — workshops, brainstorms, retros, and planning sessions structured around participants' WHY/WHAT/HOW profiles rather than a generic agenda template. Gated on the <code>session_architect</code> license, granted individually by admin per account (not bundled with any tier), so it can be limited to specific pilot accounts. Opened from a card on the Tools page (see Tools page), not a sidebar item.</p>
            <Card title="Roster auto-fill">On load, fetches the caller's own team from <code>/api/portal/team</code> (owner sees the whole account, manager sees only their own team) and pre-fills the roster with every member who has a completed MindPrint™ assessment, labeled by profile. The roster is a free-text field afterward — edits made by hand aren't overwritten unless the page reloads.</Card>
            <Card title="Orientation content provenance">The six <code>ORIENTATIONS</code> entries' <code>energizedBy</code>/<code>bestUsedFor</code> copy is this tool's own facilitation-specific framing (how to use each profile in a workshop) and has no canonical equivalent elsewhere. <code>watchFor</code> is the exception: it's sourced live from each profile's <code>areasToWatch[0]</code> in <code>lib/profiles.js</code> rather than hand-authored a third time, since that's a factual caution about the profile, not a facilitation synthesis — exactly the class of claim that drifted out of sync with <code>lib/mindprint-source-of-truth.md</code> once already (a "bring them in after the vision is set" line that had accidentally inverted to "not after the vision is set" in both files).</Card>
            <Card title="Session builder">Pick a session type (Brainstorm/Ideation, Decision-Making, Planning/Kickoff, or Retrospective) and a duration (60 min, 90 min, Half day, or Full day); Session Architect assembles a block-by-block agenda with per-block activities and facilitation techniques drawn from a fixed template set, weighted toward the orientations present in the roster.</Card>
            <Card title="Full day — breaks, not just longer blocks">The one duration tier that carves real breaks out of the total span rather than proportionally stretching every content block to fill it: a 420-minute (~7 hour) day reserves 90 minutes for a 15-minute morning break, a 60-minute lunch, and a 15-minute afternoon break, leaving 330 minutes of actual content distributed across the session type's template exactly as the shorter durations already were. Breaks are inserted once cumulative content time crosses 25%/50%/75% of that 330, so they land after whichever block happens to finish nearest that mark — not hardcoded to a specific block index, so it works the same way regardless of how many blocks a given session type has. A break renders as its own simple agenda row/slide/page everywhere blocks normally do (on-screen, both bundled PDFs, the deck), but never gets a full activity sheet, breakout groups, or its own numbered "BLOCK N" slide — those numbers only count real content blocks, so they never skip a number around a break.</Card>
            <Card title="Download PDF">Client-side PDF export (via <code>jsPDF</code>) of the generated agenda and activity sheets — including suggested breakout groups and their rationale, same as the on-screen view — ready to print or share with a facilitator.</Card>
            <Card title="Generate Session Materials">Builds every file needed to run the session and bundles them into one <code>.zip</code> download (via <code>pptxgenjs</code>, a second <code>jsPDF</code> pass, and <code>jszip</code>, all client-side):
              <ul>
                <li><strong>Deck (.pptx)</strong> — a cover slide, an agenda overview, then a section-divider slide and a full activity-instruction slide (time/energy/materials, numbered steps, facilitator tips, and the "you'll know it worked when" signal) for every block, closing with a wrap-up slide. Styled off the same brand palette and fonts as the rest of the portal. Each divider slide bleeds the same brain-fingerprint mark used as the dashboard's profile-page watermark (<code>public/images/brain-fingerprint-watermark.webp</code>) off the top-right corner, pre-tinted to that block's energy color and baked down to ~12% opacity (three static PNGs generated once via PIL — pptxgenjs's <code>addImage</code> has no runtime recolor/transparency option). Positioned at roughly the same ~35% bleed / 65% visible ratio as the dashboard hero's own watermark, so more of the mark actually shows on-page rather than mostly disappearing off the corner. Suggested openers, "no one in this orientation is in the room" flags, and a one-line breakout-groups summary carry over from the on-screen agenda.</li>
                <li><strong>Facilitator guide (.pdf)</strong> — the branded, upgraded version of the Download PDF content, plus three reference sections not in the quick PDF: cover, agenda overview, one page per activity (steps, suggested breakout groups, facilitator tips, signal callout), then Room Watch-Fors (only the orientations present in this session's roster), the full six-combination Orientation Reference, and Facilitation Techniques — the same three reference blocks shown on-screen below the agenda.</li>
                <li><strong>Participant handout (.pdf)</strong> — the same cover/agenda/per-activity structure including suggested breakout groups, but steps only: no facilitator tips or signal callout, since those are facilitation notes, not something to hand to the room.</li>
                <li><strong>Activity cards (.pdf)</strong> — one large-type, glanceable card per activity (name, time, energy, one-line purpose, materials, suggested breakout groups), landscape-oriented for printing and posting in the room during that block rather than read start to finish. No numbered steps by design — that's what the guide/handout are for. If a roster is large enough to overflow the card, the group list is capped with a "+N more — see the facilitator guide" note rather than risking overlap with the footer.</li>
              </ul>
            </Card>
            <Card title="Suggested breakout groups">Shown per activity (in the on-screen Activity Sheets, and carried into all four generated materials above) once a session has at least 4 named people in the roster. Splits the room into groups of about 4, dealt round-robin across the WHY/WHAT/HOW energy buckets so no group ends up stacked with a single energy type, with a mild bias toward seeding each group with someone from that block's own preferred opener orientation(s) first. Computed once per block in <code>recommendBreakoutGroups()</code> and attached to the generated result — not recomputed separately by each output format. A one-line rationale (<code>breakoutRationale()</code>) is shown directly above the group list everywhere it appears — on-screen, both bundled PDFs, the deck divider slide, and now the standalone Download PDF too (which previously didn't show breakout groups at all) — explaining the energy-mix logic in plain language rather than leaving it unexplained.</Card>
            <div className="info-block"><strong>Pilot access:</strong> the <code>session_architect</code> license supports an expiry date like any other license (admin Accounts → Edit Account → Tier &amp; Licenses). Once it passes, access reverts to locked automatically — the same expiry-as-gate mechanism used everywhere else in the portal, not a separate reminder-only timer.</div>
          </section>

          {/* ─── Meeting Architect ─── */}
          <section className="section" id="portal-meeting-architect">
            <div className="section-header">
              <h2 className="section-title">Meeting Architect</h2>
              <span className="section-path">/portal/tools/meeting-architect</span>
            </div>
            <div className="badges">
              <span className="badge badge-owner">Owner</span>
              <span className="badge badge-member">Member</span>
            </div>
            <p style={{fontSize:'0.855rem',color:'var(--sub)',marginBottom:12,lineHeight:1.65}}>An AI-generated, timed redesign of a recurring meeting, built around the manager's stated objectives and challenges, the people involved (where relevant), and their own MindPrint&trade; profile, with a "where to lean in, where to get help" map alongside the agenda.</p>
            <Card title="Meeting types and input modes">Seven types, each with a fixed input mode. <strong>Roster</strong> (Weekly Status Meeting, Team Meeting, Leadership / Stakeholder Update): the same six-orientation roster rows as Session Architect (shared component, auto-filled from the caller's team via <code>/api/portal/team</code>, never overwriting names already typed). <strong>Single Relationship</strong> (1:1, Performance / Career Conversation): one report's name and orientation. <strong>No Roster</strong> (All-Hands / Town Hall, Client / Stakeholder Check-in): no attendee input, just an optional "anything you know about the audience" note.</Card>
            <Card title="Form">Meeting type; total time (30, 60, or 90 minutes, plus 15 for Weekly Status Meeting only, set in <code>lib/meetingArchitect.js</code>); purpose, pre-filled with the type's default and freely editable (a Default/Edited chip shows which, with a reset link; switching type swaps in the new default only if the purpose wasn't edited); objectives and current challenges (both required); then the group input for that type's mode. There is no manual "pick your orientation" selector: the user's own profile is read from their completed assessment (<code>loadCompanionProps</code>). Users without one can still use the tool; they see a note, and their plan simply omits the lean-in / get-help map.</Card>
            <Card title="Templates (one file)">Everything about each meeting type (default purpose, async/live split, live-structure blocks with energy and <code>pct</code> weight, role notes, lean-in structural parts, working/failing signs, default tool mapping) lives in <code>/meeting_architect_templates.md</code>. It's parsed at request time by <code>lib/meetingTemplates.js</code> (for the form's type list and the timing) and also injected verbatim into the prompt, so editing that file changes the tool with no code change. The parser throws a clear error naming the meeting type if a section is malformed or its weights don't sum to 1.0.</Card>
            <Card title="Timed agenda (computed, not generated)"><code>computeAgenda()</code> in <code>lib/meetingArchitect.js</code>: same rule as Session Architect (pct &times; total minutes, rounded to the nearest 5, minimum 5), plus one correction: if the rounded blocks don't add up to the chosen total (e.g. a 30-minute Team Meeting would sum to 35), the difference goes to the longest block. The model writes each block's title, what it covers, and why it matters given the user's objectives/challenges; it never sets durations.</Card>
            <Card title="Lean-in / get-help map">Only shown when the user has a profile on file. For each of the meeting type's structural parts, the server (not the model) decides the fit: a part in the manager's primary or secondary is "Yours to run"; a part in their tertiary is "Get help here". Get-help parts carry a tool from the Tertiary Support Library (<code>lib/guideContent.js</code>, all 43 tools listed in the prompt; any name the model returns that isn't an exact library title is stripped) and a person: in Roster / Single Relationship mode, only someone listed who is primary in that part's energy can be named (any other name is stripped); in No Roster mode, only a kind of person, never a name.</Card>
            <Card title="Generation (API)"><code>POST /api/meeting-architect/generate</code>, license-checked server-side (401 logged out, 403 unlicensed). Synchronous JSON, not streamed: 400 for missing/invalid fields, 502 for an Anthropic error or incomplete model output, 500 if the reference files can't load. Raw <code>fetch</code> to the Anthropic API (<code>claude-sonnet-4-6</code>, max 4,000 output tokens, 60s function limit), with the full MindPrint&trade; Source of Truth, the templates file, and the tool library as a cached system block. User-entered text is fenced and marked as data. Em dashes are replaced in all returned copy. The API key never reaches the browser.</Card>
            <Card title="Output">In order: purpose (labeled default or edited), async / live split, the timed live structure (same agenda-block look as Session Architect), role assignments (Roster and Single Relationship only, omitted entirely in No Roster), the lean-in / get-help map, signs this is working vs. failing (rewritten against the stated challenges), and one Download PDF button (jsPDF, same conventions as Session Architect, saved as <code>curio-meeting-&lt;type-slug&gt;.pdf</code>).</Card>
            <Card title="Access">Gated on the <code>meeting_architect</code> license, the same per-account license mechanism as Session Architect (listed in <code>lib/licenseTypes.js</code>). Grant it either by adding it to an account directly (admin Accounts → Edit Account → Tier &amp; Licenses) or by ticking it on a token in Generate Tokens, which applies it when the recipient completes their assessment. Because licenses are account-wide, a token redeemed onto an existing team account gives Meeting Architect to everyone on that account, not just the recipient. Without the license, the sidebar item is hidden entirely (not shown locked), and direct navigation to the URL redirects to the dashboard server-side. Admin sessions bypass the check, same as every other licensed tool.</Card>
            <Card title="Where it lives">A card on the Tools page, in "Teams, sessions and meetings" next to Session Architect and Team Builder.</Card>
            <Card title="Report history">Successful generations are saved to the <code>meeting_architect_reports</code> table (<code>supabase/migrations/0011_meeting_architect_reports.sql</code>, run by hand like the other migrations). Unlike <code>career_guidance_reports</code>, each row records who generated it (<code>account_id</code>, <code>user_id</code>, <code>user_email</code>), plus the user's own profile at generation time, or null if they hadn't completed an assessment. Failed or malformed generations are never saved; a failed database write is logged and doesn't block the user's result.</Card>
          </section>

          {/* ─── Team Builder ─── */}
          <section className="section" id="portal-team-builder">
            <div className="section-header">
              <h2 className="section-title">Team Builder</h2>
              <span className="section-path">/portal/tools/team-builder</span>
            </div>
            <div className="badges">
              <span className="badge badge-owner">Owner</span>
              <span className="badge badge-member">Member</span>
            </div>
            <p style={{fontSize:'0.855rem',color:'var(--sub)',marginBottom:12,lineHeight:1.65}}>Reads a statement of work, work plan or project plan and recommends the team around it: headcount, who owns, contributes to and reviews each activity, how much of each person's time is draining, coverage gaps, a friction forecast, and an individual plan for every person, with two PDF exports. Positioned as insight for a human staffing decision among people already chosen, never as selection (the guardrail line sits at the foot of the result and of every PDF page). The approved prototype is kept at <code>docs/prototypes/team-builder-prototype.html</code> (not served) and the build spec at <code>docs/specs/team-builder-build-spec.md</code>.</p>
            <Card title="The four steps">A pill stepper; any step can be revisited and the result recalculates from the current state. <strong>1. The work:</strong> paste text, or upload a PDF, Word (.docx) or text file up to 3 MB (Vercel's 4.5 MB request limit, less base64 overhead; checked in the browser and again on the server). "Use a sample statement of work" loads the fictional Harbor &amp; Pine SOW (and, once read, the sample roster); "Enter the activities by hand" skips the AI read. "Read the document" shows rotating messages every 8 seconds. <strong>2. Review activities:</strong> the prototype's three explainer cards (Share of effort, Matching, Delivery), any notes and warnings from the read, the phases table (rename, re-time, add after the last week, remove only when no activities use it; the special Ongoing phase can be renamed but never removed), duration and total hours, and the activities table: name, Matched to (the 63 taxonomy entries or "Not on the list"; changing it resets the demand tag), Demand (a "Shifted" chip appears when the tag differs from the matched entry's tag; hover or tap shows the AI's reason, or "Changed here" for a hand edit), phase, share, hours (share ÷ total shares × total hours), delivery, source chips (Stated / Inferred / Added, plus Unlisted). Shares that don't add to 100 are scaled, with a note saying so. <strong>3. Roster (optional):</strong> "Use this roster for the recommendation" (off = Design mode, which recommends ideal seats), rows of name, profile, availability (100 / 75 / 50 / 25%), hours available, and optional skills and seniority (collapsed; context for the written plans only, never used by the engine). Owners and managers of team accounts get "Add from my team", which adds everyone from <code>/api/portal/team</code> with a completed profile. Rosters are entered fresh each run and never saved. <strong>4. Result:</strong> see below.</Card>
            <Card title="The engine (deterministic, no AI)"><code>lib/team-builder/engine.js</code>, ported from the prototype and checked against it activity by activity. Each taxonomy tag converts to a 60 / 30 / 10 demand split scored with the Source of Truth Section 6 formula. Activities are assigned in descending hours: owner = best score minus a load penalty (35 × load ÷ capacity); contributors by delivery (Pair 1, Small team 2, both scoring 40+; Whole team everyone); a reviewer is added when the activity calls on the owner's tertiary or is a client deliverable, and comes from someone whose primary is that orientation. Hour splits: 100 / 65-35 / 50-25-25 / 30 + 70 shared, × 0.9 with a 10% reviewer. Capacity = availability × weeks × 40. Headcount from hours and weeks (or activities ÷ 4 when there are no hours). The engagement lead owns the most direction-setting hours; each dated phase has the person owning most of it. Gaps: an orientation with 20%+ of demand and no primary on the team, an activity with no natural owner, over capacity, and (roster mode) someone with no work. The drain budget flag shows when draining work is over 20% of a person's hours. Friction: the eight Section 5 patterns (the prototype's seven plus "Pace versus depth", WHY and HOW primaries, which only fills a slot the others leave open because the Source of Truth calls that pairing low friction); for each, the pair sharing the most activities, top four. Unit tests in <code>lib/team-builder/*.test.js</code>, run with <code>npm test</code>.</Card>
            <Card title="Result sections">Summary (AI paragraph, or a templated one), headcount range and team structure; the shape of the work (pie by profile, with seats in the ideal team); the energy demand map (all work, each phase, Ongoing on its own row); who carries what (definitions, then one card per person or seat with hours, energy bar, Owns / Contributes to / Reviews / Draining work, the drain budget flag, and "Open individual plan"); the owner and contributor matrix grouped by phase, badges colored by what the role costs that person; gaps to close (plain language, never scores; with a roster, the ideal shape for comparison); the friction forecast; actions (Change the roster, Download team brief, Download individual plans); the guardrail. The individual plan view has the header line, the AI plan intro, the work phase by phase with the expectation for each assignment, who to go to for what, and what to watch for. Role titles never use "lead" (Strategy and engagement, Research and systems, Client and momentum, Delivery and execution, Analysis and quality, Operations and process); "engagement lead" is the only use of the word for a person. Every tool chip links to the tool's page in the Tertiary Support Library (all 14 tools used have pages).</Card>
            <Card title="AI call 1: reading the document"><code>POST /api/team-builder/extract</code>. System prompt = PART A of <code>/team_builder_system_prompt.md</code> + <code>lib/mindprint-activity-taxonomy.md</code> + <code>lib/mindprint-source-of-truth.md</code>, all read at request time and sent as one cached block. PDFs go to the API as a document block; Word text is pulled from the .docx with jszip; text files are read as UTF-8. One retry on unreadable JSON. Server-side validation (<code>lib/team-builder/validate.js</code>) before anything reaches the browser: taxonomy IDs 0 to 63; a tag shift that breaks the taxonomy's rule (the residual orientation can never become the lead) is reset with a warning; exactly one Ongoing phase; unknown phases go to Ongoing; weeks clamped; delivery defaults to Solo; the reviewer note is cleaned of dashes and field names and ends on a full sentence.</Card>
            <Card title="AI call 2: the written explanation"><code>POST /api/team-builder/narrative</code>, PART B of the same prompt file with the same two governing documents. Only called on the Result step, 1.5 seconds after the last change, and the result shows immediately with templated wording that the AI text replaces as it arrives. Every person is a label (P1, P2… in roster order, or Seat A…); names never leave the browser, which swaps them back in on screen (<code>lib/team-builder/payload.js</code>, unit tested). To stay inside Vercel Hobby's 60-second limit the explanation is split into parallel calls: one for the summary and friction steps, and one per group of people (about 8 assignments per call). Each call gives up at 54 seconds. Every string is checked by <code>lib/team-builder/language.js</code> (no em or spaced en dashes; no strength, weakness, personality, dominant, brain, cognitive style, blind spot; no "lead" for activity ownership); on a failure there is one retry naming the problems if time allows, and anything still failing is dropped so the templated wording shows. Friction tool choices outside a pattern's allowed list are dropped. If the AI is unavailable the full result still shows, with a short note.</Card>
            <Card title="PDF exports">Built in the browser with jsPDF (<code>lib/team-builder/pdf.js</code>), from what's on screen, names included, with no AI call. Letter size, Caveat and DM Sans embedded from <code>/public/fonts</code> (SIL Open Font License, files alongside), the guardrail and page numbers in every page footer. <strong>Team brief:</strong> every result section in order, the pie and demand map drawn as vector shapes, the matrix with repeated headers across pages (O / C / R codes when there are many people), tool references printed as name and number with links. <strong>Individual plans:</strong> one section per person, each starting on a new page; the plan view also has "Download this plan (PDF)" for one person.</Card>
            <Card title="Saved data">Migration <code>supabase/migrations/0014_team_builder.sql</code> (run by hand). <code>team_builder_runs</code>: one row per completed result (on the first written explanation, or 10 seconds after the result appears), with account and user, mode, weeks, hours, activity count, profiles, and the engine result with people as labels. <code>team_builder_unlisted_activities</code>: each "Not on the list" activity with its tag and evidence quote, so the taxonomy can grow. <code>team_builder_calls</code>: one row per AI call, no content, for the daily caps. Names, skills, seniority and document text are never saved; <code>/api/team-builder/runs</code> rejects anything name-shaped in a person field.</Card>
            <Card title="Limits">Per user per UTC day: 20 document reads and 200 explanation calls (about 50 results), counted from <code>team_builder_calls</code>; over the cap returns a clear 429 message, and the result still works without the explanation. Admin sessions are exempt.</Card>
            <Card title="Access">Its own <code>team_builder</code> license (in <code>lib/licenseTypes.js</code>), not limited to team accounts; grant it in admin Accounts → Edit Account → Tier &amp; Licenses or on a token. Without it the card shows under "More from Curio" on the Tools page and the URL redirects to the dashboard; the APIs return 401 logged out and 403 unlicensed. Admin sessions bypass the check. The Curio Assistant knows the tool (<code>lib/assistantCatalog.js</code>).</Card>
            <Card title="Admin: Team Builder">Admin dashboard (<code>/admin</code>, "Tools" nav section, <code>/api/admin/team-builder</code>): a Runs tab (newest first: date, account, user, mode, weeks, hours, activities, profiles, headcount) and an Unlisted activities tab (grouped by name with counts, the tags people set, and sample evidence), for reviewing whether the taxonomy needs new entries.</Card>
            <Card title="Governing documents">All AI output follows <code>lib/mindprint-source-of-truth.md</code> (version 2.2 added Section 10, Activity Taxonomy and team role language, and registered Team Builder in Section 7). The 63 activities, their tags and the shift rule live in <code>lib/mindprint-activity-taxonomy.md</code>; the page's "Matched to" list is parsed from that file on every request, so editing it needs no code change. The three files are read in <code>lib/team-builder/loadDocs.js</code> with each path written out in full, which is what lets Vercel's file tracing bundle them with the page and the API routes; a path built from a variable isn't traced, the file is missing in production, and the page fails with a 500.</Card>
          </section>

          {/* ─── Curio Assistant ─── */}
          <section className="section" id="portal-assistant">
            <div className="section-header">
              <h2 className="section-title">Curio Assistant</h2>
              <span className="section-path">pop-up on every portal page</span>
            </div>
            <div className="badges">
              <span className="badge badge-owner">Owner</span>
              <span className="badge badge-member">Member</span>
            </div>
            <p style={{fontSize:'0.855rem',color:'var(--sub)',marginBottom:12,lineHeight:1.65}}>An "Ask Curio" button at the bottom right of every portal page. It opens a panel ("How can Curio help you today?") where a user types what they're working on or a question about MindPrint&trade;, and gets a short answer plus up to three recommended tools or resources they can open directly, or request access to. When an answer arrives, the panel scrolls so the question and the start of its answer sit at the top (not the bottom of the last card). Each card is labeled Tool, Resource, Field guide, or Article in a yellow pill. The Ask Curio button uses the same yellow (#FCD34D, the style guide's HOW yellow; the style guide's "gold" tokens are actually emerald) with dark ink text and a chat icon, and pulses gently three times the first time it appears in a browser session only (never for users with reduced-motion turned on). The first time a person sees the button on a device, a small bubble ("Need help finding something?") appears above it after a moment; clicking it opens the assistant. It counts as seen, and never returns on that device for that person (<code>localStorage</code>), once they close it, open the assistant, or it has been on screen for 12 seconds.</p>
            <Card title="Who gets it">Needs the <code>curio_assistant</code> license <strong>and</strong> a team account (<code>lib/teamAccount.js</code>: more than one token, or the <code>team_account</code> license). Both are checked by the server on every request, not just by hiding the button. The button is rendered by <code>components/PortalSidebar.js</code> itself, so it appears on every page that has the sidebar with no per-page wiring.</Card>
            <Card title="What it can recommend">Everything in <code>lib/assistantCatalog.js</code>: every sidebar tool and page (with a plain-language description in <code>TOOL_DESCRIPTIONS</code>; keep these accurate when a tool changes, they drive matching), all 43 Resources library tools, the six Communication Field Guides, and every Insights article from Sanity (cached 10 minutes; opens in the portal via <code>/portal/insights?article=&lt;slug&gt;</code>).</Card>
            <Card title="Access decided by code, not the AI">For each item the server works out whether this user can open it, using the same rules the rest of the portal uses: sidebar items through the shared <code>lib/portalNav.js</code> (the sidebar itself uses it too), library tools and field guides through <code>lib/libraryAccess.js</code>. A locked item comes back with no link, only a reason: not licensed, needs a team account, owner/manager only, or needs a completed assessment (that last one links to My Profile instead of offering a request).</Card>
            <Card title="Grounded answers">Claude Haiku 4.5 (<code>claude-haiku-4-5</code>, raw <code>fetch</code>), with the full MindPrint&trade; Source of Truth as a cached system block and the user's catalog (with availability) and profile in a second block. It may only state what the Source of Truth or a catalog description supports, and says so when they don't cover a question. JSON structured output restricts recommendations to real catalog ids, and the server re-checks them anyway, drops duplicates, caps at three, and removes em dashes. Up to three earlier exchanges are sent for follow-up questions. The conversation is kept in the browser tab (<code>sessionStorage</code>, per user) so it survives moving between pages.</Card>
            <Card title="Limits and logging">30 questions per user per day (resets at midnight UTC). Every question, answer, and set of recommendations is logged to <code>assistant_logs</code>, which is also the daily counter.</Card>
            <Card title="Request access">"Request access" on a locked card calls <code>/api/portal/assistant/request-access</code>, which re-checks the item really is locked, skips duplicates (one pending request per person per item), saves it to <code>access_requests</code> with the license that would unlock it, and fires the <em>Curio Assistant access request</em> email trigger: <em>Access Request (to Curio)</em> goes to hello@choosecurio.com as the approver, and <em>Access Request (FYI to account owner)</em> goes to the account's owner(s), except when the owner is the one asking. Both templates are editable in Admin → Emails. Anything the user typed is HTML-escaped before it goes into an email.</Card>
            <Card title="Admin → Assistant">Two tabs. <strong>Access requests</strong>: newest first, with a Grant button that adds the unlocking license to the account and marks the request granted, or Dismiss. Owner/manager-only items and other-profile field guides can't be granted with one click ("Change in Accounts"), since they need a role change or a broader library grant. <strong>Recent searches</strong>: the latest 200 questions with who asked and what was recommended.</Card>
            <Card title="Setup">Run <code>supabase/migrations/0012_curio_assistant.sql</code> once (creates <code>assistant_logs</code> and <code>access_requests</code>). Until then the assistant returns an error.</Card>
          </section>

          <section className="section" id="portal-tokens">
            <div className="section-header">
              <h2 className="section-title">Send Assessment</h2>
              <span className="section-path">/portal/tokens</span>
            </div>
            <div className="badges"><span className="badge badge-owner">Owner and Manager</span></div>
            <p style={{fontSize:'0.855rem',color:'var(--sub)',marginBottom:12,lineHeight:1.65}}>Renamed from "Assessment Tokens" — the page itself now says <em>link</em> throughout rather than mixing "token" and "link" for the same thing, since the account's underlying <code>tokens</code> table (an admin/inventory concept — see Admin Panel → Tokens) isn't something an owner or manager needs to think in terms of. What they're actually doing is sending someone a link to take the assessment.</p>
            <Card title="Link Stats">Available / Sent / Completed counts, mutually exclusive by construction: a link is Available until it's sent, then Sent until the recipient finishes, then it moves to Completed and drops out of Sent. The page states this explicitly under the stat row, since the table below (see Recipients) shows Sent and Completed rows together and could otherwise read as if a completed link were still "sent."</Card>
            <Card title="Send Assessment Links">
              Two modes for distributing links from the pool:
              <ul>
                <li><strong>Single Recipient</strong> — name (optional) and email. Assigns one link and sends a personalized email.</li>
                <li><strong>Batch</strong> — paste recipients as <code>Name, email</code> or just email, one per line. Warns if count exceeds available links.</li>
              </ul>
              A customizable email message supports <code>[Name]</code> and <code>[URL]</code> placeholders with a live preview toggle. You receive a BCC of every sent email.
            </Card>
            <Card title="Recipients Table">Everyone a link has ever been sent to — name, email, a Status badge (Sent or Completed), sent date, completion date, and a copy-link button. Renamed from "Sent Tokens," which implied only outstanding (not-yet-completed) recipients would appear — completed ones were always included too.</Card>
          </section>

          <section className="section" id="portal-analytics">
            <div className="section-header">
              <h2 className="section-title">Analytics</h2>
              <span className="section-path">/portal/analytics</span>
            </div>
            <div className="badges"><span className="badge badge-owner">Owner and Manager</span></div>
            <p style={{fontSize:'0.855rem',color:'var(--sub)',marginBottom:12,lineHeight:1.65}}>Combines what used to be two separate My Team tabs, Assessment Results and Analytics, into one — the raw results table, the charts, and the list generator all live here now. Owner/manager only: a member has no assessment-results view at all (the standalone Assessment Results tab it once had was removed as unneeded — a member never saw teammates' scores anywhere else, and the tab's own H/W/Y numbers weren't shown anywhere else in the product either). A manager's view is scoped to their own team throughout; an owner sees the whole account.</p>
            <Card title="Two pie charts">One breaks down every completed assessment by full profile (six slices); the other by primary orientation (WHY/WHAT/HOW, three slices).</Card>
            <Card title="Generate a List">Filter by Profile, Primary Orientation, or Tertiary Orientation, pick a value, and a table appears with name, email, and profile for everyone matching. <strong>Email Group (n) →</strong> opens the caller's own email client via a <code>mailto:</code> link with every matching email address pre-filled on <code>bcc</code>, so recipients don't see each other's addresses.</Card>
            <Card title="Results table">Name, email, profile badge, H/W/Y scores, and submission date, with its own name/email/profile text filter (separate from Generate a List's dropdown filters above it).</Card>
            <Card title="API: /api/portal/analytics">Owner/manager only (403 for members). Returns every completed assessment on the account (owner) or the caller's own team (manager).</Card>
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
            <p style={{fontSize:'0.855rem',color:'var(--sub)',marginBottom:12,lineHeight:1.65}}>All tools are gated by license. If an account doesn't have the relevant license, the tool's card doesn't appear on the Tools page.</p>
            <Card title="Role Analyzer · /portal/tools/fit · license: role_analyzer">Enter any role title. Generates a real-time streaming report with an alignment score, energizers, drains, and collaboration recommendations — all calibrated to the user's MindPrint™ profile. If the logged-in user has a completed assessment on file, their name and MindPrint™ profile are shown pre-filled and read-only (no step numbering — just the info, then the role field). If they have no assessment on file, the name field and profile grid render editable instead, so the tool still works for analyzing on someone else's behalf.</Card>
            <Card title="Career Guidance Tool · /portal/tools/career · license: career_guidance">Generates a structured career report with best-fit roles, energizers, challenges, and strategies. Optional inputs: current role, years of experience, additional results, strengths, and areas for growth. Includes a PDF export.</Card>
            <Card title="Job Description Analyzer · /portal/tools/jd · license: jd_analyzer">Paste a job description. Returns an analysis of fit vs. the user's profile — what will energize them, what will drain them, and how to position themselves for that role.</Card>
            <Card title="Analyzer History · /portal/analyzer-history · license: role_analyzer">A log of all Role Analyzer runs for the account — role title, profile, alignment score, and date. Saved automatically after each analysis. Not a separate sidebar tab; reached via the "View past analyses →" link on the Role Analyzer page itself.</Card>
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
            <Card title="Default access (premium tier, no license grant required)">Premium accounts get their own tertiary-matching Companion free, the same baseline pattern as Resources' free tertiary collection: a HOW-tertiary user on a premium account sees Precision Companion without needing an explicit <code>precision_companion</code> license row, same for Purpose/WHY and Progress/WHAT. Basic-tier accounts and non-matching Companions still require an explicit license. Computed in <code>pages/api/portal/dashboard.js</code> (what shows on the card) and independently re-checked in <code>pages/api/portal/companion.js</code> (what the API actually allows), so the two can't drift apart.</Card>
            <div className="info-block"><strong>Where they appear:</strong> Companions the user has access to (by license or the premium default above) appear on the Tools page, with the one matching the user's own tertiary badged. Companion pages honor the premium default too (<code>loadCompanionProps</code>), not just the Companion API. Companions they don't have appear under the Tools page's "More from Curio".</div>
          </section>

          {/* ─── MindPrint Language Tools (Translator + Detector) ─── */}
          <section className="section" id="portal-translator">
            <div className="section-header">
              <h2 className="section-title">MindPrint&trade; Language Tools</h2>
              <span className="section-path">/portal/tools/orientation-translator</span>
            </div>
            <div className="badges">
              <span className="badge badge-owner">Owner</span>
              <span className="badge badge-member">Member</span>
            </div>
            <p style={{fontSize:'0.855rem',color:'var(--sub)',marginBottom:12,lineHeight:1.65}}>One page, a Translate/Detect toggle in the header, both modes universal (not personalized to the caller's own profile) and both gated on the single <code>orientation_translator</code> license. Switching modes clears state without a page reload. Both share the same <code>/api/portal/companion</code> route, license/auth/50-call daily cap pattern as the Companions, and both skip the "complete your assessment" requirement since neither needs the caller's own profile to run (<code>tool: "translator"</code> and <code>tool: "detector"</code>).</p>
            <Card title="Propagation architecture: lib/language-framework.js">Single source of truth for the register definitions (WHY/WHAT/HOW-speak), the absence principle, the profile signature table and reading rule, the translation methodology, and the detection guardrails (hypothesis-language-only rule, the four confounds, the hiring/screening refusal), all sourced verbatim from <code>MindPrint_Language_Framework.md</code>. The locked language rules are pulled from the MindPrint AI Source of Truth (<code>lib/mindprint-source-of-truth.js</code>) rather than restated independently. Composed by <code>lib/companion-prompts.js</code> into the Translator's system prompt, the Detector's system prompt, and the Purpose Companion's So-What mode, the only three call sites, and by nothing else, no tool carries its own copy.</Card>
            <Card title="Translate · license: orientation_translator">Translates a pasted message into WHY-speak, WHAT-speak, HOW-speak, all three at once, or the primary register of a named person's profile. Every translation ends with a "What changed and why" note naming the moves made, and any added fact not present in the source (a date, an owner, a caveat) is marked <code>(proposed)</code> for the user to confirm before sending. Source register reads are phrased as hypotheses ("reads WHAT-forward"), never as a diagnosis of the author. If the account has a completed assessment, its own profile appears last in the "translate to a person's profile" list rather than defaulted, since people mostly translate to others.</Card>
            <Card title="Detect (beta) · license: orientation_translator">Reads one or more writing samples from a single writer (the user's own, or a colleague's in a coaching context) plus optional genre/role/audience context, and returns a five-section hypothesis: the read, per-orientation signals with quoted evidence, the conspicuous absence, a leading profile hypothesis plus an alternative candidate, and a confidence/confounds note. Always phrased as hypothesis, never diagnosis. Refuses, with an explanation, any request framed around hiring, screening, or an employment decision. Kept behind the "Beta &middot; Hypothesis Engine" chip and a "not for hiring" line under the button until the corpus below supports a measured accuracy claim.</Card>
            <Card title="Feedback loop: detection_feedback">After a hypothesis, a "Know the writer's actual profile?" block posts to <code>/api/portal/detection-feedback</code>, which computes the sample's sha256 server-side and enforces the storage rule: <code>sample_text</code> is written only when the samples were the submitter's own writing, third-party writing keeps only the hash, context, the model's full hypothesis output, and the label, never the text. If the samples are the caller's own and their account has a completed assessment, a one-tap "That's me, use my profile" button submits it directly as <code>actual_profile</code>. Table defined in <code>supabase/migrations/0003_detection_feedback.sql</code> (apply by hand, same convention as the other companion tables).</Card>
            <Card title="Admin: Detection Feedback">Admin dashboard (<code>/admin</code>, "Language Tools" nav section) lists every labeled and unlabeled run and computes the running agreement rate: leading hypothesis (parsed from the model's raw output) vs. labeled actual profile, where labeled. This number, not intuition, is what eventually graduates the Detector out of beta and decides what accuracy claim, if any, goes in marketing copy.</Card>
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
            <p style={{fontSize:'0.855rem',color:'var(--sub)',marginBottom:12,lineHeight:1.65}}>43 resources. Each guide is rendered as a web page at <code>/portal/library/[slug]</code>. Templates remain PDFs stored in the private <code>library</code> Supabase Storage bucket. Guide content is pre-rendered from <code>lib/guideContent.js</code> (generated from the PDFs in <code>curio_library/</code>); each guide page has a "Save as PDF" button using <code>window.print()</code> with a print stylesheet. Template PDFs are still served through short-lived signed URLs generated after a server-side check via <code>/api/portal/library-file</code>.</p>
            <Card title="Page copy">The tab, sidebar nav label, and eyebrow read "Resources"; the header reads "Your Curated Library of Support Resources". The body introduces the four support modes (Scaffold, Teach, Support, Replace) as a 2-column pill grid. Each card shows the resource's <code>summary</code> plus a single <strong>View Resource</strong> button linking to the resource's web page at <code>/portal/library/[slug]</code>. The template download lives on that page rather than on the card, so each template sits with the resource it belongs to and is one click away however someone arrives (the Resources page, the Curio Assistant, or the AI &amp; Delegation Guide's scaffold links). Tool numbers are not shown in the UI, only used internally to identify files.</Card>
            <Card title="Guide web pages">Each of the 43 guides lives at <code>/portal/library/[slug]</code> (e.g. <code>/portal/library/tool-01-vision-to-task-decomposition</code>). The page is auth-gated (checks <code>/api/portal/me</code>), renders all guide sections (The Drain, What This Tool Does, How To Use It, What It Won't Do, In The Kit, Pairs Well With), has a simple header row (one pill pairing the support approach with the orientation it supports, e.g. "Scaffold · Tertiary HOW", "Support · Universal", "Scaffold · Teams", with the approach taken from the first word of the guide's <code>supportLine</code>; and a muted "Tool N" reference on the right, kept only for reference), and has a <strong>Download Template</strong> button in the header just below the taglines, plus a matching "Download the template →" link under In the Kit. Both open the template PDF through <code>/api/portal/library-file</code> (signed URL, re-checks collection access); someone without that collection gets "This template isn't included in your account yet." instead. Neither appears when printing. Each "Pairs Well With" entry is a link to that resource's page, labeled with its own title (the stored entries read "Tool N ..."; the number is used to find the page). It also has a sticky top nav with "← Library" back link and "Save as PDF" button. Content is sourced from <code>lib/guideContent.js</code>, generated by running <code>node /tmp/build-guide-data4.mjs</code> then <code>node /tmp/gen-guide-content.mjs</code> from the PDF files in <code>curio_library/</code>. The route is defined in <code>pages/portal/library/[slug].js</code>; the index page moved from <code>pages/portal/library.js</code> to <code>pages/portal/library/index.js</code>.</Card>
            <Card title="Template formats">Each of the 43 templates uses whichever physical format actually fits how that tool gets used, not one generic shape. <code>library-pipeline/gen.py</code> supports: <code>worksheet</code> (ruled-line prompts), <code>checklist</code> (grouped checkboxes), <code>cards</code> (a printable deck), <code>table</code> (a log, tracker, or rating matrix, rows stretch to fill the page), <code>canvas</code> (a poster-style one-pager meant to be printed and posted, with sized zones and an optional signature strip), <code>board</code> (kanban-style columns), <code>contract</code> (clauses plus a signature block, for two-party agreements), <code>reference</code> (a read-only list, nothing to fill in), <code>script</code> (facilitation lines to read aloud, with optional capture space), <code>tree</code> (a branching decomposition cascade), <code>timeline</code> (a horizontal chain or relay strip of dated/staged nodes), <code>tent</code> (large standalone cards meant to stand up in a room), and <code>flow</code> (a branching decision diagram). A template can also be a <code>pages</code> list of several of these stacked into one multi-page PDF (e.g. Tool 33's Team Trade Board is a posted card, a signed contract, and a monthly review log, three pages in one file) when the tool genuinely produces more than one physical artifact; the site's one-file-per-tool download contract is unaffected, since multi-page kits still ship as a single PDF. A <code>combo</code> type stacks two or more of the above within a single page (e.g. a short reference block above a log table). Definitions live in <code>library-pipeline/arts1.py</code> (tools 1-22) and <code>arts2.py</code> (tools 23-43).</Card>
            <Card title="Collections">A amber, "Tertiary HOW Resources" · B blue, "Tertiary WHAT Resources" · C mint, "Tertiary WHY Resources" · D teal, "Universal Resources" · E emerald, "Teams Resources".</Card>
            <Card title="Default access (no license grant required)">Every account gets Collection D (Universal) plus its own tertiary collection (A/B/C, resolved from the caller's completed assessment), free. Owners of enterprise accounts (<code>client_accounts.tier !== 'basic'</code> and <code>client_users.role === 'owner'</code>) also default into Collection E (Team), whether or not they personally have a profile. The sidebar's "Resources" link and the My Profile "Your Resources" card always show, since this baseline is never empty (<code>pages/api/portal/library.js</code>).</Card>
            <Card title="Extending beyond the baseline">Admin-granted licenses (<code>library_full</code>, or a per-collection key <code>library_a</code>…<code>library_e</code>) add collections on top of the default baseline, e.g. granting a basic-tier individual access to a collection outside their own tertiary, granting Team access to a non-owner, or <code>library_full</code> for everything. Default filter selection: the user's own tertiary collection when visible, otherwise Collection D.</Card>
            <Card title="Regenerating content">PDFs are generated by the Python pipeline in <code>library-pipeline/</code> (see its own CLAUDE.md) into <code>curio_library/</code>. After any content change, re-run <code>npm run seed:library</code> (needs <code>SUPABASE_URL</code> / <code>SUPABASE_SERVICE_KEY</code>) to re-upload the PDFs and refresh <code>library_items</code>, including <code>summary</code>.</Card>
            <Card title="Communication Field Guides">A sixth, per-profile group below the four support-mode collections: one PDF per MindPrint™ profile (WHY-WHAT, WHY-HOW, WHAT-WHY, WHAT-HOW, HOW-WHY, HOW-WHAT), covering how that profile writes and speaks, how each orientation hears it, and the three adjustments that buy the most understanding. Stored under <code>field-guides/</code> in the same <code>library</code> bucket; rows live in <code>library_items</code> with <code>item_type='field_guide'</code> and a <code>profile</code> value instead of <code>tool_num</code>/<code>collection</code> (both nullable for this row shape). Accent color is by <strong>primary</strong> orientation, not tertiary collection: WHY mint, WHAT blue, HOW amber.
              <ul>
                <li><strong>Own guide</strong> — always visible with a completed assessment, matched on profile, no extra license required (same free-baseline logic as My Profile's card above).</li>
                <li><strong>All six</strong> — visible with <code>library_full</code> or team access (Collection E, whether via an explicit <code>library_e</code> license or the free enterprise-owner default).</li>
                <li><strong>Assessed, no full/team access</strong> — sees only their own guide in this group.</li>
                <li><strong>No completed assessment and no full/team access</strong> — the group doesn't render.</li>
              </ul>
              Field guides are rendered as web pages at <code>/portal/library/field-guide/[profile]</code> (e.g. <code>/portal/library/field-guide/why-what</code>), linked directly (no signed URL, no <code>library-file</code> fetch) from both the library index cards and the My Profile "View Field Guide →" button. Content is stored in <code>lib/fieldGuideContent.js</code> (auto-generated from the source PDFs via <code>/tmp/parse-field-guides.mjs</code>). Each guide page has a <strong>Save as PDF</strong> button using <code>window.print()</code>. The old <code>item_type === 'field_guide'</code> branch in <code>library-file.js</code> was removed as dead code once nothing fetched a field guide through it any more; <code>pages/api/portal/library.js</code> still has its own field-guide-listing branch, unrelated, used to decide which profiles' cards to show at all.
            </Card>
          </section>

          <section className="section" id="portal-insights">
            <div className="section-header">
              <h2 className="section-title">Recent Articles</h2>
              <span className="section-path">/portal/insights</span>
            </div>
            <div className="badges">
              <span className="badge badge-owner">Owner</span>
              <span className="badge badge-member">Member</span>
            </div>
            <Card title="Just the public /insights page, framed">No separate content system — the portal page is a thin wrapper (sidebar + an <code>&lt;iframe src="/insights?embed=1"&gt;</code> filling the rest of the viewport) around the existing public Sanity-driven Insights page. Always visible, same as Resources, since the articles themselves are public content with nothing to gate.</Card>
            <Card title="embed=1"><code>pages/insights/index.js</code> and <code>pages/insights/[slug].js</code> both read <code>?embed=1</code> off the URL and skip rendering the public site's own <code>&lt;Nav /&gt;</code> and <code>&lt;Footer /&gt;</code> when it's set, so the iframe shows just the article list/content, not a way to navigate off to the rest of the public site. The article grid's links and the post page's "← All Insights" link carry the param forward so embed mode holds across the whole iframe session, not just the first page loaded into it.</Card>
            <Card title="Headline bar watermark">The emerald "Insights" headline bar carries the same brain-fingerprint mark as the profile page hero (<code>/images/brain-fingerprint-watermark.webp</code>, 640px wide, bleeding about 35% off the right edge; 420px on phones). The image is dark lines on a white-filled shape, so it uses <code>mix-blend-mode: multiply</code> at 15% opacity to drop the white fill into the green and leave only the lines, the same way they read on the profile page's light band. Decorative only (<code>aria-hidden</code>), behind the text. Shows on the public /insights page and inside the portal's Recent Articles.</Card>
            <Card title="Card thumbnails">Each card in the grid gets a thumbnail band above the title. If the post has a Sanity <code>mainImage</code> set, that's used (cropped to 600×340 via <code>urlFor()</code>). If not — true for every post today, since no editor has uploaded one yet — <code>lib/insightThumb.js</code> supplies a branded fallback: a diagonal gradient in one of four palette combinations (navy→emerald, navy→blue, navy→amber, slate→slate), with the same brain-fingerprint mark used as the dashboard hero's watermark and the Session Architect deck's block dividers bleeding off the bottom-right corner. The fallback theme cycles by the post's position in the list (not a hash of its title) specifically so a small collection doesn't end up with three near-identical cards by hash collision — position is already stable since <code>postsQuery</code> sorts by <code>publishedAt desc</code>, so a given post keeps its look across rebuilds either way.</Card>
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

          <section className="section" id="language-mirror">
            <div className="section-header">
              <h2 className="section-title">Language Mirror (hidden)</h2>
              <span className="section-path">/mirror</span>
            </div>
            <div className="badges"><span className="badge badge-public">Public</span></div>
            <p style={{fontSize:'0.855rem',color:'var(--sub)',marginBottom:12,lineHeight:1.65}}>A public, unauthenticated, hidden page: no nav/footer link anywhere, <code>&lt;meta name="robots" content="noindex, nofollow"&gt;</code>, reached only via <code>/mirror?key=&lt;token&gt;</code>. Not gated by portal auth, since testers have no account. Pastes a sample of the visitor's own writing and returns a hypothesis read (register signals plus the conspicuously quiet orientation), then a CTA to <code>/buy</code>. Prototype: <code>handoff/language_mirror.jsx</code>.</p>
            <Card title="Token gate: mirror_tokens">A separate table from the assessment <code>tokens</code> table, no shared logic. <code>getServerSideProps</code> checks the <code>curio_mirror</code> httpOnly cookie first; if absent or invalid, falls back to the <code>?key=</code> query param, and on a valid key sets the cookie so the key never needs to reappear in the URL. Any invalid or missing credential returns a real <code>404</code> (via <code>notFound: true</code>), never 401/403, so the page reveals nothing about its own existence. <code>lib/mirrorAuth.js</code> holds the shared cookie/validation/rate-limit logic used by both the page and <code>/api/mirror</code>.</Card>
            <Card title="Rate limit and counters">20 reads per token per day, a friendly message past the limit. <code>mirror_tokens.use_count</code> is a lifetime total (shown in admin); <code>daily_count</code> / <code>daily_count_date</code> are a separate pair that reset when the stored date isn't today, so the daily cap and the lifetime count don't fight over the same column.</Card>
            <Card title="System prompt: lib/language-framework.js">Composed server-side in <code>pages/api/mirror.js</code> from the same shared module as the Translator and Detector (register definitions, the absence principle, detection guardrails, locked language rules), plus a small Mirror-specific task and four-section output format (The read / The evidence / The quiet third / One experiment). Never imported by any client page.</Card>
            <Card title="Consent and writing_samples">Two checkboxes: "This is my own writing" (required to run) and an optional consent checkbox ("Curio may keep this sample to improve how MindPrint&trade; reads language"). A <code>writing_samples</code> row (<code>mirror_token_id</code>, <code>sample_text</code>, <code>mirror_output</code>, <code>consented</code>) is written only when consent is checked; unchecked, nothing is stored, not even a hash. Since every consented row is tied to a labeled token, this is an attributable corpus by design, the consent copy does not claim anonymity.</Card>
            <Card title="Admin: Mirror Tokens">/admin, "Language Tools" nav section. Create a labeled token (e.g. "Kari pilot"), copy its <code>/mirror?key=...</code> link, deactivate it any time, killing access on the token's next request regardless of how widely the link was shared.</Card>
            <div className="info-block"><strong>Going public later:</strong> per the handoff notes, removing the token gate, swapping in per-IP rate limiting, dropping <code>noindex</code>, and adding a nav link are the only changes needed, the page itself does not change.</div>
          </section>

          <section className="section" id="email-notifications">
            <div className="section-header">
              <h2 className="section-title">Email Notifications</h2>
            </div>
            <p style={{fontSize:'0.855rem',color:'var(--sub)',marginBottom:12,lineHeight:1.65}}>All outbound email goes through Resend from <code>hello@choosecurio.com</code> (participant-facing) or <code>notifications@choosecurio.com</code> (admin notifications to you). You receive a BCC on every participant email. In the three token-link emails below (admin panel, portal owner "Send Assessment Links", and the dashboard's "Email me the link" resend), the token URL renders as a green button rather than a plain text link, whenever it sits alone on its own line in the message, exactly how each one's default template already places it.</p>
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
