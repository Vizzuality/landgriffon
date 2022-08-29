import Head from 'next/head';
import { useMemo } from 'react';

interface TitleTemplateProps {
  title?: string;
  titleTemplate?: string;
  defaultTitle?: string;
}

const defaults: Partial<TitleTemplateProps> = {
  titleTemplate: '',
};

const buildTags = ({ title, titleTemplate, defaultTitle }: TitleTemplateProps) => {
  const tagsToRender: React.ReactNode[] = [];

  if (titleTemplate) {
    defaults.titleTemplate = titleTemplate;
  }

  let updatedTitle = '';
  if (title) {
    updatedTitle = title;
    if (defaults.titleTemplate) {
      updatedTitle = defaults.titleTemplate.replace(/%s/g, () => updatedTitle);
    }
  } else if (defaultTitle) {
    updatedTitle = defaultTitle;
  }

  if (updatedTitle) {
    tagsToRender.push(<title key="title">{updatedTitle}</title>);
  }

  return tagsToRender;
};

const TitleTemplate: React.FC<TitleTemplateProps> = (options) => {
  const tagsToRender = useMemo(() => buildTags(options), [options]);

  return <Head>{tagsToRender}</Head>;
};

export default TitleTemplate;
