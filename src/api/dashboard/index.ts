import { createAxios } from '/@/utils/axios';

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