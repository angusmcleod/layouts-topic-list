# name: layouts-topic-list
# about: A topic list widget for the layouts plugin
# version: 0.1
# authors: angus

DiscourseEvent.on(:layouts_ready) do
  DiscourseLayouts::WidgetHelper.add_widget('topic-list', position: 'right', order: 'start')
end

after_initialize do
  TopicQuery.public_valid_options << :list_widget
  TopicQuery.valid_options << :list_widget

  module TopicQueryTopicListWidgetExtension
    def per_page_setting
      return SiteSetting.layouts_topic_lists_limit if @options[:list_widget] = true
      super
    end
  end

  require_dependency 'topic_query'
  class ::TopicQuery
    prepend TopicQueryTopicListWidgetExtension
  end
end
