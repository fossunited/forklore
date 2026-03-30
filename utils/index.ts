export const getPrettyLink = (link: string) => {
  return link.replace("https://", "").replace("http://", "");
};

export const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

export const truncate = (text: string, max = 200) => {
  if (!text) return "";
  const s = text.replace(/<[^>]*>/g, "");
  return s.length <= max ? s : s.slice(0, max).trim() + "…";
};
