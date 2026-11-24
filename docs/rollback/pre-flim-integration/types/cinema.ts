export interface Movie {
  id: string;
  title: string;
  genre: string;
  releaseYear: number;
  runtime: string;
  synopsis: string;
  poster: string;
  backdrop: string;
  accentColor: string;
  featured: boolean;
  format: "Film" | "Series";
  availability: "Fictional catalog · demo";
}

export interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  priceLabel: string;
}

// Integration contracts: implementations belong to the future service layer.
export interface CatalogProvider {
  listMovies(): Promise<Movie[]>;
}
export interface MembershipProvider {
  listPlans(): Promise<MembershipPlan[]>;
}
export interface SessionProvider {
  signIn(): Promise<{ redirectUrl: string }>;
}
export interface PlaybackProvider {
  getAuthorizedSource(movieId: string): Promise<{
    manifestUrl: string;
    expiresAt: string;
    captions: { language: string; label: string; url: string }[];
  }>;
}
