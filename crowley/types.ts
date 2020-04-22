export interface Article {
    url: string;
    title: string | null;
    date: string | null;
    content: string;
    tags?: (string | null)[];
}

export interface Review {
    rating: number | null;
    text?: string;
    pros?: string;
    cons?: string;
}
