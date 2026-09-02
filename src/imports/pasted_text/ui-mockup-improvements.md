Modify and improve the existing High-Fidelity UI Mockups in this Figma project:

High Fidelity UI Mockups

Important: **Do not redesign the product from scratch.** Keep the existing working page structure, flows, and correct functional content wherever they already make sense. The goal is to improve the **visual identity, information architecture, navigation, and UI/UX consistency** based on the actual GenAI academic learning platform concept.

This is an academic AI-powered learning platform that combines both a general AI assistant experience and RAG-based academic capabilities. The platform supports personalized learning through course content, topic mastery tracking, learning gap identification, diagnostic assessments, practice, and reassessment.

Use the existing design as the base and apply the following changes:

---

# 1. Login / Registration Screen

Redesign the visual panel next to the Login/Register form.

Remove generic decorative visuals such as floating geometric shapes, random illustrations, or decorative gradients that do not communicate the product's purpose.

Replace that side panel with a meaningful product-related visualization representing a **Mastery Ladder**.

The visualization should show several academic topics with different mastery levels, for example:

- No Evidence
- Beginner
- Intermediate
- Advanced
- Mastered

Represent these levels visually using elegant progress bars or mastery indicators.

Add a short product message that communicates the core philosophy:

**Mastery is built on real evidence, not AI guesses.**

The visual should immediately communicate that the platform tracks learning based on evidence and performance rather than relying on unsupported LLM assumptions.

Keep the Login/Register forms themselves clean, minimal, and easy to use.

---

# 2. Replace the Top Navbar with a Sidebar

For authenticated pages, remove the current main top navigation and replace it with a persistent sidebar.

Use:

- Left sidebar for LTR layouts
- Right sidebar for RTL layouts

The navigation labels must reflect the actual product features, not generic dashboard labels.

Student navigation should include:

1. Dashboard
2. My Courses
3. Topics & Mastery
4. AI Tutor
5. Diagnostic Assessment
6. Practice
7. Reassessment
8. Profile

Important:

Do not add teacher-only or future features to the student sidebar if they belong to a different RBAC role.

For example, features such as:

- Teacher Analytics Dashboard
- AI Teaching Assistant
- Assignment Grading tools

may remain in the Figma project if they already exist or are planned, but they must not appear in the student navigation.

The sidebar should feel modern, academic, focused, and uncluttered.

Use clear SVG icons for every navigation item.

---

# 3. Topics & Mastery Page

The Topics & Mastery section should clearly reflect the platform's core learning model.

For every topic, show relevant information such as:

- Topic name
- Current mastery level
- Evidence count
- Average score
- Mastery progress
- Learning gaps
- Gap severity / priority
- Whether a learning gap blocks progress in another topic

Learning gaps should be visually prioritized by severity.

Every important learning gap should feel traceable to evidence rather than appearing as an unexplained AI recommendation.

The page should clearly communicate:

**What the student knows, what evidence supports that conclusion, what they are missing, and what they should work on next.**

---

# 4. AI Tutor

The AI Tutor must not look like a generic ChatGPT-style chatbot.

It should clearly communicate that it is a **RAG-based academic tutor grounded in approved course materials**.

For each AI response, support concepts such as:

- Citations to course materials
- Source references
- Grounded response status
- Insufficient evidence status when the system cannot confidently answer from available materials

Include a clear response mode selector or indicator, such as:

- Explanation
- Worked Example
- Summary
- Guided Questioning

The UI should make the AI's behavior transparent and trustworthy.

Do not make unsupported answers appear equally confident as grounded answers.

---

# 5. Diagnostic Assessment

The Diagnostic flow should focus on discovering the student's mastery level.

Each question should clearly display:

- Related topic
- Difficulty level:
  - Easy
  - Medium
  - Hard

The assessment flow should be:

Question → Student Answer → Evaluation → Topic/Skill Insight

Do not present the final result as only one overall score.

Results should show performance and mastery at the **topic and skill level**.

The visual design should help students understand exactly where their strengths and weaknesses are.

---

# 6. Practice

Practice questions should also be connected to the actual learning model.

Each question should clearly indicate:

- Related topic
- Difficulty level
- Relevant skill or concept where applicable

Practice should feel connected to identified learning gaps and mastery progress, rather than being a random collection of questions.

---

# 7. Reassessment

Redesign the Reassessment experience around measurable learning improvement.

Clearly show:

- Before vs After comparison
- Comparison for the same topics or skills
- Learning Gain %
- Number of learning gaps resolved
- Number of gaps remaining

