import { createWidget } from 'discourse/widgets/widget';
import { getOwner } from 'discourse-common/lib/get-owner';
import RawHtml from 'discourse/widgets/raw-html';
import CategoryLink from 'discourse/widgets/category-link';
import { h } from 'virtual-dom';

const LINKS = [
  { route: 'faq', className: 'faq-link', label: 'faq' },
  { route: 'about', className: 'about-link', label: 'about.simple_title' },
  { route: 'tos', className: 'faq-link', label: 'terms_of_service' },
  { route: 'privacy', className: 'faq-link', label: 'privacy' }
]

export default createWidget('categories', {
  tagName: 'div',
  buildKey: (attrs) => 'categories',

  renderCategory(cat, opts) {

    if ((!cat) ||
          (!opts.allowUncategorized &&
           cat.id === Discourse.Site.currentProp("uncategorized_category_id") &&
           Discourse.SiteSettings.suppress_uncategorized_badge
          )
       ) return [];

    let contents = [this.attach('link', {
                          href: Ember.get(cat, 'url'),
                          rawLabel: h('span', {
      attributes: {'style': 'border-left-color:#' + cat.color}
    }, cat.name)}, opts)];

    if (opts.render_children && cat.has_children && cat.show_subcategory_list) {
      contents.push(h('ul.subcat-list', opts.all_cats
                            .filter(x => x.parent_category_id == cat.id)
                            .map(c => this.renderCategory(c, {
                                        render_children: false,
                                        selected_cat_id: opts.selected_cat_id,
                                        categoryStyle: 'none'}))));

    } else {
      let c_unread = cat.topicTrackingState.countUnread(cat.id);
      let c_new = cat.topicTrackingState.countNew(cat.id);
      if (c_unread) {
        contents.push(h('a.badge.unread-posts.badge-notification',
                     {attributes: {href: Ember.get(cat, 'unreadUrl')}},
                     "" + c_unread));

      }
      if (c_new) {
        contents.push(h('a.badge.new-posts.badge-notification',
                     {attributes: {href: Ember.get(cat, 'newUrl')}},
                     "" + c_new));

      }
    }
    return h('li' + (opts.selected_cat_id === cat.id ? '.selected' : ''), contents)
  },

  html(attrs, state) {
    let contents = [];
    let cur_cat_id = attrs.navCategory ? attrs.navCategory.id : null;
    let all_cats = Discourse.Category.list(); 
    let favs = all_cats
                .filter(x => x.notification_level > 1)
                .map(x => x.id);

    if (favs.length > 0) {
      contents.push(h('ul.cat-list', all_cats
                              .filter(x => favs.includes(x.id))
                              .map(x => this.renderCategory(x, {
                                    render_children: false,
                                    selected_cat_id: cur_cat_id}))));

      contents.push(h('hr'));
    } 

    let remaining_cats = all_cats.filter(x => !favs.includes(x.id));

    contents.push(h('ul.cat-list', remaining_cats
                            .filter(x => !x.parent_category_id)
                            .map(x => this.renderCategory(x, {
                                    render_children: true,
                                    selected_cat_id: cur_cat_id,
                                    all_cats: remaining_cats}))));


    contents.push(h('ul.general',
      LINKS.map(l => h('li,', this.attach('link', l)))));

    
    return h('.categories-widget', contents);
  },

  showList(currentType) {
    this.state.currentType = currentType;
    this.scheduleRerender();
  }
});
