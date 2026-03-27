import m from "mithril";

/**
 * Mithril component for a partial list of items which can be expanded.
 *
 * @component
 *
 * @vattr {string} buttonText - text for the button to reveal more items
 * @vattr {Object[]} items - initial list of items to show
 * @vattr {function(numItems:number)} refresher - function for client to
 *     increase the size of `items`
 * @vattr {function(obj:Object)} renderer - function to return the Mithril/DOM
 *     elements needed to render `obj`
 * @vattr {string} wrapperClasses - additional cloasses to apply to the `div`
 *     container in addition to the default `show-more-list`
 *
 * @todo The "more" button shows even when there are no more items to show.
   *    Should probably be smarter.
 */
export const ShowMoreList = ({ attrs }) => {

  let renderFn = attrs.renderer;
  let buttonText = attrs.buttonText;
  let refreshFn = attrs.refresher;

  let classes = ".show-more-list";
  if (attrs.wrapperClasses) {
    classes += (attrs.wrapperClasses && attrs.wrapperClasses.length > 0)
      ? (attrs.wrapperClasses.charAt(0) === "." ? "" : ".") + attrs.wrapperClasses
      : "";
  }

  let numItems = 0;
  let showMore = true;

  return {
    view(vnode) {
      let items = vnode.attrs.items;

      if (!items) {
        return null;
      }

      if (numItems > items.length) {
        showMore = false;

      } else {
        showMore = true;
        numItems = items.length;
      }

      return [
        m(classes,
          items.map(renderFn)),
        showMore
          ? m("button",
              {
                onclick: () => {
                  numItems += 5;
                  refreshFn(numItems);
                }
              },
              buttonText)
          : null
      ];
    }
  };
};
