const KEY = "planetNav";
const _ctx = ref<"planet" | "user">(
  import.meta.client
    ? ((sessionStorage.getItem(KEY) as "planet" | "user") || "user")
    : "user",
);

export const usePlanetNav = () =>
  computed({
    get: () => _ctx.value,
    set: (v: "planet" | "user") => {
      _ctx.value = v;
      if (import.meta.client) sessionStorage.setItem(KEY, v);
    },
  });
