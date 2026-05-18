export type NavItem = {
  label: string
  href: string
}

export type Template = {
  id: string
  title: string
  eyebrow: string
  summary: string
  description: string
  genre: string
  image: string
  palette: string
  tags: string[]
  useCases: string[]
  exports: string[]
  metrics: { label: string; value: string }[]
  prompt: string
}

export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  category: string
  date: string
  readTime: string
  author: string
  hero: string
  sections: { heading: string; body: string }[]
  takeaway: string
}

export const navItems: NavItem[] = [
  { label: 'Templates', href: '/templates' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'Docs', href: '/documentation' },
]

export const imagePrompts = {
  worldHero:
    'A cinematic cyber-fantasy world-building scene for a Roblox UI creation platform, rune-lit citadel, floating holographic interface forge, midnight navy atmosphere, electric cyan and violet energy trails, ember gold highlights, no text, 16:9',
  hudPreview:
    'Premium game-ready HUD interface for a Roblox action RPG, transparent panel styling, neon cyan and violet highlights, polished quest tracker, inventory frame, currency counters, modular layout, no baked text logos, 16:9',
  templatesBanner:
    'Fantasy interface arsenal display for a Roblox creator toolkit, multiple floating HUD panels, shop UI, quest board, inventory grid, profile card, cinematic blue and gold lighting, no text, 16:9',
} as const

export const features = [
  {
    title: 'Roblox-Native HUD Generation',
    copy: 'Prompt for health bars, inventory frames, quest trackers, shop panels, and profile cards that are shaped for Roblox UI constraints.',
  },
  {
    title: 'Template Library With Taste',
    copy: 'Start from battle-tested fantasy, simulator, tycoon, and RPG interface systems instead of blank-canvas guesswork.',
  },
  {
    title: 'Export-Ready Asset Stack',
    copy: 'Keep visual direction, prompt context, transparent assets, and Luau hierarchy notes together so the design survives handoff.',
  },
]

export const workflowSteps = [
  {
    title: 'Choose a Forge Pattern',
    copy: 'Pick a proven HUD structure for your genre, monetization loop, and player session.',
  },
  {
    title: 'Describe the Fantasy',
    copy: 'Add mood, factions, resources, rarity language, and screen density so HUDForge can stay on-theme.',
  },
  {
    title: 'Refine the Interface',
    copy: 'Tune visual hierarchy, panel weight, accent colors, and export targets before you commit assets.',
  },
  {
    title: 'Ship to Roblox Studio',
    copy: 'Use PNG-ready art direction and Luau notes to rebuild polished UI faster inside your production project.',
  },
]

