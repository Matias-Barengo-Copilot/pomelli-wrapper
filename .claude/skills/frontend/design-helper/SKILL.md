---
name: design-helper
description: Generate design system documentation by interviewing designers about brand colors, typography, spacing, components, and UI patterns. Use when starting projects, documenting design systems, creating style guides, or when design.md doesn't exist. Covers color palettes, font stacks, type scale, spacing scale, border radius, button styles, form inputs, component patterns, accessibility, design tokens. Triggers on design system, design documentation, design.md, brand colors, typography, style guide, design tokens, UI patterns, component library, design specs.
argument-hint: "[project-name]"
allowed-tools: Write, Read, AskUserQuestion
---

# Design Helper - Design System Documentation Generator

Generate a comprehensive, project-specific `design.md` file by interviewing the designer about brand colors, typography, component patterns, and design system tokens.

## When to Use

- Starting a new project that needs design documentation
- Existing project has no design.md or design system documentation
- Designer needs to document design decisions in a consistent format
- Engineering team needs clear design system reference
- Creating brand guidelines for consistent UI implementation

## Arguments

Project name (optional): `$ARGUMENTS`
- If provided (e.g., "Acme Dashboard"), use this as the project name
- If not provided, ask during the interview

## Why This Matters

Design documentation is often inconsistent, missing, or scattered across Figma files and Slack threads. This skill helps designers create comprehensive design documentation in a structured format that engineers can reference during implementation. Good design documentation reduces back-and-forth, prevents inconsistencies, and speeds up development.

## Interview Questions

Ask these questions one at a time. Be designer-friendly and avoid overly technical jargon.

### 1. Project Name

**If not provided as argument:**
"What is the name of this project or product?"

**If provided:**
"Great! So we're documenting the design system for `$ARGUMENTS`. Let's get started."

---

### 2. Project Description

"In 1-2 sentences, what is this project about? What does it do?"

**Guidance:** This provides context for the design decisions. Example: "A SaaS dashboard for tracking customer analytics and generating reports."

---

### 3. Design Style & Tone

"How would you describe the visual style and tone of this product? (e.g., modern and minimal, playful and colorful, professional and corporate, friendly and approachable)"

**Guidance:** This helps set the overall design direction. Multiple descriptors are fine. Examples:
- Modern and minimal
- Playful and colorful
- Professional and corporate
- Friendly and approachable
- Bold and energetic
- Calm and serene

---

### 4. Primary Brand Colors

"What are your primary brand colors? Please provide the main colors that represent the brand identity."

