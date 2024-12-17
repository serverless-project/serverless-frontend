import Mock from 'mockjs';
import { index } from '/@/mock/modules/app';

Mock.mock('/api/app/index', 'get', index);
