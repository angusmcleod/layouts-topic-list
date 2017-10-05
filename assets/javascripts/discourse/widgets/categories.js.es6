import { createWidget } from 'discourse/widgets/widget';
import { getOwner } from 'discourse-common/lib/get-owner';
import RawHtml from 'discourse/widgets/raw-html';
import CategoryLink from 'discourse/widgets/category-link';
import { h } from 'virtual-dom';

export default createWidget('categories', {
  tagName: 'div',
  buildKey: (attrs) => 'categories',

  renderCategory(cat) {
    return h('', [this.attach('category-link', {category: cat}), "" + cat.topicTrackingState.countUnread(cat.id)])
  },

  html(attrs, state) {
    let contents = [];
    let all_cats = Discourse.Category.list(); 
    let favs = all_cats
                .filter(x => x.notification_level > 1)
                .map(x => x.id);


    if (favs.length > 0) {
      contents = all_cats.filter(x => favs.includes(x.id))
                         .map(x => this.renderCategory(x));

      contents.push(h('', new RawHtml({html: '<hr>'})));
    } 

    contents = contents.concat(all_cats
                                .filter(x => !favs.includes(x.id))
                                .map(x => this.renderCategory(x)));

    console.log(favs, contents);
    return [ h('div.widget-container.app', h('div.widget-inner', contents)) ];
  },

  showList(currentType) {
    this.state.currentType = currentType;
    this.scheduleRerender();
  }
});
