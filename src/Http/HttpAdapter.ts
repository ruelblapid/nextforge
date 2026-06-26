import type { HttpRequest } from './HttpRequest';
import type { HttpResponse } from './HttpResponse';

export interface HttpAdapter {
	parseRequest(nativeReq: any, ...args: any[]): Promise<HttpRequest>;

	// Translates your CoreHttpResponse back into the framework's native response format
	sendResponse(nativeRes: any, response: HttpResponse): Promise<any>;
	sendNextResponse(nativeRes: any, response: HttpResponse): Promise<any>;
	sendNextResponseRedirect(url: URL): Promise<any>;
}
