# Security

## Known Security Considerations

### XLSX Library (High Severity)

The project uses the `xlsx` library for Excel file parsing in the admin bulk upload feature. As of the latest check, this library has known vulnerabilities:

- **Prototype Pollution** (GHSA-4r6h-8v6p-xvw6)
- **Regular Expression Denial of Service (ReDoS)** (GHSA-5pgg-2g8v-p4x9)

**Status**: No fix currently available from the library maintainers.

**Mitigation**:
1. The bulk upload feature is **admin-only** and requires authentication
2. Excel files are processed on the client-side only
3. Input is validated before processing
4. The feature is only used by trusted administrators in a controlled environment

**Recommendations**:
- Only allow trusted administrators to access the bulk upload feature
- Monitor for updates to the `xlsx` library
- Consider alternative libraries if they become available with better security posture
- Validate and sanitize all Excel file inputs

### Development Security

All other security vulnerabilities have been addressed:
- ✅ Fixed React Router XSS vulnerability
- ✅ Fixed esbuild development server vulnerability (updated vite to v6)
- ✅ Fixed glob CLI command injection
- ✅ Fixed js-yaml prototype pollution

## Reporting Security Issues

If you discover a security vulnerability, please email the maintainers directly rather than opening a public issue.
