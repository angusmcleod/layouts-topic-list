# name: layouts-topic-list
# about: A topic list widget for the layouts plugin
# version: 0.1
# authors: angus

register_asset 'stylesheets/layouts-topic-list.scss'

DiscourseEvent.on(:layouts_ready) do
  DiscourseLayouts::WidgetHelper.add_widget('topic-list', position: 'right', order: 'start')
end
