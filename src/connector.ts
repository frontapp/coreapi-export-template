import needle, { NeedleResponse } from 'needle'
import 'dotenv/config'

export class FrontConnector {
    static readonly headers = {
        Authorization: `Bearer ${process.env.API_KEY}`
    };
    // Aggregates API resources from a resource url and any subsequent _pagination.next urls
    public static async makePaginatedAPIRequest<T>(url : string, resources : T[] = []) : Promise<T[]> {
        let response = await this.makeRateLimitedRequest('get', url);
        
        // We expect _results to be an array of API resources that match the type specified
        // Caution: Runtime typecasting
        for (const item of response.body._results as T[]) {
            resources.push(item);
        }

        // If the response has a next URL, call it
        // This URL will include the query string of the base call
        if (response.body._pagination?.next) {
            return await this.makePaginatedAPIRequest(response.body._pagination.next, resources);
        } else {
            return resources;
        }
    }

    public static async getAttachmentFromURL(url: string):  Promise<Buffer> {
        let response = await this.makeRateLimitedRequest('get', url);

        return response.body;
    }

    private static async makeRateLimitedRequest(method: string, url: string): Promise<NeedleResponse> {
        const options = { headers: this.headers };
        console.log(`Request: ${url}`);
        let response: NeedleResponse;
        do {
            response = await needle('get', url, null, options);
            await this.handleRateLimiting(response);
        } while (response.statusCode === 429);

        return response;
    }
    
    // Please see https://dev.frontapp.com/docs/rate-limiting for additional rate-limiting details
    private static async handleRateLimiting(res : NeedleResponse): Promise<any> {     
        const requestsRemaining = this.parseHeaderInt(res, 'x-ratelimit-remaining');
        const retryAfterMillis = 1000 * this.parseHeaderInt(res, 'retry-after');

        // If there's no 'retry-after', return early
        if (!retryAfterMillis) {
            return;
        }

        // If there are requests remaining, but we saw a 429 status, then we hit a burst limit:
        // https://dev.frontapp.com/docs/rate-limiting#additional-burst-rate-limiting
        if (requestsRemaining > 0) {
            const burstLimitTier = this.parseHeaderInt(res, 'x-front-tier');
            console.log(`Tier ${burstLimitTier} resource burst limit reached`);
        }
        // Otherwise, if remaining is 0, we simply ran out of global requests.
        else {
            const globalLimit = this.parseHeaderInt(res, 'x-ratelimit-limit');
            console.log(`Global rate limit of ${globalLimit} reached`);
        }
        // Either way, wait for retry-after
        return new Promise(resolve => {
            setTimeout(resolve, retryAfterMillis);
        });
    }

    private static parseHeaderInt(res : NeedleResponse, key : string) {
        const value = res.headers[key] as string;
        return parseInt(value);
    }
}
