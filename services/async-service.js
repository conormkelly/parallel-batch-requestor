//* Wrapper methods to abstract async execution.

/**
 * Execute each arg of the arg array against a function in parallel.
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
