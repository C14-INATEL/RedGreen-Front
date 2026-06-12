type RuntimeEnvValue = boolean | string | undefined;
type RuntimeEnv = Record<string, RuntimeEnvValue>;

declare global {
  var __REDGREEN_VITE_ENV__: RuntimeEnv | undefined;
}

export const setRuntimeEnv = (env: RuntimeEnv) => {
  globalThis.__REDGREEN_VITE_ENV__ = env;
};

export const readEnv = (key: string): string | undefined => {
  const runtimeValue = globalThis.__REDGREEN_VITE_ENV__?.[key];

  if (runtimeValue != null) {
    return String(runtimeValue);
  }

  const processEnv = (
    globalThis as {
      process?: {
        env?: Record<string, string | undefined>;
      };
    }
  ).process?.env;

  return processEnv?.[key];
};