Important:

Do not simply repeat the exact same questions from the Diagnostic assessment.

The UI should communicate improvement in understanding, not memorization of previous answers.

Use visual comparisons that make progress immediately understandable.

---

# 8. Top Bar

If a compact top bar remains after introducing the sidebar, keep it minimal and useful.

Remove unnecessary text buttons such as:

- Login
- Register

Replace them with clean icon-based actions where appropriate.

Prioritize useful controls such as:

- Profile / Account icon
- Language switcher (AR / EN)
- Light / Dark mode toggle

Do not place text next to these icons by default.

Text labels may appear only through hover tooltips.

Use simple SVG icons only.

---

# 9. Color System and Visual Identity

The current use of literal traditional yellow, green, and red should be removed.

Do not use Bootstrap-like warning/success/danger colors as the main visual language.

Create a refined semantic color system for:

- Mastery levels
- Learning gap severity
- Progress
- Evidence confidence
- System states

The color system should be based primarily on a sophisticated combination of:

- Teal / blue-green tones
- Warm muted gold
- Dusty or earthy rose tones

Avoid highly saturated traffic-light colors.

The colors should feel:

- Academic
- Modern
- Intelligent
- Trustworthy
- Professional

Use semantic meaning through carefully designed shades and contrast, not through obvious red/green/yellow conventions.

---

# 10. Dark Mode

Do not use pure black for Dark Mode.

Use a deep, sophisticated navy or dark blue-gray background instead.

The dark theme should feel like part of the same product identity as the light theme.

Do not make Light Mode and Dark Mode look like two completely different designs.

Use the same design tokens and brand identity across both themes, with adjusted contrast and surface values.

The transition between themes should feel visually consistent.

A strong direction would be:

- Light Mode: soft neutral backgrounds with teal-based identity
- Dark Mode: deep navy surfaces with teal highlights and carefully controlled warm accents

Avoid purple-heavy dark themes.

---

# 11. No Emojis

Do not use emojis anywhere in the product UI.

This includes:

- Avatars
- Chat messages
- Status indicators
- Empty states
- Notifications
- Buttons

Use clean SVG icons instead.

The visual language should remain professional and consistent.

---

# 12. Content Must Reflect the Real Product

Replace generic placeholder content wherever possible with content that reflects the actual GenAI academic platform.

Use the backend functionality, existing implemented features, and project concept as the source of truth.

The UI should support the actual concepts implemented or planned in the platform, especially:

- Authentication and RBAC
- Courses
- Topics
- Topic mastery
- Evidence-based learning
- Learning gaps
- Diagnostic assessments
- Practice
- RAG-based AI tutoring
- Reassessment
- Learning improvement tracking

For features that are not implemented yet, use the product concept and future feature definitions from the project idea documentation.

However, do not invent random SaaS features that are unrelated to the platform.

---

# 13. Empty States and Loading States

Every page should have thoughtful states for:

- Loading
- Empty data
- No courses
- No evidence yet
- No learning gaps
- No diagnostic results
- No reassessment history

Never leave the user with a blank screen.

Every empty state should provide a clear next action.

Examples of useful CTAs:

- Start Diagnostic
- Explore Courses
- Ask the AI Tutor
- Begin Practice
- Take Reassessment

Keep these states visually lightweight and consistent with the overall design system.

---

# 14. UX and Transitions

Make the overall experience smooth and cohesive.

Use subtle transitions between:

- Pages
- Sidebar states
- Cards
- Theme changes
- Progress updates
- Modals or panels

Avoid dramatic animations or unnecessary motion.

There should be no sudden layout jumps.

Keep spacing, typography, component sizing, border radius, and visual hierarchy consistent across all screens.

The product should feel like one unified design system rather than multiple disconnected pages.

---

# Final Design Direction

The final UI should feel like a serious, modern academic intelligence platform.

It should communicate:

- Evidence-based learning
- Transparent AI
- Measurable mastery
- Personalized learning gaps
- Academic trust
- Clear student progress

Avoid making it look like:

- A generic chatbot
- A generic dashboard template
- A Bootstrap admin panel
- A colorful gamified learning app
- A collection of unrelated AI widgets

Keep what already works in the existing mockups.

Improve the visual identity and organization rather than unnecessarily changing working page structures or user flows.

The most important principle is:

**This platform does not merely generate answers. It helps students build measurable mastery based on evidence.**

Apply all changes directly to the existing High-Fidelity UI Mockups while maintaining consistency across the entire Figma project.