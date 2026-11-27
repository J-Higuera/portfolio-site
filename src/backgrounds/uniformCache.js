// Each renderer exclusively owns its context and program. Uniform values persist
// between draws; submit only changed values, without changing animation ticks.
// Vector snapshots are copied because palette/pulse buffers are mutated in place.
export function uniformCache(gl) {
  const cache = new Map();
  const setters = {};
  for (const name of ['uniform1i', 'uniform2i', 'uniform1f', 'uniform2f', 'uniform3f', 'uniform4f', 'uniform3fv', 'uniform4fv']) {
    const vector = name.endsWith('v');
    setters[name] = (location, ...args) => {
      if (location === null) return;
      const values = vector ? args[0] : args;
      const previous = cache.get(location);
      if (previous && previous.length === values.length && values.every((value, index) => value === previous[index])) return;
      gl[name](location, ...args);
      cache.set(location, Array.from(values));
    };
  }
  return setters;
}
