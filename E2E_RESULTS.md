# E2E results

Run: Thu Oct 29 2026 18:41:24 GMT-0400 (Eastern Daylight Time)
Base: http://127.0.0.1:8787

- PASS submit -> 202 {"ok":true,"requestId":"ee0a0a59-a8df-435a-9a45-ea291d4215ad","status":"pending_verification"}
- PASS 2 photos rejected -> 400
- PASS out-of-county ZIP 27601 rejected with friendly message -> 400
- PASS verification email rendered in mock outbox
- PASS verify -> exactly 10 contractors selected
- PASS 10 contractor lead emails rendered
- PASS leads go to SAMPLE @example.com contractors, reply-to homeowner
- PASS photo link serves image -> 200
- PASS photo link with bad token is 404
- PASS homeowner confirmation rendered
- PASS second verify click does not resend
- PASS 4th submission from same email rate-limited -> 429

## Top 10 selected (Septic & Plumbing, ZIP 27542 Kenly, Johnston County)

| # | Business | Rating | Reviews | Miles | Score |
|---|---|---|---|---|---|
| 1 | SAMPLE: Kenly Septic & Plumbing | 4.75 | 200 | 0 | 0.942 |
| 2 | SAMPLE: Princeton Septic & Plumbing | 4.8 | 300 | 9.1 | 0.9062 |
| 3 | SAMPLE: Wilson Septic & Plumbing | 4.7 | 120 | 14.6 | 0.8312 |
| 4 | SAMPLE: Micro Septic & Plumbing | 4.45 | 45 | 5 | 0.8302 |
| 5 | SAMPLE: Goldsboro Septic & Plumbing | 4.6 | 90 | 16.3 | 0.8012 |
| 6 | SAMPLE: Garner / Cleveland Septic & Plumbing | 4.8 | 160 | 23.9 | 0.7952 |
| 7 | SAMPLE: Four Oaks Septic & Plumbing | 4.65 | 110 | 19.9 | 0.7919 |
| 8 | SAMPLE: Selma Septic & Plumbing | 3.9 | 140 | 9.9 | 0.7907 |
| 9 | SAMPLE: Willow Spring Septic & Plumbing | 4.9 | 240 | 30.9 | 0.7772 |
| 10 | SAMPLE: Pikeville Septic & Plumbing | 4.2 | 22 | 10.5 | 0.7514 |

## Sample rendered lead email (text)

```
Subject: New Septic & Plumbing quote request near 27542
To: sample.septic_plumbing.20@example.com
Reply-To: e2e+1793313683337@example.com

New Septic & Plumbing request near 27542 (~10.5 mi)

Name: E2E Homeowner
Email: e2e+1793313683337@example.com
Phone: (919) 555-0199
ZIP: 27542

Septic alarm is going off and the yard is soggy near the tank.

Photos:
http://127.0.0.1:8787/photos/ee0a0a59-a8df-435a-9a45-ea291d4215ad/1?t=vKBhq7eop-MoUG9K6bJoESOfKl9ubPK9xkpZRnub0fM
http://127.0.0.1:8787/photos/ee0a0a59-a8df-435a-9a45-ea291d4215ad/2?t=vKBhq7eop-MoUG9K6bJoESOfKl9ubPK9xkpZRnub0fM
http://127.0.0.1:8787/photos/ee0a0a59-a8df-435a-9a45-ea291d4215ad/3?t=vKBhq7eop-MoUG9K6bJoESOfKl9ubPK9xkpZRnub0fM

Please contact the homeowner directly.
```
