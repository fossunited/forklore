---
layout: maintainer.njk
tags: maintainer
permalink: /maintainers/ntkathole/
username: "ntkathole"
full_name: "Nikhil Kathole"
photo: "/images/ntkathole_photo.jpg"
designation: "Principal Software Engineer @ Red Hat"
created_on: "2026-05-13T11:16:14.003876+05:30"
socials:
  - label: "GitHub"
    link: "https://github.com/ntkathole/"
  - label: "Web"
    link: "https://nikhilkathole.wordpress.com/"
projects:
  - name: "Feast"
    project_link: "https://github.com/feast-dev/feast"
    website_link: "https://feast.dev/"
    logo: "/images/ntkathole_feast.svg"
    short_description: "Feast is an open source feature store that delivers structured data to AI and LLM applications at high scale during training and inference."
    description: |-
      Feast helps teams operate production ML systems at scale by allowing them to define, manage, validate, and serve features for production AI/ML. Feast's feature store is composed of two foundational components: (1) an offline store for historical feature extraction used in model training and (2) an online store for serving features at low-latency in production systems and applications.  It is a configurable operational data system that re-uses existing infrastructure to manage and serve machine learning features to real-time models.
---

## How to support

- Contribute features, bug fixes, or performance improvements and bench-marking (especially around offline/online store integrations, scalability, and infra).
- Improve documentation.
- Share feedback from production deployments.
- Help review PRs (this is very valuable).

## A small brief about your project

Feast is an open-source feature store that sits at the center of modern ML systems. It standardizes how features are defined, stored, and served - bridging offline training and online inference. It enables teams to reuse features, ensure consistency between training and serving, and scale ML systems using existing data infrastructure.

## One FOSS maintainer lesson for your younger self

**Design for contributors, not just users.** Clean abstractions and good docs matter more than clever code if you want a project to grow.

## Why do you do it? Why do you bother maintaining a FOSS project?

Because ML infrastructure shouldn’t be reinvented in every company.
Feast solves a real, recurring problem and building it in the open means better ideas, broader adoption, and real impact across teams and industries.

## If your repo had a theme song, what would it be?

Harder, Better, Faster, Stronger
(It’s basically what every feature pipeline is trying to become.)

## Which file in your project would you most like to set on fire?

`secrets.baseline` - always cause conflicts

## What's your open-source villain origin story?

Started by fixing a small bug… At some point, you stop fixing bugs and start redesigning the system.

## If you had to use one emoji to convey what it is like to be a FOSS maintainer, what would it be?

🧩 (You’re constantly fitting together pieces from users, infra, and ideas - while new pieces keep showing up.)
