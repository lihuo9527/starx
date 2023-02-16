import axios from 'axios';
import { setGlobalMessage } from '../redux/slices/global';
import { dispatch } from '../redux/store';
import { baseUrl } from './baseUrl';

const request = axios.create({
  baseURL: baseUrl,
  timeout: 10000,
  method: 'post',
});

request.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';

request.interceptors.request.use(
  (config) => {
      const accessToken = window.localStorage.getItem('accessToken');
      if (accessToken) {
        config.headers.token = accessToken;
      };
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

const errorHandle = (error) => {
  if (error.response) {
    const { data = {}, status, config, statusText } = error.response;
    if (!config.silent) {
      // Boolean(config.silent)为false, 就在这统一处理报错
      dispatch(setGlobalMessage({
        variant: 'error',
        msg: data.msg || statusText,
      }));
    }
    return Promise.reject(data);
  }
  dispatch(setGlobalMessage({
    variant: 'error',
    i18nKey: 'networkError',
  }));
  return Promise.reject(error);
};

request.interceptors.response.use((response) => {
  const isFile = response.config.data
    ? response.config.data.type === 'file'
    : false;
  if (isFile) return response;
  if (response.data.msg === 'token失效，请重新登录' || response.data.msg === 'token不能为空') {
    window.localStorage.removeItem('accessToken');
    const arr = window.location.href.split('/');
    const returnUrl = arr[arr.length - 1];
    window.location.href = returnUrl ? `auth/login?returnUrl=${returnUrl}`: 'auth/login';
  }
  return response.data;
}, errorHandle);

export default request;
