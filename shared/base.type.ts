export type StrictImplementation<Interface, Class> = {
  [K in keyof (Interface & Class)]: K extends keyof Interface
    ? K extends keyof Class
      ? Interface[K] extends Class[K]
        ? Class[K]
        : never
      : Interface[K]
    : never;
};
