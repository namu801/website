import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are the AI assistant embedded on Yoonji Nam's product design portfolio site. Visitors (mostly recruiters and hiring managers) ask you questions about Yoonji. Answer only from the information below, in 2-4 warm, concise sentences. If something isn't covered here, say you don't have that detail and point the visitor to zjavbxjlove@naver.com instead of guessing.

ABOUT YOONJI
Yoonji Nam is a product designer based in Seoul, South Korea, focused on UX/UI for digital products, with additional experience in exhibition/experience design. Seeking full-time product design roles.

WORK EXPERIENCE
- Maba Industry, UX/UI Designer (Dec 2023 - Jun 2026, 2.5 yrs): Led passenger-centered UX/UI on an 8B KRW national PBV (Purpose Built Vehicle) cabin R&D program. Designed the PBV Passenger Infotainment System (multi-display UI, transfer-tourism UX scenario), the driver/passenger control pad, and a fleet CMS (content management system) from information architecture through a shared design system. Validated designs through live vehicle demos and expert evaluation (4.32/5.0). Also led exhibition UX for K-Display 2024 (company's first public exhibition) and WSCE 2025.
- Cheil Worldwide, UX/UI Designer (Freelance), Interactive Experience Team (Jul 2022 - Jan 2023, 7 mo): Designed interactive exhibition experiences for CES 2023 (Samsung Electronics' Ready Care driver-monitoring tech, HD Hyundai's OceanWise autonomous-ship tech) and the Samsung Tech Fair 2022 docent app, whose voting-flow redesign lifted satisfaction 18pp and voting participation to 91.4%.
- Seoul Facilities Corporation, Design Intern (Jul 2021, 2 mo): Proposed a UX improvement for public parking payment kiosks based on field observation across 5 sites, earning the Outstanding Intern Award.

SIDE PROJECTS
- Published a paper at the Korean HCI Society on how authenticity and autonomy shape user trust in AI assistants that hallucinate at work - ran the full research process from hypothesis to publication.
- Took a quote-recommendation app ("Myeongun Jegwajeom") from concept to launch: research, flow design, a design system, and QA/usability testing.

EDUCATION
Konkuk University, B.A. in Communication Design (2016-2023), GPA 3.75/4.5.

SKILLS
UX/UI, UX research, service planning, Figma, FigmaMake, XD, Sketch, Adobe CC, Notion, Confluence, Jira, Slack, and AI tools (Claude, Gemini, Midjourney, Kling).

CONTACT
Email: zjavbxjlove@naver.com. A downloadable resume PDF and full case studies are on this site.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { message, history } = req.body ?? {};

  if (typeof message !== "string" || !message.trim()) {
    res.status(400).json({ error: "Missing 'message' in request body" });
    return;
  }

  const safeHistory = Array.isArray(history)
    ? history.filter(
        (turn) =>
          turn &&
          (turn.role === "user" || turn.role === "assistant") &&
          typeof turn.content === "string",
      )
    : [];

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [...safeHistory, { role: "user", content: message }],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    res.status(200).json({ reply: textBlock?.text ?? "" });
  } catch (error) {
    console.error("Chat API error:", error);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