export const templates: Template[] = [
  {
    id: 'arcane-inventory',
    title: 'Arcane Inventory Grid',
    eyebrow: 'Action RPG',
    summary: 'A rune-framed backpack and equipment system for loot-heavy Roblox RPGs.',
    description:
      'Built for players who sort gear often, compare rarities fast, and expect the inventory to feel like part of the world rather than a spreadsheet.',
    genre: 'RPG Inventory',
    image: '/generated/marketing/hud-preview-rpg.png',
    palette: 'Cyan, violet, ember gold',
    tags: ['Inventory', 'Equipment', 'Rarity', 'Mobile-safe'],
    useCases: ['Dungeon crawlers', 'Loot simulators', 'Fantasy roleplay hubs'],
    exports: ['Transparent panel PNGs', 'Slot state guide', 'Luau hierarchy notes', 'Prompt remix seed'],
    metrics: [
      { label: 'Panels', value: '8' },
      { label: 'States', value: '14' },
      { label: 'Aspect', value: '4:3' },
    ],
    prompt:
      'Game-ready Roblox inventory HUD, premium cyber-fantasy UI, transparent PNG style, neon cyan accents, gold micro-highlights, dark polished surfaces, clean readable modular layout, no background clutter.',
  },
  {
    id: 'quest-command-board',
    title: 'Quest Command Board',
    eyebrow: 'Adventure Loop',
    summary: 'A mission tracker with objective cards, rewards, faction rank, and daily quest pressure.',
    description:
      'Designed for live-service Roblox experiences where quests need to sell momentum without burying players in text.',
    genre: 'Quest UI',
    image: '/generated/marketing/world-hero-fantasy.png',
    palette: 'Midnight, cyan, aurora mint',
    tags: ['Quests', 'Rewards', 'Daily loops', 'Progress'],
    useCases: ['Adventure worlds', 'Anime battlers', 'Open-world simulators'],
    exports: ['Quest card frames', 'Reward chip states', 'Timeline composition', 'Copy density guide'],
    metrics: [
      { label: 'Cards', value: '6' },
      { label: 'Loops', value: '3' },
      { label: 'Density', value: 'High' },
    ],
    prompt:
      'Game-ready Roblox quest board HUD, premium cyber-fantasy UI, transparent PNG style, neon cyan accents, gold micro-highlights, readable objective modules, no background clutter.',
  },
  {
    id: 'faction-war-room',
    title: 'Faction War Room',
    eyebrow: 'Competitive Hub',
    summary: 'A clan dashboard for territory pressure, member rank, treasury, and season status.',
    description:
      'A premium management surface for Roblox groups that need status, ownership, and social proof to feel valuable.',
    genre: 'Faction Dashboard',
    image: '/generated/marketing/hud-preview-rpg.png',
    palette: 'Obsidian, violet, warning gold',
    tags: ['Factions', 'Clans', 'Leaderboard', 'Season pass'],
    useCases: ['Clan battlers', 'Territory games', 'Competitive roleplay'],
    exports: ['Dashboard frame', 'Leaderboard modules', 'Rank badge sheet', 'Responsive layout notes'],
    metrics: [
      { label: 'Modules', value: '11' },
      { label: 'Ranks', value: '5' },
      { label: 'Format', value: '16:9' },
    ],
    prompt:
      'Game-ready Roblox faction dashboard HUD, premium cyber-fantasy UI, transparent PNG style, neon cyan accents, gold micro-highlights, dark polished surfaces, clean modular layout.',
  },
  {
    id: 'relic-loot-shop',
    title: 'Relic Loot Shop',
    eyebrow: 'Monetization',
    summary: 'A conversion-minded shop frame for bundles, relic crates, currency, and limited offers.',
    description:
      'A shop layout that makes premium offers feel collectible and readable without collapsing into visual noise.',
    genre: 'Shop UI',
    image: '/generated/marketing/world-hero-fantasy.png',
    palette: 'Ink blue, cyan, ember',
    tags: ['Shop', 'Bundles', 'Currency', 'Offers'],
    useCases: ['Simulator stores', 'Battle passes', 'Event shops'],
    exports: ['Offer card frames', 'Currency header', 'Bundle hierarchy', 'Sale state guide'],
    metrics: [
      { label: 'Offers', value: '9' },
      { label: 'States', value: '12' },
      { label: 'CTA', value: '3 tiers' },
    ],
    prompt:
      'Game-ready Roblox loot shop HUD, premium cyber-fantasy UI, transparent PNG style, neon cyan accents, gold micro-highlights, clean readable offer cards, no background clutter.',
  },
]

export const pricingPlans = [
  {
    name: 'Scout',
    price: '$0',
    cadence: 'during beta',
    description: 'For builders validating a new Roblox UI direction.',
    cta: 'Join Waitlist',
    featured: false,
    features: ['3 template previews', 'Prompt starter library', 'Community launch notes', 'Basic export guidance'],
  },
  {
    name: 'Forge Pro',
    price: '$19',
    cadence: 'per creator / month',
    description: 'For solo creators and small teams shipping weekly updates.',
    cta: 'Reserve Founder Price',
    featured: true,
    features: ['Unlimited saved prompt briefs', 'Premium template systems', 'PNG export workflow', 'Luau hierarchy notes', 'Priority beta invites'],
  },
  {
    name: 'Studio',
    price: 'Custom',
    cadence: 'for teams',
    description: 'For studios standardizing UI production across multiple Roblox experiences.',
    cta: 'Contact Team',
    featured: false,
    features: ['Shared style libraries', 'Team onboarding', 'Custom template packs', 'Roadmap input', 'Launch support'],
  },
]

export const faqs = [
  {
    question: 'Is HUDForge a generic image generator?',
    answer: 'No. The product is focused on Roblox UI workflows: HUD layouts, game-menu framing, export context, and repeatable interface systems.',
  },
  {
    question: 'Can I use the generated direction in Roblox Studio?',
    answer: 'Yes. V1 focuses on visual direction, transparent asset planning, and Luau hierarchy notes so creators can rebuild the UI cleanly in Studio.',
  },
  {
    question: 'Will templates become real editable project files?',
    answer: 'That is the intended path. The current frontend uses typed local content while the product team validates which templates convert and activate best.',
  },
]

