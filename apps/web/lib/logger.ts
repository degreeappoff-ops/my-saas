export function createReqLogger(name: string) {
  const start = Date.now();
  const reqId = Math.random().toString(36).slice(2, 8);
  return {
    info: (msg: string, extra?: unknown) => {
      console.log(`[${name}]#${reqId}`, msg, extra ?? "");
    },
    error: (msg: string, extra?: unknown) => {
      console.error(`[${name}]#${reqId}`, msg, extra ?? "");
    },
    end: () => {
      const ms = Date.now() - start;
      console.log(`[${name}]#${reqId} done in ${ms}ms`);
    },
  };
}
