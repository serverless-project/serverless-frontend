import { createAxios } from '/@/utils/axios';

export function ftBuild(body: {
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