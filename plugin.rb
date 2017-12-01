# name: layouts-topic-list
# about: A topic list widget for the layouts plugin
# version: 0.1
# authors: angus

DiscourseEvent.on(:layouts_ready) do
  DiscourseLayouts::WidgetHelper.add_widget('topic-list', position: 'right', order: 'start')
end
