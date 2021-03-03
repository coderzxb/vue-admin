import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./plugins/element.js";
import axios from 'axios';
// 导入全局样式表
import './assets/css/global.css';
import TreeTable from 'vue-table-with-tree-grid';

// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor';
// 导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';

// 导入nprogress进度条的包和对应的css
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// 配置的根路径
axios.defaults.baseURL = 'http://nodeshop.shelterc.top:3300/api/private/v1/';
 // 请求拦截器
axios.interceptors.request.use(config => {
	NProgress.start();
  config.headers.Authorization = window.sessionStorage.getItem('token');
	return config;
})
 // 响应拦截器
axios.interceptors.response.use(config => {
   NProgress.done();
  return config;
})
Vue.prototype.$http = axios;

Vue.config.productionTip = false;
Vue.component('tree-table',TreeTable);
// 注册富文本编辑器为全局可用插件
Vue.use(VueQuillEditor);

Vue.filter('dateFormat', function (val) {
  const Dt = new Date(val);
  const Y = Dt.getFullYear();
  const M = (Dt.getMonth() + 1 + '').padStart(2,'0');
  const D = (Dt.getDate()+'').padStart(2,'0');
  const hh = (Dt.getHours()+'').padStart(2,'0');
  const mm = (Dt.getMinutes()+'').padStart(2,'0');
  const ss = (Dt.getSeconds()+'').padStart(2,'0');

  return `${Y}-${M}-${D} ${hh}:${mm}:${ss}`;
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
