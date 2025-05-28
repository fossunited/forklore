import Github from "~/components/icons/Github.vue";
import Gitlab from "~/components/icons/Gitlab.vue";
import Codeberg from "~/components/icons/Codeberg.vue";
import ArrowUpRight from "~/components/icons/ArrowUpRight.vue";
import WebIcon from "~/components/icons/WebIcon.vue";

type IconComponent = typeof Github | typeof Gitlab | typeof Codeberg;

type IconMap = {
  web: typeof WebIcon;
  github: typeof Github;
  gitlab: typeof Gitlab;
  codeberg: typeof Codeberg;
  "arrow-up-right": typeof ArrowUpRight;
};

const icons: IconMap = {
  web: WebIcon,
  github: Github,
  gitlab: Gitlab,
  codeberg: Codeberg,
  "arrow-up-right": ArrowUpRight,
};

const iconMapper = (label: string): IconComponent => {
  const key = label.toLowerCase() as keyof IconMap;
  const icon = icons[key];
  if (!icon) {
    return icons.web;
  }
  return icon;
};

export default iconMapper;
