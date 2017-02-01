import keymirror from 'keymirror';

export const ScriptActions = keymirror({
  SCRIPT_SAVE: null,
  SCRIPT_SAVE_AS: null,
  SCRIPT_DELETE: null
});

/**
 * Saves a script
 * @param name
 * @param script
 * @returns {SaveScript action}
 */
export const saveScript = (name, script) => {
  return {
    type: ScriptActions.SCRIPT_SAVE,
    name,
    script
  };
};

/**
 * Renames a script
 * @param oldName
 * @param newName
 * @param script
 * @returns {{type: null, name: *, script: *}}
 */
export const saveAsScript = (oldName, newName, script) => {
  return {
    type: ScriptActions.SCRIPT_SAVE,
    oldName,
    newName,
    script
  };
};

/**
 * Deletes a saved script
 * @param name
 * @returns {DeleteScript action}
 */
export const deleteScript = (name) => {
  return {
    type: ScriptActions.SCRIPT_DELETE,
    name
  };
};
