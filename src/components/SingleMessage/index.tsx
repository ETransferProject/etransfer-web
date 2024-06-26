import { message } from 'antd';
import { MessageApi, ArgsProps, typeList, MessageInstance } from 'antd/lib/message';
import { renderToString } from 'react-dom/server';
import { ExclamationFilledSmall } from 'assets/images';
import styles from './styles.module.scss';
import { randomId } from '@portkey/utils';

const singleMessage = {} as Omit<MessageApi, 'useMessage'>;

const defaultMessageArgs: Partial<ArgsProps> = { className: styles.message };

function isArgsProps(content: Parameters<MessageInstance['success']>[0]): content is ArgsProps {
  return (
    Object.prototype.toString.call(content) === '[object Object]' &&
    !!(content as ArgsProps).content
  );
}

function setDefaultArgs(originalArgs: ArgsProps, defaultArgs: Partial<ArgsProps> = {}): ArgsProps {
  const _originalArgs = { ...originalArgs };
  if (!_originalArgs.content) throw '';

  Object.keys(defaultArgs).forEach((v) => {
    const k = v as keyof ArgsProps;
    if (!_originalArgs[k]) _originalArgs[k] = defaultArgs[k];
  });

  if (!_originalArgs.key) {
    let key = randomId();
    try {
      key =
        typeof _originalArgs.content === 'object'
          ? renderToString(_originalArgs.content)
          : _originalArgs.content;
    } catch (error) {
      // key;
    }
    _originalArgs.key = key;
  }

  return _originalArgs;
}

typeList?.forEach((type) => {
  singleMessage[type] = (...params) => {
    const _content = params[0];
    const content = isArgsProps(_content)
      ? _content
      : {
          content: _content,
        };
    message.destroy(content.content as any);

    return message[type](
      setDefaultArgs(content, {
        ...defaultMessageArgs,
        icon: type === 'error' ? <ExclamationFilledSmall /> : null,
      }),
      params[1],
      params[2],
    );
  };
});

singleMessage.open = (args) => message.open(setDefaultArgs(args, defaultMessageArgs));
singleMessage.destroy = message.destroy;
singleMessage.warn = singleMessage.warning;
singleMessage.config = (options) =>
  message.config({ ...options, prefixCls: options.prefixCls || defaultMessageArgs.prefixCls });

export default singleMessage;
