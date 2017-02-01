/**
 * Splices a value into a string
 * @param {string} string String to be spliced
 * @param {string} replacement The string or character to be inserted
 * @param {number} position The position in the string to replace
 * @returns {string} The spliced string
 */
export const splice = (string, replacement, position) => {
  let head = string.substr(0, position);
  let tail = string.substring(position + 1);
  return head + replacement + tail;
};
