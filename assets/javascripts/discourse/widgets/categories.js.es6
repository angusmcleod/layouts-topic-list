import { createWidget } from 'discourse/widgets/widget';
import { getOwner } from 'discourse-common/lib/get-owner';
import RawHtml from 'discourse/widgets/raw-html';
import CategoryLink from 'discourse/widgets/category-link';
import { h } from 'virtual-dom';

export default createWidget('categories', {
  tagName: 'div',
  buildKey: (attrs) => 'categories',

  defaultState(attrs) {
    let currentType = null;

    if (attrs.topic) {
      currentType = 'suggested'
    } else {
      currentType = 'bookmarks'
    }

    return {
      gotBookmarks: false,
      bookmarks: [],
      currentType
    }
  },

  renderCategory(cat) {
    return h('', [this.attach('category-link', {category: cat}), "" + cat.topicTrackingState.countUnread(cat.id)])
  },

  html(attrs, state) {
    console.log(Discourse.Category.list())

    let contents = [
      Discourse.Category.list().map(x => this.renderCategory(x))
    ];

    return [ h('div.widget-container.app', h('div.widget-inner', contents)) ];
  },

  showList(currentType) {
    this.state.currentType = currentType;
    this.scheduleRerender();
  }
});
