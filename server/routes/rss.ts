import { Feed } from "feed";

export default defineEventHandler(async (event) => {
  const feed = new Feed({
    title: "Forklore Maintainers",
    description: "Maintainers and their community projects",
    id: "https://forklore.in/",
    link: "https://forklore.in/",
    language: "en",
    feedLinks: { rss: "https://forklore.in/rss" },
    author: { name: "Forklore", link: "https://forklore.in/" },
    copyright: `All rights reserved ${new Date().getFullYear()}, Forklore`,
  });

  const maintainers = await queryCollection(event, "maintainers").all();

  for (const data of maintainers) {
    const url = `https://forklore.in/maintainers/${data.username.toLowerCase()}`;

    const userInfoHTML = `
  <p><strong>${data.full_name}</strong> (@${data.username})</p>
  ${data.designation ? `<p><em>${data.designation}</em></p>` : ""}
`;

    const socialsHTML =
      (data.socials || [])
        .map((s: any) => `<li><a href="${s.link}" target="_blank">${s.label}</a></li>`)
        .join("") || "<li>No socials listed</li>";

    const projectsHTML =
      (data.projects || [])
        .map((p: any) => {
          const links = [];
          if (p.project_link) links.push(`<a href="${p.project_link}" target="_blank">Repo</a>`);
          if (p.website_link) links.push(`<a href="${p.website_link}" target="_blank">Website</a>`);
          const linkText = links.length > 0 ? ` (${links.join(" | ")})` : "";
          return `<li><strong>${p.name}</strong>${linkText}<br/>${p.short_description || p.description || "No description"}</li>`;
        })
        .join("") || "<li>No projects listed</li>";

    const responsesHTML =
      (data.form || [])
        .filter((entry: any) => entry.response && entry.response.trim() !== "")
        .map((entry: any) => `<li><strong>${entry.question}</strong><br/>${entry.response}</li><br/>`)
        .join("") || "<li>No responses provided</li>";

    feed.addItem({
      title: data.full_name || data.username,
      id: url,
      link: url,
      description: `
  ${userInfoHTML}
  <p><strong>Social Links:</strong></p>
  <ul>${socialsHTML}</ul>
  <p><strong>Projects:</strong></p>
  <ul>${projectsHTML}</ul>
  <p><strong>Form Responses:</strong></p>
  <ul>${responsesHTML}</ul>
`,
      date: data.created_on ? new Date(data.created_on) : new Date(),
    });
  }

  return new Response(feed.rss2(), {
    headers: { "Content-Type": "application/rss+xml" },
  });
});
