export interface User {
  username: string;
  email: string;
  password: string;
  profilePicureUrl?: string;
  bio?: string;
}

export interface NewArticle {
  title: string;
  description: string;
  content: string;
  tags?: string[];
}