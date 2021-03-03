import Vue from "vue";
import VueRouter from "vue-router";

// 重写路由push方法,阻止重复点击报错
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err);
};

// 重写路由replace方法,阻止重复点击报错
const originalReplace = VueRouter.prototype.replace;
VueRouter.prototype.replace = function replace(location) {
  return originalReplace.call(this, location).catch(err => err);
};

const Login=()=>import('../components/Login.vue');
const Home=()=>import('../views/Home.vue');
const Welcome=()=>import('../views/homeChild/Welcome.vue');
const Users=()=>import('../components/user/Users.vue');
const Rights=()=>import('../components/power/Rights.vue');
const Roles=()=>import('../components/power/Roles.vue');
const Category=()=>import('../components/goods/Category.vue');
const Params=()=>import('../components/goods/Params.vue');
const GoodsList=()=>import('../components/goods/GoodsList.vue');
const Add=()=>import('../components/goods/Add.vue');
const Order=()=>import('../components/order/Order.vue');
const Reports=()=>import('../components/reports/Reports.vue');

Vue.use(VueRouter);

const routes = [
  {
    path:'/',
    redirect:'/login'
  },
  {
    path:'/login',
    component:Login
  },
  {
    path:'/home',
    component:Home,
    redirect:'/welcome',
    children:[
    {path:'/welcome',component:Welcome},
    {path:'/users',component:Users},
    {path:'/rights',component:Rights},
    {path:'/roles',component:Roles},
    {path:'/categories',component:Category},
    {path:'/params',component:Params},
    {path:'/goods',component:GoodsList},
    {path:'/goods/add',component:Add},
    {path:'/orders',component:Order},
    {path:'/reports',component:Reports}
    ]
  }
];

const router = new VueRouter({
  routes,
  mode:'history'
});
// 挂载路由导航守卫
router.beforeEach(function (to, from, next) {
  if (to.path === '/login') return next();
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token');
  if (!tokenStr) {
    return next('/login');
  } else {
    next();
  }
})

export default router;