**For each color, ask:**
- Color name (e.g., "Brand Blue", "Primary")
- Hex value (e.g., #2563EB)
- Where it's used (e.g., "Primary buttons, links, active states")

**Guidance:** Most projects have 1-3 primary colors. If the designer provides RGB or HSL values, that's fine too. Encourage them to note accessibility considerations if known.

**Example:**
- Primary Blue: #2563EB - Used for primary buttons, links, and active states
- Brand Orange: #F97316 - Used for accents and call-to-action elements

---

### 5. Secondary & Accent Colors

"Do you have any secondary or accent colors? These are supporting colors used alongside the primary palette."

**Guidance:** These are optional. Not all design systems need them. If none, note that and move on.

---

### 6. Neutral Colors (Grays)

"What neutral colors (grays, blacks, whites) are you using? Please provide the scale from darkest to lightest."

**Guidance:** Most design systems have a gray scale for text, backgrounds, and borders. Examples:
- Gray 900 (darkest): #111827 - Used for headings
- Gray 700: #374151 - Used for body text
- Gray 400: #9CA3AF - Used for muted text
- Gray 200: #E5E7EB - Used for borders
- Gray 50 (lightest): #F9FAFB - Used for subtle backgrounds

Ask for at least 3-5 shades if they have them.

---

### 7. Semantic Colors

"What semantic colors are you using for UI feedback? Think success, error, warning, info states."

**For each semantic color:**
- Success (usually green) - for positive actions and confirmations
- Error (usually red) - for errors and destructive actions
- Warning (usually yellow/orange) - for warnings and cautions
- Info (usually blue) - for informational messages

**Guidance:** These are standard in most design systems. Ask for the hex value and usage for each.

---

### 8. Font Families

"What font families are you using? Please specify for headings, body text, and code (if applicable)."

**Guidance:**
- Headings: Often a bold, distinctive font
- Body: Usually a highly readable sans-serif or serif
- Code: Monospace font for code snippets

Examples:
- Headings: Inter, Poppins, Montserrat
- Body: Inter, Roboto, Open Sans, Lato
- Code: Fira Code, JetBrains Mono, Monaco, Courier

If using Google Fonts or custom fonts, note that too.

---

### 9. Type Scale

"What is your typography scale? Please provide font sizes, weights, and line heights for each heading level and body text."

**For each level, ask:**
- H1 (Page titles, hero headings)
- H2 (Section headings)
- H3 (Subsection headings)
- H4-H6 (smaller headings, if used)
- Body (default paragraph text)
- Small (captions, labels, meta text)

**For each, note:**
- Size (in px or rem)
- Weight (100-900 or keywords like Bold, Regular)
- Line height (unitless ratio like 1.2 or percentage like 120%)

**Example:**
- H1: 36px (2.25rem), 700 (Bold), line-height 1.2
- Body: 16px (1rem), 400 (Regular), line-height 1.5

**Guidance:** If they don't have all sizes defined, ask for the most important ones (H1, H2, Body).

---

### 10. Spacing Scale

"What spacing scale are you using? This is the set of spacing values for margins, padding, and gaps."

**Guidance:** Many design systems use a spacing scale based on multiples of 4 or 8. Examples:
- 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px (multiples of 4)
- 8px, 16px, 24px, 32px, 40px, 48px, 64px (multiples of 8)

If they don't have a formal scale, ask what common spacing values they use (e.g., "small gap", "medium gap", "large gap").

---

### 11. Border Radius

"What border radius values are you using for rounded corners? (e.g., buttons, cards, inputs)"

**Guidance:** Common patterns:
- None: 0px (sharp corners)
- Small: 4px (subtle rounding)
- Medium: 8px (moderate rounding)
- Large: 12px-16px (very rounded)
- Full: 9999px (pill shape, circular)

Ask if they use different values for different components (e.g., buttons vs. cards).

---

### 12. Shadows

"What shadow values are you using for elevation and depth?"

**Guidance:** Most design systems have 2-4 shadow levels:
- sm: Subtle shadow for slight elevation
- md: Default shadow for cards and modals
- lg: Larger shadow for dropdowns and popovers
- xl: Dramatic shadow for floating elements

If they have CSS shadow values (box-shadow), great. If not, ask them to describe when each shadow level is used.

---

### 13. Button Styles

"What button styles and variants do you have?"

**Ask about:**
- **Variants**: Primary, Secondary, Tertiary, Ghost, Outline, Link
- **Sizes**: Small, Medium, Large
- **States**: Default, Hover, Active, Disabled, Loading

**Guidance:** Buttons are the most common interactive component. Understanding the full button system helps establish the component pattern.

---

### 14. Form Input Styles

"What are your form input styles? Think text inputs, textareas, selects, checkboxes, radio buttons."

**Ask about:**
- Border style (solid, outlined, underlined)
- Focus state appearance
- Error state appearance
- Disabled state appearance
- Label positioning (above, floating, inline)

**Guidance:** Forms are critical to most UIs. Clear form documentation prevents inconsistencies.

---

### 15. Component Patterns

"What other key UI components or patterns are part of your design system? (e.g., cards, modals, navigation, tabs, badges, alerts, tooltips)"

**Guidance:** Let the designer list the components they consider important. Not every design system needs every component documented upfront. Focus on the ones they're actually using.

---

### 16. Accessibility Considerations

"Are there any specific accessibility requirements or considerations? (e.g., WCAG AA compliance, contrast ratios, focus indicators)"

**Guidance:** This is optional but important. Examples:
- All text must meet WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large text)
- Focus indicators must be visible on all interactive elements
- Color should not be the only way to convey information

