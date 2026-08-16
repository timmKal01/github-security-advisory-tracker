const BASE_URL = 'https://api.github.com/advisories';
const UA = 'GithubSecurityAdvisoryTracker/0.1 (+contact: ghsa-tracker-admin@example.com)';

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

    const res = await fetch(url, {
        headers: {
            'User-Agent': UA,
            Accept: 'application/vnd.github+json',
            Connection: 'close',
        },
    });
    if (!res.ok) {
        throw new Error(`GitHub Advisories API request failed: ${res.status} ${res.statusText}`);
    }
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
