# GitHub Security Advisory Tracker — New GHSA Advisories

Track new GitHub Security Advisories (GHSA) by package ecosystem,
package name, or severity. Get affected version ranges, patched
versions, CVSS score, and CWE for open-source dependency
vulnerabilities.

Built for engineering and security teams watching for new
vulnerabilities in the packages they depend on — GHSA advisories are
ecosystem-curated (npm, pip, Maven, etc.) and often publish faster than
the general NVD feed, with the affected/patched version ranges already
structured.

## Input

```json
{
  "ecosystem": "npm",
  "packageName": "lodash",
  "severity": "all",
  "daysBack": 30,
  "maxResults": 25
}
```

| Field | Type | Description |
|---|---|---|
| `ecosystem` | string | `"all"` or one of `npm`, `pip`, `maven`, `nuget`, `composer`, `rubygems`, `go`, `rust`, `actions`, `pub`, `swift`, `erlang`. Default `"all"`. |
| `packageName` | string (optional) | Limit to advisories affecting this specific package. |
| `severity` | string | `"all"`, `"low"`, `"medium"`, `"high"`, or `"critical"` — exact match, not a threshold. Default `"all"`. |
| `daysBack` | number | How many days back from today to search, by publish date. Default `30`, max `365`. |
| `maxResults` | number | Max advisories to return, most recently published first. Default `25`, max `100`. |

## Output

One record per advisory:

```json
{
  "ghsaId": "GHSA-r5fr-rjxr-66jc",
  "cveId": "CVE-2026-XXXXX",
  "summary": "lodash vulnerable to Code Injection via `_.template` imports key names",
  "severity": "high",
  "cvssScore": 8.4,
  "cweIds": ["CWE-94"],
  "affectedPackages": [
    {
      "ecosystem": "npm",
      "name": "lodash",
      "vulnerableVersionRange": "< 4.17.21",
      "firstPatchedVersion": "4.17.21"
    }
  ],
  "publishedAt": "2026-08-07T18:48:59Z",
  "updatedAt": "2026-08-07T18:48:59Z",
  "htmlUrl": "https://github.com/advisories/GHSA-r5fr-rjxr-66jc"
}
```

`summary` is a one-line description; open `htmlUrl` for the full
write-up (PoC, remediation detail), which isn't included here since
advisory bodies can run to thousands of words.

A search with no matching advisories returns no items but is still
billed once for the search.

## How it works

Direct calls to the official [GitHub Security Advisories REST
API](https://docs.github.com/en/rest/security-advisories/global-advisories)
(`api.github.com/advisories`) — no proxy, no key, no scraping.

## Pricing note

Billed per **search**, not per advisory returned — one charge whether
the search returns 0 advisories or 100.

## Related products

- [NPM Package Update Tracker](https://github.com/timmKal01/npm-package-tracker) — new versions/deprecations for a package you depend on
- [Vulnerability Alert](https://github.com/timmKal01/vulnerability-alert) — the broader NVD/CVE database, not scoped to a package ecosystem
