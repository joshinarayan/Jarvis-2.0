export interface SearchResult {
  title:   string
  url:     string
  content: string
}

export interface SearchResponse {
  answer:  string | null
  results: SearchResult[]
}

export async function webSearch(query: string): Promise<SearchResponse> {
  const res = await fetch('/api/search', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ query }),
  })

  if (!res.ok) throw new Error('Search failed')
  return res.json()
}

// Formats search results into a clean string for JARVIS context
export function formatSearchContext(data: SearchResponse): string {
  let context = '[WEB SEARCH RESULTS]\n'

  if (data.answer) {
    context += `Quick Answer: ${data.answer}\n\n`
  }

  data.results.forEach((r, i) => {
    context += `[${i + 1}] ${r.title}\n${r.content}\nSource: ${r.url}\n\n`
  })

  context += '[END OF SEARCH RESULTS]\n'
  context += 'Use the above results to answer the user. Cite sources when relevant.'

  return context
}