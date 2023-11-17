import { logger } from './logger';

const log = logger.child({ module: 'discord' });

export type Embed = {
  title: string;
  description: string;
  color: number;
  url: string;
  author: Partial<Author>;
  fields: Partial<Field>[];
  thumbnail: Partial<Thumbnail>;
  footer: Partial<Footer>;
};

type Field = {
  name: string;
  value: string;
  url: string;
  inline: boolean;
};

type Thumbnail = {
  url: string;
};

type Footer = {
  text: string;
  icon_url: string;
};

type Author = {
  name: string;
  url: string;
  icon_url: string;
};

type Attachment = {
  //
};

export type DiscordMessageBody = {
  content: string;
  username: string;
  avatar_url: string;
  tts: boolean;
  thread_name: string;
  embeds: Partial<Embed>[];
  attachments: Partial<Attachment>[];
};

export const sendDiscordMessage = async (webhookUrl: string, body?: Partial<DiscordMessageBody>) =>
  fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
    .then((res) => {
      log.info('discord message sent', res);
    })
    .catch((error) => {
      log.error('failed to send discord message', error);
    });
