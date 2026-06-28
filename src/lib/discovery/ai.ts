import type { ChatCompletionContentPart } from "openai/resources/chat/completions";
import { getOpenAIClient } from "@/lib/openai/client";

export async function generateJsonFromAI<T>(
  systemPrompt: string,
  userContent: string,
  options?: { model?: string }
): Promise<T> {
  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: options?.model ?? "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI");
  }
  return JSON.parse(content) as T;
}

export async function generateJsonFromVision<T>(
  systemPrompt: string,
  textPrompt: string,
  imageUrls: string[]
): Promise<T> {
  const content: ChatCompletionContentPart[] = [
    { type: "text", text: textPrompt },
    ...imageUrls.map(
      (url): ChatCompletionContentPart => ({
        type: "image_url",
        image_url: { url },
      })
    ),
  ];

  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content },
    ],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const responseContent = completion.choices[0]?.message?.content;
  if (!responseContent) {
    throw new Error("No response from AI");
  }
  return JSON.parse(responseContent) as T;
}
