export interface IPaginationOptions {
  page: number;
  limit: number;
  sort?: { [key: string]: number } | string;
}
