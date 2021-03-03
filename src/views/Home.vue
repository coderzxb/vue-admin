<template>
	<el-container class="home-container">
		<!-- 头部区域 -->
	  <el-header>
	  	<div class="top-content">
	  		<img src="../assets/img/heima.png" height="58" width="61">
	  		<span>电商后台管理系统</span>
	  	</div>
	  	<el-button type="warning" @click="loginOff">退出</el-button>
	  </el-header>
	  <el-container>
	  	<!-- 侧边栏 -->
	    <el-aside :width="isCollapse?'64px':'200px'">
	    	<div class="toggle-btn" @click="toggleCollapse">|||</div>
			<el-menu background-color="#333744" text-color="#fff" active-text-color="#409EFF" unique-opened :collapse="isCollapse" :collapse-transition="false" router 
			:default-active="activePath">
				<!-- 一级菜单 -->
		      <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
		        <template slot="title">
		          <i :class="icons[item.id]"></i>
		          <span>{{item.authName}}</span>
		        </template>
		        <!-- 二级菜单 -->
		        <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveLinkState('/'+subItem.path)">
			        <template slot="title">
			          	<i class="el-icon-menu"></i>
			          	<span>{{subItem.authName}}</span>
			        </template>
		        </el-menu-item>
		      </el-submenu>
		    </el-menu>
	    </el-aside>
	    <!-- 右侧内容主体 -->
	    <el-main>
			<!-- 路由占位符 -->
    		<router-view></router-view>
	    </el-main>
	  </el-container>
	</el-container>
</template>

<script>
export default {
  name: 'Home',
  data () {
    return {
    	menuList:[],
    	icons:{
    		'125':'el-icon-user-solid',
    		'103':'el-icon-box',
    		'101':'el-icon-s-goods',
    		'102':'el-icon-s-order',
    		'145':'el-icon-data-analysis'
    	},
    	isCollapse:false,
    	// 被激活的链接地址
    	activePath:''
    }
  },
  created(){
  	this.getMenuList();
  	this.activePath = window.sessionStorage.getItem('activePath');
  },
  methods:{
  	loginOff(){
  		window.sessionStorage.clear();// 退出按钮清除token,返回login
		this.$router.push('/login');

  	},
  	async getMenuList(){
  		const {data:res} = await this.$http.get('menus');
  		if (res.meta.status!==200) return this.$message.error(res.meta.msg);
  		this.menuList = res.data;
  	},
  	// 点击按钮,切换菜单的折叠与展开
  	toggleCollapse(){
  		this.isCollapse =! this.isCollapse;
  	},
  	saveLinkState(activePath){
  		window.sessionStorage.setItem('activePath',activePath);
  	}
  }
};
</script>

<style lang="css" scoped>
.home-container{
	height: 100%;
}
.el-header{
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-left: 2px;
	background-color: #373D41;
	color: #fff;
	font-size: 20px;
	user-select: none;
}
.top-content{
	display:flex;
	align-items: center;
}
.top-content span{
	margin-left: 15px;
}
.el-aside{
	background-color: #333744;
}
.toggle-btn{
	background-color: #4A5064;
	color: #fff;
	text-align: center;
	font-size: 12px;
	line-height: 24px;
	letter-spacing: 0.3em;
	cursor: pointer;
}
.el-menu {
    border-right:none;
}
.el-main{
	background-color: #eaedf1;
}
</style>