export const blogPosts: BlogPost[] = [
  {
    slug: 'roblox-hud-polish-matters',
    title: 'Why HUD Polish Changes Roblox Player Trust',
    excerpt: 'Players judge production quality before they read your tutorial. HUDForge treats the first screen like a conversion surface.',
    category: 'Design',
    date: '2026-05-18',
    readTime: '5 min read',
    author: 'HUDForge Team',
    hero: '/generated/marketing/world-hero-fantasy.png',
    takeaway: 'The fastest conversion win is often not more UI. It is clearer hierarchy, stronger theme fit, and fewer confusing states.',
    sections: [
      {
        heading: 'The interface is the first promise',
        body: 'A Roblox experience can have a strong core loop and still lose players if the first HUD looks temporary. Polished panels, readable counters, and confident CTAs tell players the world is maintained.',
      },
      {
        heading: 'Theme fit beats decoration',
        body: 'Cyber-fantasy styling works when it clarifies status, rarity, and action priority. Decoration that competes with gameplay lowers trust instead of raising it.',
      },
      {
        heading: 'Reusable systems compound',
        body: 'A template library turns polish into a repeatable workflow. Once a studio has a shared frame language, new events and offers ship with less redesign churn.',
      },
    ],
  },
  {
    slug: 'export-ready-ui-prompts',
    title: 'Writing UI Prompts That Survive Export',
    excerpt: 'A good prompt names layout, state, density, and engine constraints before it names vibes.',
    category: 'Workflow',
    date: '2026-05-16',
    readTime: '4 min read',
    author: 'HUDForge Team',
    hero: '/generated/marketing/hud-preview-rpg.png',
    takeaway: 'Strong prompts describe production intent: panel anatomy, player action, responsive constraints, and export artifacts.',
    sections: [
      {
        heading: 'Start with the player action',
        body: 'Inventory, shop, quest, and faction screens each have a different job. Begin by naming the job so every visual choice supports the interaction.',
      },
      {
        heading: 'Specify interface anatomy',
        body: 'List the modules you expect: header, counters, tabs, cards, empty states, buttons, and reward chips. This keeps generated concepts closer to buildable UI.',
      },
      {
        heading: 'Keep export in mind',
        body: 'Ask for clean modular surfaces, transparent PNG styling, and readable state separation. The goal is not only a beautiful image; it is a usable Roblox workflow.',
      },
    ],
  },
  {
    slug: 'template-library-activation',
    title: 'Template Libraries Are Activation Tools',
    excerpt: 'The right starter template gets a creator to the first useful export faster than another empty prompt box.',
    category: 'Growth',
    date: '2026-05-14',
    readTime: '6 min read',
    author: 'HUDForge Team',
    hero: '/generated/marketing/world-hero-fantasy.png',
    takeaway: 'Templates shorten the gap between curiosity and proof. That gap is where many creative tools lose new users.',
    sections: [
      {
        heading: 'Blank prompts are work',
        body: 'New users may want magic, but they still need examples. Templates give them a starting structure and language for the kind of UI they want.',
      },
      {
        heading: 'Genre context improves output',
        body: 'A simulator shop, RPG inventory, and faction dashboard need different hierarchy. Local template content lets HUDForge encode those differences from the first click.',
      },
      {
        heading: 'Activation should feel concrete',
        body: 'A creator should leave the first session with a credible direction, not a generic art board. That is why this redesign puts templates at the center of navigation.',
      },
    ],
  },
]

export const docsCategories = [
  {
    title: 'Quick Start',
    copy: 'Create your first HUDForge brief, choose a template, and understand the export stack.',
    links: ['Create a brief', 'Pick a template', 'Export checklist'],
  },
  {
    title: 'Prompt System',
    copy: 'Learn the prompt anatomy for Roblox UI: screen job, panel structure, states, palette, and platform density.',
    links: ['Prompt anatomy', 'State language', 'Genre modifiers'],
  },
  {
    title: 'Roblox Handoff',
    copy: 'Turn generated direction into Studio-ready frames, image labels, hierarchy notes, and responsive constraints.',
    links: ['Luau hierarchy', 'PNG slicing', 'Mobile constraints'],
  },
  {
    title: 'Beta Operations',
    copy: 'Understand waitlist access, founder pricing, support channels, and what changes during the preview period.',
    links: ['Beta access', 'Founder plan', 'Support policy'],
  },
]

export const contactChannels = [
  {
    title: 'Creator Access',
    copy: 'Join the private beta if you are building a Roblox experience and need faster UI direction.',
    action: 'Join waitlist below',
  },
  {
    title: 'Studio Partnerships',
    copy: 'Reach out for custom template packs, team workflows, and launch support for multiple experiences.',
    action: 'studio@hudforge.app',
  },
  {
    title: 'Support',
    copy: 'Need help with auth, exports, or beta access? Send context and your account email.',
    action: 'support@hudforge.app',
  },
]

export function getTemplate(id: string) {
  return templates.find((template) => template.id === id)
}

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug)
}
