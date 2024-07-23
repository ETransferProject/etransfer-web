import { APP_NAME } from 'constants/index';
import EventEmitter from 'events';

export const eventBus = new EventEmitter();
export const SET_GLOBAL_LOADING = `${APP_NAME}event-setGlobalLoading`;
