/**
 *
 * @param {string} key
 * @param {(object|string|number)} state
 */
export const updateLocalStorage = (key, state) => {
  localStorage.setItem(key, JSON.stringify(state));
};

/**
 *
 * @param {string} key
 */
export const retrieveLocalStorage = (key) => {
  return JSON.parse(localStorage.getItem(key));
};
