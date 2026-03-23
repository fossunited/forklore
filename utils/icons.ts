import Github from "~/components/icons/Github.vue";
import Gitlab from "~/components/icons/Gitlab.vue";
import Codeberg from "~/components/icons/Codeberg.vue";
import ArrowUpRight from "~/components/icons/ArrowUpRight.vue";
import WebIcon from "~/components/icons/WebIcon.vue";
import LinkedIn from "~/components/icons/LinkedIn.vue";
import Twitter from "~/components/icons/Twitter.vue";
import Mastodon from "~/components/icons/Mastodon.vue";
import BlueSky from "~/components/icons/BlueSky.vue";
import BitBucket from "~/components/icons/BitBucket.vue";
import Substack from "~/components/icons/Substack.vue";
import Reddit from "~/components/icons/Reddit.vue";
import Youtube from "~/components/icons/Youtube.vue";

const icons = {
  web: WebIcon,
  website: WebIcon,
  github: Github,
  gitlab: Gitlab,
  codeberg: Codeberg,
  linkedin: LinkedIn,
  x: Twitter,
  twitter: Twitter,
  mastodon: Mastodon,
  reddit: Reddit,
  bluesky: BlueSky,
  bitbucket: BitBucket,
  "arrow-up-right": ArrowUpRight,
  substack: Substack,
  youtube: Youtube
} as const;

type IconMap = typeof icons;
type IconComponent = IconMap[keyof IconMap];

const iconMapper = (label: string): IconComponent => {
  return icons[label.toLowerCase() as keyof IconMap] || WebIcon;
};

export default iconMapper;
