import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { Readability } from "npm:@mozilla/readability"
import { JSDOM } from "npm:jsdom"

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }

  const { url } = await req.json()
  if (!url || typeof url !== "string") {
    return new Response(JSON.stringify({ error: "url is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    new URL(url)
  } catch {
    return new Response(JSON.stringify({ error: "invalid url" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    },
  })

  if (!response.ok) {
    return new Response(JSON.stringify({ error: `fetch failed: ${response.status}` }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    })
  }

  const html = await response.text()
  const dom = new JSDOM(html, { url })
  const doc = dom.window.document

  const ogTitle = doc.querySelector("meta[property='og:title']")?.getAttribute("content")
  const ogImage = doc.querySelector("meta[property='og:image']")?.getAttribute("content")
  const ogSite = doc.querySelector("meta[property='og:site_name']")?.getAttribute("content")
  const ogDesc = doc.querySelector("meta[property='og:description']")?.getAttribute("content")
  const metaDesc = doc.querySelector("meta[name='description']")?.getAttribute("content")
  const metaKeywords = doc.querySelector("meta[name='keywords']")?.getAttribute("content")

  const title = ogTitle || doc.title || ""
  const description = ogDesc || metaDesc || ""
  const siteName = ogSite || new URL(url).hostname.replace("www.", "")
  const coverImage = ogImage || ""
  const tldr = description.length > 500 ? description.slice(0, 500) + "…" : description

  const domain = new URL(url).hostname.replace("www.", "")
  const tags = metaKeywords
    ? metaKeywords.split(",").map((k: string) => k.trim()).filter(Boolean).slice(0, 5)
    : []
  if (!tags.includes("article")) tags.unshift("article")
  if (!tags.includes(domain)) tags.push(domain)

  const reader = new Readability(doc)
  const article = reader.parse()

  if (!article) {
    return new Response(JSON.stringify({
      title,
      cover_image: coverImage,
      domain,
      site_name: siteName,
      tldr,
      tags: ["article", domain],
      content: "",
      text_content: "",
      excerpt: description,
    }), {
      headers: { "Content-Type": "application/json" },
    })
  }

  let textContent = article.textContent.trim()
  if (textContent.length > 10000) {
    textContent = textContent.slice(0, 10000) + "\n\n…"
  }

  return new Response(JSON.stringify({
    title,
    cover_image: coverImage,
    content: article.content,
    text_content: textContent,
    excerpt: article.excerpt,
    domain,
    site_name: siteName,
    tldr,
    tags,
  }), {
    headers: { "Content-Type": "application/json" },
  })
})
