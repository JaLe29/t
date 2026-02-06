// Types for payload service
export interface ApiResponse {
	url: string;
	status: number;
	data: unknown;
	method?: string;
}
