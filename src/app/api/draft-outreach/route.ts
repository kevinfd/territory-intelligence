import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

const RequestSchema = z.object({
  company: z.object({
    name: z.string(),
    industry: z.string(),
    city: z.string(),
    state: z.string(),
    employeeCount: z.number(),
    revenueRange: z.string(),
    productAngle: z.string().optional(),
    growthSignal: z.string().optional(),
    priorityReason: z.string(),
    suggestedAction: z.string(),
  }),
  contact: z.object({
    name: z.string(),
    role: z.string(),
    email: z.string(),
  }),
  banker: z.object({
    name: z.string().default("Alex Chen"),
    bank: z.string().default("Pacific Commercial Bank"),
  }),
});

const DraftSchema = z.object({
  subject: z.string(),
  body: z.string(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = RequestSchema.safeParse(json);
    if (!parsed.success) {
      return Response.json(
        { error: "invalid_request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { company, contact, banker } = parsed.data;
    const client = new Anthropic();

    const response = await client.messages.parse({
      model: "claude-opus-4-7",
      max_tokens: 1200,
      system:
        "You are a senior commercial banker drafting a short, warm, credible outreach email to a prospective client. Your emails are concise (120-170 words), never salesy, and reference specific facts about the company to show you've done homework. You propose a brief exploratory conversation, never a hard sell. Sign off with the banker's name and bank. Do not invent phone numbers or URLs. Do not use exclamation marks.",
      messages: [
        {
          role: "user",
          content: `Draft an outreach email.

Recipient:
- ${contact.name}, ${contact.role}
- ${company.name} (${company.industry}, ${company.city}, ${company.state})
- ~${company.employeeCount} employees, revenue ${company.revenueRange}

Relevant context about the company:
- Why they are a priority: ${company.priorityReason}
- Recommended next action: ${company.suggestedAction}${company.growthSignal ? `\n- Recent signal: ${company.growthSignal}` : ""}${company.productAngle ? `\n- Product angle: ${company.productAngle}` : ""}

Sender: ${banker.name}, ${banker.bank}

Write the subject and body. The body should address the recipient by first name, weave in one or two concrete references to the company context above, propose a 20-minute call, and close with the banker's name and bank.`,
        },
      ],
      output_config: {
        format: zodOutputFormat(DraftSchema),
      },
    });

    if (!response.parsed_output) {
      return Response.json(
        { error: "model_refusal", stop_reason: response.stop_reason },
        { status: 502 },
      );
    }

    return Response.json(response.parsed_output);
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return Response.json(
        { error: "auth_error", message: "ANTHROPIC_API_KEY missing or invalid" },
        { status: 500 },
      );
    }
    if (error instanceof Anthropic.APIError) {
      return Response.json(
        { error: "api_error", status: error.status, message: error.message },
        { status: 502 },
      );
    }
    const message = error instanceof Error ? error.message : String(error);
    return Response.json({ error: "unexpected", message }, { status: 500 });
  }
}
