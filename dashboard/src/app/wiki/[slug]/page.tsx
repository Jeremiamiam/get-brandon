import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getWiki(slug: string) {
  const { data: client } = await supabase
    .from("dashboard_clients")
    .select("name, slug")
    .eq("slug", slug)
    .single();

  if (!client) return null;

  const { data: wiki } = await supabase
    .from("dashboard_wikis")
    .select("html_content")
    .eq("client_slug", slug)
    .single();

  return { client, html: wiki?.html_content ?? null };
}

export default async function WikiPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getWiki(slug);

  if (!data || !data.html) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border)] px-6 py-4 shrink-0">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link
            href="/"
            className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm"
          >
            ← Dashboard
          </Link>
          <span className="text-zinc-600">/</span>
          <h1 className="font-semibold text-white">{data.client.name}</h1>
        </div>
      </header>

      <main className="flex-1 min-h-0">
        <iframe
          srcDoc={data.html}
          title={`Wiki ${data.client.name}`}
          className="w-full h-[calc(100vh-65px)] border-0 bg-white"
          sandbox="allow-same-origin"
        />
      </main>
    </div>
  );
}
