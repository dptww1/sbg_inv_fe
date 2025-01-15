import m from "mithril";

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
