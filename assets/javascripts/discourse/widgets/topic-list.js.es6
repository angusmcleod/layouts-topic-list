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
    const topicLists = this.siteSettings.layouts_topic_lists.split('|');
    return {
      gotTopics: false,
      topics: [],
      currentType: topicLists[0],
      topicLists
    };
  },

  topicList(topics, loginRequired) {
    if (loginRequired && !this.currentUser) {
      return this.attach('login-required');
    }

    if (!this.state.gotTopics) {
      return [ h('div.spinner.small') ];
    } else if (!topics || topics.length < 1) {
      return [ h('li', I18n.t(`filters.${this.state.currentType}.none`)) ];
    }

    return topics.map((t) => {
      return this.attach('topic-list-item', { topic: t });
    });
  },

  topics() {
    return this.topicList(this.state.topics, true);
  },

  getTopics() {
    const store = getOwner(this).lookup('store:main');

    store.findFiltered('topicList', {
      filter: this.state.currentType,
      params: {
        list_widget: true
      }
    }).then((result) => {
      this.state.topics = result.topics;
      this.state.gotTopics = true;
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

    if (currentUser && !state.gotTopics) {
      this.getTopics();
    }

    let titleContents = [];

    state.topicLists.forEach((list) => {
      titleContents.push([this.buildTitle(list)]);
    });

    contents.push([
      h('div.widget-multi-title', titleContents),
      h('div.widget-list', h('ul', this.topicList(state.topics, true)))
    ]);

    return [ h('div.widget-container.app', h('div.widget-inner', contents)) ];
  },

  showList(currentType) {
    this.state.currentType = currentType;
    this.state.gotTopics = false;
    this.scheduleRerender();
  }
});
