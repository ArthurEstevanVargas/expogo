export type ArticleSource = {
  id?: string;
  title?: string;
  description?: string;
  url?: string;
};

export type ArticleAuthor = {
  id: string;
  name: string;
  institution?: string;
  bio?: string;
};

export type Article = {
  id: string;
  title: string;
  summary: string;
  content: string;
  categoryId: string;
  slug?: string;
  authorId?: string;
  author?: ArticleAuthor;
  sources?: ArticleSource[];
  createdAt?: string;
  updatedAt?: string;
};

export type ListArticlesParams = {
  page?: number;
  pageSize?: number;
  q?: string;
  search?: string;
  categoryId?: string;
};