If they don't know, note "To be determined" and move on.

---

### 17. Icons & Illustrations

"What icon set or illustration style are you using? (e.g., Heroicons, Feather Icons, custom illustrations)"

**Guidance:** Many design systems use icon libraries like:
- Heroicons
- Feather Icons
- Material Icons
- Font Awesome
- Lucide
- Custom designed icons

Note the style (outline, solid, duotone) and size variants.

---

### 18. Animation & Motion

"Are there any animation or motion guidelines? (e.g., transition durations, easing functions, animation principles)"

**Guidance:** This is optional. Examples:
- Transition duration: 150ms for micro-interactions, 300ms for page transitions
- Easing: ease-in-out for most transitions
- Principles: Subtle and purposeful, not distracting

If they don't have motion guidelines yet, note "To be determined".

---

### 19. Do's and Don'ts

"What are some important do's and don'ts for implementing this design system?"

**Guidance:** This helps engineers understand design intent. Examples:

**Do:**
- Use semantic color tokens, not hard-coded hex values
- Follow the spacing scale consistently
- Maintain consistent border radius across similar components

**Don't:**
- Create new color variations without consulting the design team
- Mix different font weights arbitrarily
- Override component styles in a way that breaks accessibility

Ask for 3-5 items for each list.

---

### 20. Additional Notes

"Is there anything else important about this design system that we should document?"

**Guidance:** This is a catch-all for any additional context, references to Figma files, design inspiration, or future plans.

---

## Generate design.md

After all questions are answered, generate the design.md file using this structure:

