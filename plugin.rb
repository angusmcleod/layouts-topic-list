# name: layouts-topic-list
# about: A topic list widget for the layouts plugin
# version: 0.1
# authors: angus

register_asset 'stylesheets/layouts-topic-list.scss'

after_initialize do
  DiscourseLayouts::WidgetHelper.add_widget('topic-list')
end
