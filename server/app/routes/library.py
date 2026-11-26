"""Health Information Library routes with category filtering and keyword search."""

from typing import Optional

from fastapi import APIRouter, HTTPException, Query, status

from app.services.library_data import CATEGORIES, get_article_by_id, list_articles

router = APIRouter(prefix="/api/library", tags=["Health Information Library"])


@router.get("/categories")
def get_categories():
    return {"categories": CATEGORIES}


@router.get("/articles")
def get_articles(
    category: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
):
    articles = list_articles(category=category, query=q)
    return {"categories": CATEGORIES, "total": len(articles), "articles": articles}


@router.get("/articles/{article_id}")
def get_article(article_id: str):
    article = get_article_by_id(article_id)
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found.")
    return article
