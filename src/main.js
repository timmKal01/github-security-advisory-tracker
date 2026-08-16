import { Actor, log } from 'apify';
import { fetchAdvisories } from './github.js';

await Actor.init();

const input = (await Actor.getInput()) ?? {};
const { ecosystem = 'all', packageName, severity = 'all', daysBack = 30, maxResults = 25 } = input;

/** Must match the event name configured in this Actor's pay-per-event pricing on Apify. */
const ADVISORY_SEARCH_EVENT = 'advisory-search';

const endDate = new Date();
const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

const advisories = await fetchAdvisories({
    ecosystem,
    packageName,
    severity,
    startDate,
    endDate,
    maxResults: Math.min(maxResults, 100),
});

for (const advisory of advisories) {
    await Actor.pushData(advisory);
}

await Actor.charge({ eventName: ADVISORY_SEARCH_EVENT });

log.info(`Pushed ${advisories.length} advisory(s)`);

await Actor.exit();
