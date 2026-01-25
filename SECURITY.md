# Security Policy

## Supported Versions

The following table outlines the versions of the Indian Chess Academy Platform currently receiving security updates and support.

| Version | Supported          | Notes                              |
| ------- | ------------------ | ---------------------------------- |
| 1.x.x   | :white_check_mark: | Current production release         |
| 0.x.x   | :x:                | Pre-release versions, unsupported  |

## Security Measures

This platform implements the following security measures:

- **Authentication:** Firebase Authentication with secure session management
- **Authorization:** Role-based access control (RBAC) for Parents, Coaches, and Administrators
- **Data Protection:** Firestore security rules enforcing data access restrictions
- **Transport Security:** HTTPS encryption for all data in transit
- **Input Validation:** Server-side and client-side validation on all user inputs
- **Dependency Management:** Regular updates to address known vulnerabilities in dependencies

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please follow the responsible disclosure process outlined below.

### How to Report

1. **Do not** disclose the vulnerability publicly until it has been addressed
2. Email your findings to the repository maintainer through GitHub
3. Alternatively, open a private security advisory through GitHub's Security tab

### What to Include

- Detailed description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Any suggested remediation (optional)

### Response Timeline

| Action                          | Timeframe        |
| ------------------------------- | ---------------- |
| Initial acknowledgment          | Within 48 hours  |
| Preliminary assessment          | Within 7 days    |
| Status update on remediation    | Within 14 days   |
| Security patch release          | Within 30 days   |

### What to Expect

- **Accepted vulnerabilities:** You will receive credit in the security advisory (if desired) and notification when the fix is deployed
- **Declined reports:** You will receive an explanation of why the report was not classified as a vulnerability

### Scope

The following are within scope for security reports:

- Authentication and authorization bypass
- Data exposure or leakage
- Cross-site scripting (XSS)
- Cross-site request forgery (CSRF)
- SQL/NoSQL injection
- Remote code execution
- Privilege escalation

The following are outside scope:

- Denial of service attacks
- Social engineering against team members
- Physical security concerns
- Issues in third-party dependencies (report to the respective maintainers)

## Security Best Practices for Contributors

- Never commit API keys, credentials, or secrets to the repository
- Use environment variables for all sensitive configuration
- Follow the principle of least privilege when implementing features
- Validate and sanitize all user inputs
- Keep dependencies updated to their latest secure versions

## Contact

For security-related inquiries, please use GitHub's private vulnerability reporting feature or contact the maintainers directly through the repository.