```markdown
# Design System: <Project Name>

> <Project description from interview>

**Design Style:** <Style and tone from interview>

---

## Table of Contents

1. [Brand Colors](#brand-colors)
2. [Typography](#typography)
3. [Spacing & Layout](#spacing--layout)
4. [Components](#components)
5. [Accessibility](#accessibility)
6. [Do's and Don'ts](#dos-and-donts)

---

## Brand Colors

### Primary Colors

<For each primary color:>

#### <Color Name>
- **Hex:** #XXXXXX
- **RGB:** rgb(X, X, X)
- **Usage:** <Where and when to use this color>
- **Accessibility:** <WCAG notes if provided>

### Secondary Colors

<If applicable, same format as primary>

### Neutral Colors

<List the gray scale from darkest to lightest>

#### Gray 900 (Darkest)
- **Hex:** #XXXXXX
- **Usage:** Headings, primary text

<Continue for all gray shades>

### Semantic Colors

#### Success
- **Hex:** #XXXXXX
- **Usage:** Success messages, positive actions, confirmations

#### Error
- **Hex:** #XXXXXX
- **Usage:** Error messages, destructive actions, validation errors

#### Warning
- **Hex:** #XXXXXX
- **Usage:** Warning messages, caution states

#### Info
- **Hex:** #XXXXXX
- **Usage:** Informational messages, helpful tips

---

## Typography

### Font Families

- **Headings:** <Font name, source (Google Fonts, etc.)>
- **Body:** <Font name, source>
- **Code:** <Font name, source> *(if applicable)*

### Type Scale

#### Heading 1 (H1)
- **Font:** <Font family>
- **Size:** XXpx (X.XXrem)
- **Weight:** XXX (name)
- **Line Height:** X.X
- **Usage:** Page titles, hero headings

<Continue for H2, H3, H4, H5, H6, Body, Small>

### Font Loading

<If designer mentioned custom fonts or performance considerations>

---

## Spacing & Layout

### Spacing Scale

Use these consistent spacing values for margins, padding, and gaps:

- **xs:** Xpx - <usage>
- **sm:** Xpx - <usage>
- **md:** Xpx - <usage>
- **lg:** Xpx - <usage>
- **xl:** Xpx - <usage>
- **2xl:** Xpx - <usage>

### Border Radius

- **None:** 0px - Sharp corners
- **sm:** Xpx - <components>
- **md:** Xpx - <components>
- **lg:** Xpx - <components>
- **full:** 9999px - Pills, circular buttons

### Shadows

#### Small
- **CSS:** box-shadow: <value>
- **Usage:** <when to use>

<Continue for md, lg, xl shadow levels>

---

## Components

### Buttons

#### Variants

- **Primary:** <Description and usage>
- **Secondary:** <Description and usage>
- **Tertiary:** <Description and usage>
- **Ghost:** <Description and usage>
- **Outline:** <Description and usage>

#### Sizes

- **Small:** <Height, padding, font size>
- **Medium (Default):** <Height, padding, font size>
- **Large:** <Height, padding, font size>

#### States

- **Default:** <Appearance>
- **Hover:** <Appearance>
- **Active:** <Appearance>
- **Disabled:** <Appearance>
- **Loading:** <Appearance>

### Form Inputs

#### Text Inputs & Textareas

- **Border:** <style>
- **Focus State:** <appearance>
- **Error State:** <appearance>
- **Disabled State:** <appearance>
- **Label Position:** <above/floating/inline>

#### Checkboxes & Radio Buttons

<Description of styling>

#### Selects & Dropdowns

<Description of styling>

### Other Components

<For each component mentioned in the interview, document:>

#### <Component Name>

- **Usage:** <When to use this component>
- **Variants:** <If applicable>
- **States:** <If applicable>
- **Spacing:** <Internal padding/margins>
- **Notes:** <Any special considerations>

---

## Icons & Illustrations

<If provided>

- **Icon Set:** <Name and source>
- **Style:** <Outline, solid, duotone, etc.>
- **Sizes:** <Available sizes>
- **Usage:** <Guidelines>

---

## Animation & Motion

<If provided>

- **Transition Duration:**
  - Micro-interactions: XXXms
  - Component transitions: XXXms
  - Page transitions: XXXms

- **Easing:** <easing function>

- **Principles:**
  - <Principle 1>
  - <Principle 2>

---

## Accessibility

<Document accessibility requirements from the interview>

- **Color Contrast:** <WCAG compliance level>
- **Focus Indicators:** <Requirements>
- **Keyboard Navigation:** <Requirements>
- **Screen Readers:** <Considerations>
- **Other:** <Any other a11y notes>

---

## Do's and Don'ts

### Do

- <Do item 1>
- <Do item 2>
- <Do item 3>
- <Do item 4>
- <Do item 5>

### Don't

- <Don't item 1>
- <Don't item 2>
- <Don't item 3>
- <Don't item 4>
- <Don't item 5>

---

## Design Tokens Reference

### Using Design Tokens

Design tokens are the foundational building blocks of this design system. They are named entities that store visual design attributes like colors, spacing, and typography. Using tokens instead of hard-coded values ensures consistency and makes global updates easier.

**Example:**
```css
/* ❌ Don't: Hard-coded values */
background-color: #2563EB;
padding: 16px;

/* ✅ Do: Use design tokens */
background-color: var(--color-primary);
padding: var(--spacing-md);
```

---

## Additional Notes

<Any additional context, Figma file links, design inspiration, or future plans>

---

## Resources

- **Figma:** <Link to Figma file if provided>
- **Design Inspiration:** <References if provided>
- **Related Documentation:** <Links to other docs>

---

*Design system documented via `/design-helper` skill*
*Last updated: <current date>*
```

## Output Process

1. After gathering all interview responses, generate the complete design.md file
2. Ask: "I've generated your design.md file. Where would you like me to save it?"
   - Suggest: `design.md` at project root
   - Or: `docs/design.md`
   - Or: `accounts/<account-name>/design.md` (if using account structure)
3. Write the file to the specified location
4. Confirm: "design.md created at <path>. Review and customize as needed."
5. Ask: "Would you like me to commit this to git? (y/n)"
6. If yes, commit with message: `docs: add design system documentation via design-helper`

---

## Quality Bar

Good design documentation:
- Provides clear, actionable guidance for engineers
- Uses concrete examples (hex values, px/rem sizes, specific components)
- Includes accessibility considerations
- Documents the "why" behind design decisions
- Provides do's and don'ts to prevent common mistakes
- Is easy to scan and reference during development
- Uses consistent formatting and organization

