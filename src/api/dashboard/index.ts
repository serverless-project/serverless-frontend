import { createAxios, createPostAxios } from '/@/utils/axios';

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

export function ftGetLog(id: string) {
  if (id == "11") {
    id = "1";
  }
  if (id == "12") {
    id = "2";
  }
  return createPostAxios({
    url: '/api/exec/' + id,
    method: 'post',
  });
}

export function ftGetPassword(id: string) {
  if (id == "11") {
    id = "1";
  }
  if (id == "12") {
    id = "2";
  }
  return createPostAxios({
    url: '/api/password/' + id,
    method: 'post',
  });
}

export function ftGetProcess(id: string) {
  if (id == "11") {
    id = "1";
  }
  if (id == "12") {
    id = "2";
  }
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