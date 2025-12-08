export const IS_PRODUCTION = typeof window === "undefined"
    ? process.env.NODE_ENV === "production"
    : process.env.NEXT_PUBLIC_ENV === "production";
