---
layout: maintainer.njk
tags: maintainer
permalink: /maintainers/priyanshujain/
username: "priyanshujain"
full_name: "Priyanshu Jain"
photo: "/images/priyanshujain_photo.jpeg"
designation: "Principal Engineer @ OkCredit"
created_on: "2026-06-19T12:22:10.834011+05:30"
socials:
  - label: "GitHub"
    link: "https://github.com/priyanshujain"
  - label: "Codeberg"
    link: "https://codeberg.org/pjay"
  - label: "Web"
    link: "https://pjay.in/"
  - label: "LinkedIn"
    link: "https://www.linkedin.com/in/ipriyanshujain/"
projects:
  - name: "Sanderling"
    project_link: "https://github.com/priyanshujain/sanderling"
    website_link: "https://priyanshujain.github.io/sanderling/"
    logo: "/images/priyanshujain_sanderling.jpeg"
    short_description: "Property testing for mobile, autonomously exploring and validating correctness properties"
    description: |-
      sanderling tests mobile and web apps by exploring them on its own and checking rules defined in a spec. You describe what must always be true about your app. sanderling drives the app for minutes or hours, performing thousands of taps, swipes, and text inputs, and records every moment a rule breaks.
---

## How to support

- Contribute by trying it out on different apps -> find and report bugs
- Share it with mobile devs 
- Ask questions by raising an issue
- Raise a PR for the bug you find

## A small brief about your project

Sanderling is an open source autonomous property-based testing framework for mobile and web apps. You write rules that must always hold about your app, and sanderling explores it on its own for minutes or hours, performing thousands of taps, swipes, and inputs while recording every step where a rule breaks. One TypeScript spec runs against Android, iOS, and web builds of the same app, powered by a cross-platform driver engine built from scratch. Every run produces a replayable trace of actions, screenshots, and property timelines.

## One FOSS maintainer lesson for your younger self

Take versioning seriously so users feel confident relying on software that just works. Ship the alpha before it feels ready, and v1.0 means it will not break.

## Why do you do it? Why do you bother maintaining a FOSS project?

I want to live in the world of bug-free software. It's possible if we can prove the correctness of software. That’s why I am building Sanderling so we have infrastructure to prove our apps are correct. You don't build testing frameworks in silos. It's better when people build them together.

## If your repo had a theme song, what would it be?

One Foot In Front Of The Other by Bone Symphony

## Which file in your project would you most like to set on fire?

https://github.com/priyanshujain/sanderling/blob/master/pkg/spec/src/pcg.ts

## What's your open-source villain origin story?

Number of things we ship is skyrocketing due to AI, and bugs too. Unit tests don't test user behaviors, and integration tests break all the time.

We have cheap compute now, and we gotta have a system to find those sneaky bugs introduced due to this pace. Something that runs for hours and tells me your app has a race condition if a user clicks a button twice.

## If you had to use one emoji to convey what it is like to be a FOSS maintainer, what would it be?

🌊
