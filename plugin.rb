# name: layouts-categories
# about: A widget that lists categories for the layouts plugin
# version: 0.1
# authors: Ben

register_asset 'stylesheets/categories.scss'

DiscourseEvent.on(:layouts_ready) do
  DiscourseLayouts::WidgetHelper.add_widget('categories', position: 'left', order: 'start')
end
