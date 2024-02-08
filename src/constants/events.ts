import { AppName } from 'constants/index';
import EventEmitter from 'events';

export const eventBus = new EventEmitter();
export const SET_GLOBAL_LOADING = `${AppName}event-setGlobalLoading`;
