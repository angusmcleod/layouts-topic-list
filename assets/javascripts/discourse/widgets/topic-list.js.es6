import { createWidget } from 'discourse/widgets/widget';
import { getOwner } from 'discourse-common/lib/get-owner';
import DiscourseURL from 'discourse/lib/url';
import { emojiUnescape } from 'discourse/lib/text';
import { h } from 'virtual-dom';
import RawHtml from "discourse/widgets/raw-html";

let layoutsError;
let layouts;

try {
  layouts = requirejs('discourse/plugins/discourse-layouts/discourse/lib/layouts');
} catch(error) {
  layouts = { createLayoutsWidget: createWidget };
  console.error(error);
}

export default layouts.createLayoutsWidget('topic-list', {
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
      return this.attach('layouts-topic-list-item', { topic: t });
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
      if (this.state) {
        this.state.topics = result.topics;
        this.state.gotTopics = true;
        this.scheduleRerender();
      }
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

    if (state) {
      if (currentUser && !state.gotTopics) {
        this.getTopics();
      }

      let titleContents = [];

      if (state.topicLists) {
        state.topicLists.forEach((list) => {
          titleContents.push([this.buildTitle(list)]);
        });
      }

      contents.push([
        h('div.widget-multi-title', titleContents),
        h('div.widget-list', h('ul', this.topicList(state.topics, true)))
      ]);
    }

    return [ h('div.widget-container.app', h('div.widget-inner', contents)) ];
  },

  showList(currentType) {
    this.state.currentType = currentType;
    this.state.gotTopics = false;
    this.scheduleRerender();
  }
});

createWidget('layouts-topic-list-item', {
  tagName: 'li',

  html(attrs) {
    const title = attrs.topic.get('fancyTitle');
    return h('div.title', new RawHtml({
      html: `<span>${emojiUnescape(title)}</span>`
    }));
  },

  click() {
    const url = this.attrs.topic.get('url');
    DiscourseURL.routeTo(url);
  }
});
