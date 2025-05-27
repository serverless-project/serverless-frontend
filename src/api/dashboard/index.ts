import { createAxios } from '/@/utils/axios';

export function ftBuild(body: {
  app_id: number,
  path: string,
  name: string,
  filename?: string
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
  mode?: string
}) {
  return createAxios({
    url: '/ft/invoke',
    method: 'post',
    data: body
  });
}

export function ftGetLog(body: {
  name: string,
  mode?: string,
  metric?: string
}) {
  return createAxios({
    url: '/ft/logs',
    method: 'post',
    data: body
  });
}