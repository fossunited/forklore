---
layout: maintainer.njk
tags: maintainer
permalink: /maintainers/xevrion/
username: "xevrion"
full_name: "Yash Bavadiya"
photo: "/images/xevrion_photo.png"
designation: "Computer science student at IIT Jodhpur, maintainer of HatchZip"
created_on: "2026-11-11T07:02:51.641145+00:00"
socials:
  - label: "GitHub"
    link: "https://github.com/xevrion"
  - label: "Web"
    link: "https://xevrion.dev"
  - label: "Twitter"
    link: "https://x.com/xevrion_the1"
projects:
  - name: "HatchZip"
    project_link: "https://github.com/xevrion/hatchzip"
    website_link: "https://hatchzip.dev"
    logo: "/images/xevrion_hatchzip.svg"
    short_description: "Extract huge archives without needing double the disk space"
    description: |-
      A free, open-source archive extractor for Windows, macOS and Linux that extracts in place: it frees the archive's space as the files come out, so a 100 GB archive needs about 100 GB free instead of 200 GB. It handles ZIP, 7z, RAR, tar, tar.gz and tar.xz, checks that the extraction fits before changing anything, verifies every file and resumes after a crash. A desktop app, a command line tool and a Rust library, translated into Hindi and Spanish, with more languages coming.
---

## How to support

Use HatchZip and report bugs, translate the app into your language, contribute code, or sponsor it: https://hatchzip.dev/sponsor.html (GitHub Sponsors and Buy Me a Coffee).

## A small brief about your project

Normal extractors need room for the archive and its contents at the same time. HatchZip frees the archive as it extracts, so people on nearly full laptops and drives can open archives they otherwise couldn't. In its first three weeks it reached 2,814 GitHub stars and about 24,700 downloads, with 9 code contributors and more sending translations and security reports.

## One FOSS maintainer lesson for your younger self

Write the crash test before the feature. When your tool deletes data as it goes, "it worked on my machine" is not a test.

## Why do you do it? Why do you bother maintaining a FOSS project?

Because I hit the problem myself, and a fix only really helps when anyone can get it for free and read exactly what it does to their files.

## If your repo had a theme song, what would it be?

"Under Pressure", for every disk it runs on.

## Which file in your project would you most like to set on fire?

crates/core/src/engine.rs, the heart of the crash-safe journal. I love it, and it has humbled me more than any other file.

## What's your open-source villain origin story?

A huge archive, a laptop that was almost full, and an extractor that wanted room for both. I wrote the one I wished existed.

## If you had to use one emoji to convey what it is like to be a FOSS maintainer, what would it be?

🐣
