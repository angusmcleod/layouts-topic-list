import { createWidget } from 'discourse/widgets/widget';
import { getOwner } from 'discourse-common/lib/get-owner';
import DiscourseURL from 'discourse/lib/url';
import { h } from 'virtual-dom';

createWidget('topic-list-item', {
  tagName: 'li',

  html(attrs) {
    const title = attrs.topic.get('fancyTitle');
    return h('span', title);
  },

  click() {
    const url = this.attrs.topic.get('url');
    DiscourseURL.routeTo(url);
  }
});

export default createWidget('topic-list', {
  tagName: 'div',
  buildKey: () => 'topic-list',

  defaultState(attrs) {
    let currentType = null;

    if (attrs.topic) {
      currentType = 'suggested';
    } else {
      currentType = 'bookmarks';
    }

    return {
      gotBookmarks: false,
      bookmarks: [],
      currentType
    };
  },

  topicList(topics, loginRequired) {
    if (loginRequired && !this.currentUser) {
      return this.attach('login-required');
    }

    if (!topics || topics.length < 1) {
      return [ h('li', I18n.t(`filters.${this.state.currentType}.none`)) ];
    }

    return topics.map((t) => {
      return this.attach('topic-list-item', { topic: t });
    });
  },

  suggested() {
    const topic = this.attrs.topic;
    if (!topic) return [];

    let topics = topic.get('details.suggested_topics');
    return this.topicList(topics, false);
  },

  bookmarks() {
    return this.topicList(this.state.bookmarks, true);
  },

  getBookmarks() {
    const store = getOwner(this).lookup('store:main');

    store.findFiltered('topicList', {
      filter: 'bookmarks'
    }).then((result) => {
      this.state.bookmarks = result.topics;
      this.state.gotBookmarks = true;
      this.scheduleRerender();
    });
  },

  buildTitle(type) {
    const currentType = this.state.currentType;
    const active = currentType === type;

    let classes = 'list-title';
    if (active) classes += ' active';

    return this.attach('link', {
      action: 'showList',
      actionParam: type,
      title: `filters.${type}.help`,
      label: `filters.${type}.title`,
      className: classes
    });
  },

  html(attrs, state) {
    let contents = [];
    const { currentUser } = this;

    if (currentUser && this.siteSettings.layouts_topic_list_bookmarks && !state.gotBookmarks) {
      this.getBookmarks();
    }

    let titleContents = [];

    if (this.siteSettings.layouts_topic_list_bookmarks) {
      titleContents.push([this.buildTitle('bookmarks')]);
    }

    if (attrs.topic && this.siteSettings.layouts_topic_list_suggested) {
      titleContents.push(this.buildTitle('suggested'));
    }

    contents.push([
      h('div.widget-multi-title', titleContents),
      h('div.widget-list', h('ul', this[state.currentType]()))
    ]);

    if (attrs.editing) {
      contents.push(this.attach('app-edit', {
        side: attrs.side,
        index: attrs.index,
        name: 'topic-list',
        noRemove: true
      }));
    }

    return [ h('div.widget-container.app', h('div.widget-inner', contents)) ];
  },

  showList(currentType) {
    this.state.currentType = currentType;
    this.scheduleRerender();
  }
});
