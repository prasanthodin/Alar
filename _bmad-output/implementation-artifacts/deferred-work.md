# Deferred work

- source_spec: none
  summary: Story 1.2, shared contracts (packages/contracts) and the api-client seam (packages/api-client), with sign-up and sign-in on the website.
  evidence: Split from the 2026-11-27 build request (Stories 1.1 and 1.2 plus an early Expo app). Each is shippable on its own; 1.2 depends on the repository from 1.1, so 1.1 goes first.
- source_spec: none
  summary: Early Expo app shell (apps/mobile, per the repository shape) showing the approved Home, Listing and Product designs from mocked data through packages/api-client, with screenshots taken in the cloud.
  evidence: Founder asked on 2026-11-27 to see the mobile app running before a real phone is available. Not an Epic 1 story (the app is Epic 6, the Android proof is Story 1.28); it needs the contracts and api-client from 1.2, so it follows 1.2.
