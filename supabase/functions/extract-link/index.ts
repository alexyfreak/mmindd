import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { Readability } from "npm:@mozilla/readability"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

function extractMeta(html: string, name: string): string {
  const patterns = [
    new RegExp(`<meta\\s+[^>]*property=["']og:${name}["'][^>]*content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta\\s+[^>]*content=["']([^"']*)["'][^>]*property=["']og:${name}["']`, "i"),
    new RegExp(`<meta\\s+[^>]*name=["']${name}["'][^>]*content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta\\s+[^>]*content=["']([^"']*)["'][^>]*name=["']${name}["']`, "i"),
  ]
  for (const p of patterns) {
    const m = html.match(p)
    if (m) return m[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
  }
  return ""
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders })
  }

  const { url } = await req.json()
  if (!url || typeof url !== "string") {
    return new Response(JSON.stringify({ error: "url is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  try {
    new URL(url)
  } catch {
    return new Response(JSON.stringify({ error: "invalid url" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  const resp = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
  })

  if (!resp.ok) {
    return new Response(JSON.stringify({ error: `fetch failed: ${resp.status}` }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  const html = await resp.text()
  const title = (html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? "").trim() || extractMeta(html, "title")
  const coverImage = extractMeta(html, "image")
  const description = extractMeta(html, "description")
  const metaKeywords = extractMeta(html, "keywords")
  const siteName = extractMeta(html, "site_name") || new URL(url).hostname.replace("www.", "")
  const domain = new URL(url).hostname.replace("www.", "")
  const tldr = description.length > 500 ? description.slice(0, 500) + "…" : description

  const tagList: string[] = metaKeywords
    ? metaKeywords.split(",").map((k: string) => k.trim()).filter(Boolean).slice(0, 5)
    : []
  if (!tagList.includes("article")) tagList.unshift("article")
  if (!tagList.includes(domain)) tagList.push(domain)

  let textContent = description
  let articleContent = ""

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")
    const reader = new Readability(doc)
    const article = reader.parse()
    if (article) {
      articleContent = article.content
      textContent = article.textContent.trim()
      if (textContent.length > 10000) {
        textContent = textContent.slice(0, 10000) + "\n\n…"
      }
    }
  } catch {
    textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 10000)
  }

  return new Response(JSON.stringify({
    title,
    cover_image: coverImage,
    content: articleContent,
    text_content: textContent,
    excerpt: description,
    domain,
    site_name: siteName,
    tldr,
    tags: tagList,
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
})
