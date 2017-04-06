/**
 * Class for sending the same message to multiple maps.
 */
class MapCoordinator {
  /**
   * Singleton constructor
   * @returns {MapCoordinator}
   */
  constructor() {
    /** @type {object} */
    this.handlers = {};
  }

  /**
   * @param prop
   * @param fn
   */
  subscribe(prop, fn) {
    if (!(prop in this.handlers)) {
      this.handlers[prop] = [];
    }
    this.handlers[prop].push(fn);
  }

  /**
   *
   * @param prop
   * @param fn
   */
  unsubscribe(prop, fn) {
    this.handlers[prop] = this.handlers[prop].filter(
      function(item) {
        if (item !== fn) {
          return item;
        }
      }
    );
  }

  /**
   *
   * @param prop
   * @param o
   * @param thisObj
   */
  fire(prop, o, thisObj) {
    let scope = thisObj || window;
    // TODO get store state regarding linked or unlinked commands

    let _apply = (fn) => {
      fn.apply(scope, o);
    };

    this.handlers[prop].forEach(_apply);
  }
}

export const mapCoordinator = new MapCoordinator();
