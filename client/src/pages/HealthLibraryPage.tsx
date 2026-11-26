import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BookOpen, ExternalLink, Loader2, Search, ShieldCheck, X } from "lucide-react";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import type { LibraryArticle } from "@/types/api";
import { cn } from "@/utils/cn";

export function HealthLibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All"
  );
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [articles, setArticles] = useState<LibraryArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<LibraryArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .getLibraryArticles({ category: selectedCategory, q: query })
      .then((res) => {
        setCategories(res.categories);
        setArticles(res.articles);
      })
      .finally(() => setLoading(false));
  }, [selectedCategory, query]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    const next = new URLSearchParams(searchParams);
    if (cat === "All") next.delete("category");
    else next.set("category", cat);
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-0 lg:py-2">
      <div>
        <Badge variant="cyan">Evidence-Based Education</Badge>
        <h1 className="mt-2 font-display text-2xl font-bold text-slate-900 sm:text-3xl">
          Health Information Library
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Explore curated educational guides linked directly to MedlinePlus (NIH), World Health
          Organization (WHO), and CDC.
        </p>
      </div>

      {/* Search & Category Filters */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search health topics, lab tests, nutrition, mental wellness..."
              className="pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {["All", ...categories].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all",
                  selectedCategory === cat
                    ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Articles Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-blue-600" />
          Loading educational articles...
        </div>
      ) : articles.length === 0 ? (
        <Card className="p-10 text-center text-sm text-slate-500">
          No articles matched your search. Try clearing the search box or switching categories.
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Card key={article.id} className="flex flex-col justify-between hover:shadow-card-hover">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="default">{article.category}</Badge>
                  <span className="text-xs text-slate-400">{article.reading_time}</span>
                </div>
                <CardTitle className="pt-2 text-lg">{article.title}</CardTitle>
                <CardDescription className="leading-relaxed">{article.summary}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {article.sources.map((src) => (
                    <Badge key={src.url} variant="neutral" className="text-[11px]">
                      {src.organization}
                    </Badge>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSelectedArticle(article)}
                >
                  <BookOpen className="h-4 w-4" />
                  Read Article
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge variant="default">{selectedArticle.category}</Badge>
                <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">
                  {selectedArticle.title}
                </h2>
                <p className="mt-1 text-xs text-slate-500">{selectedArticle.reading_time}</p>
              </div>
              <button
                type="button"
                aria-label="Close article"
                onClick={() => setSelectedArticle(null)}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-slate-700">{selectedArticle.summary}</p>

            <div className="mt-5 rounded-2xl bg-blue-50/70 p-4">
              <p className="text-sm font-semibold text-blue-950">Key Takeaways</p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-blue-900">
                {selectedArticle.key_points.map((kp) => (
                  <li key={kp}>{kp}</li>
                ))}
              </ul>
            </div>

            <div className="mt-6 space-y-4">
              {selectedArticle.sections.map((sec) => (
                <div key={sec.heading}>
                  <h3 className="font-display text-base font-bold text-slate-900">
                    {sec.heading}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{sec.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
              <p className="font-semibold">When to Seek Medical Care</p>
              <p className="mt-1 leading-relaxed">{selectedArticle.when_to_seek_care}</p>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                Trusted Reference Sources
              </p>
              <div className="mt-2.5 flex flex-col gap-2">
                {selectedArticle.sources.map((src) => (
                  <a
                    key={src.url}
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-between rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50"
                  >
                    <span>{src.name}</span>
                    <ExternalLink className="h-4 w-4 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <DisclaimerBanner />
    </div>
  );
}
