import m from "mithril";

export const ShowMoreList = ({ attrs }) => {

  let renderFn = attrs.renderer;
  let buttonText = attrs.buttonText;
  let refreshFn = attrs.refresher;

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
        items.map(renderFn),
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
