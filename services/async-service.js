//* Wrapper methods to abstract async execution.

/**
 * Execute an array of args against a function in parallel.
 * @param {{args: any[], fn: Function}} config
 */
function executeParallel({ args, fn }) {
  return Promise.all(
    args.map((arg) => {
      return fn(arg);
    })
  );
}

module.exports = {
  executeParallel,
};
