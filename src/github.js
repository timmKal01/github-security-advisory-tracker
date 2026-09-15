const BASE_URL = 'https://api.github.com/advisories';
const UA = 'GithubSecurityAdvisoryTracker/0.1 (+contact: ghsa-tracker-admin@example.com)';

const TRANSIENT_STATUSES = new Set([429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 4;
const REQUEST_TIMEOUT_MS = 15_000;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options) {
    let lastError;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        let res;
        try {
            res = await fetch(url, { ...options, signal: controller.signal });
        } catch (err) {
            lastError = err.name === 'AbortError' ? new Error(`Request timed out after ${REQUEST_TIMEOUT_MS}ms: ${url}`) : err;
            if (attempt < MAX_ATTEMPTS) {
                await sleep(1000 * 2 ** (attempt - 1));
                continue;
            }
            throw lastError;
        } finally {
            clearTimeout(timeoutId);
        }
        if (res.ok) return res;
        if (!TRANSIENT_STATUSES.has(res.status)) {
            throw new Error(`GitHub Advisories API request failed: ${res.status} ${res.statusText}`);
        }
        lastError = new Error(`GitHub Advisories API request failed: ${res.status} ${res.statusText}`);
        if (attempt < MAX_ATTEMPTS) await sleep(1000 * 2 ** (attempt - 1));
    }
    throw lastError;
}

function toDateOnly(date) {
    return date.toISOString().slice(0, 10);
}

export async function fetchAdvisories({ ecosystem, packageName, severity, startDate, endDate, maxResults }) {
    const url = new URL(BASE_URL);
    if (ecosystem && ecosystem !== 'all') url.searchParams.set('ecosystem', ecosystem);
    if (packageName) url.searchParams.set('affects', packageName);
    if (severity && severity !== 'all') url.searchParams.set('severity', severity);
    url.searchParams.set('published', `${toDateOnly(startDate)}..${toDateOnly(endDate)}`);
    url.searchParams.set('sort', 'published');
    url.searchParams.set('direction', 'desc');
    url.searchParams.set('per_page', String(maxResults));

    const res = await fetchWithRetry(url, {
        headers: {
            'User-Agent': UA,
            Accept: 'application/vnd.github+json',
            Connection: 'close',
        },
    });
    const advisories = await res.json();

    return advisories.map((a) => ({
        ghsaId: a.ghsa_id,
        cveId: a.cve_id,
        summary: a.summary,
        severity: a.severity,
        cvssScore: a.cvss?.score ?? null,
        cweIds: (a.cwes ?? []).map((c) => c.cwe_id),
        affectedPackages: (a.vulnerabilities ?? []).map((v) => ({
            ecosystem: v.package?.ecosystem ?? null,
            name: v.package?.name ?? null,
            vulnerableVersionRange: v.vulnerable_version_range,
            firstPatchedVersion: v.first_patched_version ?? null,
        })),
        publishedAt: a.published_at,
        updatedAt: a.updated_at,
        htmlUrl: a.html_url,
    }));
}
