export async function generateStructuredItems(prompt: string, count: number) {
  // TODO: OpenAI/LangChain 연동 지점
  return Array.from({ length: count }).map((_, i) => ({
    id: i + 1,
    title: `Generated item ${i + 1}`,
    summary: `Prompt: ${prompt}`,
    createdAt: new Date().toISOString()
  }));
}