Bad design documentation:
- Vague descriptions ("use blue") without specific values
- Missing critical sections (colors, typography, spacing)
- No guidance on when to use which components
- Lacks accessibility considerations
- No examples of correct usage
- Assumes engineers know design intent without explanation

---

## Examples

### Example 1: Startup SaaS Dashboard

**Scenario:** Designer creating documentation for a modern analytics dashboard

**Key Decisions:**
- Primary Color: Blue (#2563EB) for trust and professionalism
- Typography: Inter for both headings and body (clean, modern)
- Spacing: 8px scale for consistent rhythm
- Components: Card-heavy layout with subtle shadows
- Tone: Professional and modern, but approachable

**Result:** design.md with emphasis on data visualization color accessibility, clear component spacing, and professional tone throughout.

### Example 2: Consumer Mobile App

**Scenario:** Designer documenting a playful social app design

**Key Decisions:**
- Primary Colors: Vibrant purple and orange gradient
- Typography: Rounded sans-serif (Poppins) for friendly feel
- Spacing: Generous padding for touch-friendly interface
- Components: Pill-shaped buttons, playful animations
- Tone: Friendly, energetic, and fun

**Result:** design.md with emphasis on vibrant colors, rounded components, micro-interactions, and playful motion guidelines.

---

## Notes

- Ask one question at a time to avoid overwhelming the designer
- Use the designer's actual answers - don't assume or fill in blanks
- If the designer says "not sure" or "we'll figure it out later", note it as "To be determined" in the documentation
- Be flexible - not every design system needs every section fully documented upfront
- Convert color formats if needed (help designer provide hex, RGB, and HSL if possible)
- Encourage accessibility thinking but don't require it if not defined yet
- This is a living document - it's okay to start with partial information and expand later
- Focus on clarity and usability for engineers who will reference this during implementation

---

## Design Token Best Practices

Share these insights with designers during the interview:

### Three-Layer Token Architecture

Modern design systems organize tokens into three layers:
1. **Primitive tokens**: Raw values (e.g., `blue-500: #2563EB`)
2. **Semantic tokens**: Meaning-based (e.g., `color-primary: blue-500`)
3. **Component tokens**: Component-specific (e.g., `button-background: color-primary`)

This layered approach makes updates easier. Changing `blue-500` updates everywhere it's used.

### Naming Conventions

- **Do:** Use semantic names (`color-text-muted`, `spacing-md`, `shadow-lg`)
- **Don't:** Use literal names (`gray-400`, `16px`, `shadow-3`)

Semantic names survive visual changes. If you rebrand from blue to green, `color-primary` still makes sense. `blue-500` doesn't.

### Common Pitfalls to Avoid

- Creating too many tokens too early (start simple, expand as needed)
- Skipping documentation (tokens need usage guidelines)
- Inconsistent naming (decide on convention early)
- Forgetting accessibility (test contrast ratios)

---

## Sources

Research on design system documentation and best practices informed this skill:

- [How to Build a UI Design System: Complete Guide 2026](https://www.orbix.studio/blogs/ui-design-system-guide)
- [What is a Design System? A 2026 Guide With Best Practice Examples | Untitled UI](https://www.untitledui.com/blog/what-is-a-design-system)
- [Design Systems & Design Tokens Complete Guide - Build Scalable UI | design.dev](https://design.dev/guides/design-systems/)
- [Design Tokens 101 - Design strategy guide](https://designstrategy.guide/design-tokens-101/)
- [Design tokens explained (and how to build a design token system) | Contentful](https://www.contentful.com/blog/design-token-system/)
- [Design Tokens - The Foundation of Scalable Design Systems | Medium](https://medium.com/design-bootcamp/design-tokens-b880c9d78579)
- [Design System Documentation Template | OpenBMC](https://github.com/openbmc/docs/blob/master/designs/design-template.md)
- [Design Documentation Template Examples | GitHub](https://github.com/imayobrown/DesignDocumentTemplates)
