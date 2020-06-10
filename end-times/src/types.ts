export interface NewsResult {
    position: number;
    title: string;
    link: string;
    domain: string;
    source: string;
    date: string;
    snippet: string;
    thumbnail: string;
}

export interface SearchResult {
    request_info: {
        success: boolean;
        credits_used: number;
        credits_remaining: number;
    };
    search_metadata: {
        created_at: Date;
        processed_at: Date;
        total_time_taken: number;
        engine_url: string;
        html_url: string;
        json_url: string;
        timing: string[];
    };
    search_parameters: {
        q: string;
        google_domain: string;
        gl: 'ua';
        hl: 'uk';
        search_type: 'news';
        sort_by: 'date';
        time_period: 'last_month';
        page: number;
        num: number;
        output: 'json';
        engine: 'google';
    };
    search_information: {
        original_query_yields_zero_results: boolean;
        total_results: number;
        time_taken_displayed: number;
        query_displayed: string;
        detected_location: string;
    };
    pagination: {
        current: number;
        next: string;
        other_pages: { [key: string]: string };
        api_pagination: {
            next: string;
            other_pages: { [key: string]: string };
        };
    };
    news_results: NewsResult[];
}

export const processArticle = (title: string, snippet: string, url: string) => {
    console.log(title);
    console.log(snippet.split('.'));
    console.log(url);
};
