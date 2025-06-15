import { createAxios, createPostAxios } from '/@/utils/axios';

export function ftBuild(body: {
  app_id: number,
  path: string,
  name: string,
  filename?: string,
  provider?: string,
}) {
  return createAxios({
    url: '/ft/build',
    method: 'post',
    data: body
  });
}

export function ftDeploy(body: {
  app_id: number,
  path: string,
  name: string,
  provider?: string,
}) {
  return createAxios({
    url: '/ft/deploy',
    method: 'post',
    data: body
  });
}

export function ftInvoke(body: {
  app_id: number,
  path: string,
  name: string,
  mode?: string,
  provider?: string,
}) {
  return createAxios({
    url: '/ft/invoke',
    method: 'post',
    data: body
  });
}

export function ftStop(body: {
  app_id: number,
  path: string,
  name: string,
  provider?: string,
}) {
  return createAxios({
    url: '/ft/stop',
    method: 'post',
    data: body
  });
}

export function ftGetLog(id: string) {
  return createPostAxios({
    url: '/api/exec/' + id,
    method: 'post',
  });
}

export function ftGetPassword(id: string) {
  return createPostAxios({
    url: '/api/password/' + id,
    method: 'post',
  });
}

export function ftGetProcess(id: string) {
  return createPostAxios({
    url: '/api/syscall/' + id,
    method: 'post',
  });
}

export function ftPerformance() {
  return createPostAxios({
    url: '/static/api/esolation/pwgen.json',
    method: 'get',
  });
}

export function ftPwgen() {
  return createPostAxios({
    url: '/api/button/pwgen',
    method: 'post',
  });
}