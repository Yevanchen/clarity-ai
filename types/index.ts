export enum OpenAIModel {
  DAVINCI_TURBO = "gpt-4-turbo"
}

export type Source = {
  url: string;
  text: string;
};

export type SearchQuery = {
  query: string;
  sourceLinks: string[];
};

export type Titles = { [key: string]: string };