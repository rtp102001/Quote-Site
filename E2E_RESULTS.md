# E2E results

Run: Thu Oct 29 2026 17:27:14 GMT-0400 (Eastern Daylight Time)
Base: http://127.0.0.1:8787

- PASS submit -> 202 {"ok":true,"requestId":"063a5ef3-1c89-4138-8bdf-6d9d3de3644c","status":"pending_verification"}
- PASS 2 photos rejected -> 400
- PASS verification email rendered in mock outbox
- PASS verify -> exactly 10 contractors selected
- PASS 10 contractor lead emails rendered
- PASS leads go to SAMPLE @example.com contractors, reply-to homeowner
- PASS photo link serves image -> 200
- PASS photo link with bad token is 404
- PASS homeowner confirmation rendered
- PASS second verify click does not resend
- PASS 4th submission from same email rate-limited -> 429

## Top 10 selected (Septic & Plumbing, ZIP 27542 Kenly)

| # | Business | Rating | Reviews | Miles | Score |
|---|---|---|---|---|---|
| 1 | SAMPLE: Kenly Septic & Plumbing | 4.9 | 240 | 0 | 0.9629 |
| 2 | SAMPLE: Micro Septic & Plumbing | 4.85 | 180 | 5 | 0.9279 |
| 3 | SAMPLE: Selma Septic & Plumbing | 4.8 | 160 | 9.9 | 0.8993 |
| 4 | SAMPLE: Smithfield Septic & Plumbing | 4.7 | 120 | 13.5 | 0.865 |
| 5 | SAMPLE: Lucama Septic & Plumbing | 4.55 | 70 | 7.3 | 0.856 |
| 6 | SAMPLE: Wilson Septic & Plumbing | 4.6 | 90 | 14 | 0.843 |
| 7 | SAMPLE: Raleigh Septic & Plumbing | 4.75 | 200 | 31.5 | 0.816 |
| 8 | SAMPLE: Bailey Septic & Plumbing | 4.4 | 50 | 12.8 | 0.8087 |
| 9 | SAMPLE: Princeton Septic & Plumbing | 4.2 | 22 | 9.1 | 0.7781 |
| 10 | SAMPLE: Goldsboro Septic & Plumbing | 4.3 | 35 | 16.5 | 0.7726 |

## Sample rendered lead email (text)

```
Subject: New Septic & Plumbing quote request near 27542
To: sample.septic_plumbing.08@example.com
Reply-To: e2e+1793309233905@example.com

New Septic & Plumbing request near 27542 (~16.5 mi)

Name: E2E Homeowner
Email: e2e+1793309233905@example.com
Phone: (919) 555-0199
ZIP: 27542

Septic alarm is going off and the yard is soggy near the tank.

Photos:
http://127.0.0.1:8787/photos/063a5ef3-1c89-4138-8bdf-6d9d3de3644c/1?t=fv-qo5U8unUv7uWDuSBDRB6O4wyr7ilhPEek7EIdo8M
http://127.0.0.1:8787/photos/063a5ef3-1c89-4138-8bdf-6d9d3de3644c/2?t=fv-qo5U8unUv7uWDuSBDRB6O4wyr7ilhPEek7EIdo8M
http://127.0.0.1:8787/photos/063a5ef3-1c89-4138-8bdf-6d9d3de3644c/3?t=fv-qo5U8unUv7uWDuSBDRB6O4wyr7ilhPEek7EIdo8M

Please contact the homeowner directly.
```
