<template>
	<div class="login-container">
		<div class="login-box">
			<div class="top-img-box">
				<img src="../assets/img/logo.png" alt="头像">
			</div>
			<!-- 登录表单区域 -->
			<el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" class="login-form">
			  	<el-form-item prop="username">
			      <el-input v-model="loginForm.username" prefix-icon="el-icon-user-solid"></el-input>
				  </el-form-item>
				<el-form-item prop="password">
			      <el-input v-model="loginForm.password" type="password" 
			      prefix-icon="el-icon-lock"></el-input>
				</el-form-item>
				<!-- 按钮区域 -->
				<el-form-item class="btns"> 
			      <el-button type="primary" @click="login">登录</el-button>
			      <el-button type="info" @click="resetForm">重置</el-button>
				</el-form-item>
			</el-form>
		</div>
	</div>
</template>

<script>
export default {

  name: 'Login',
  data () {
    return {
    	loginForm:{
    		username:'admin',
    		password:''
    	},
    	// 表单验证规则对象
    	loginRules:{
    		username:[
    			{ required: true, message: '请输入登录名称', trigger: 'blur' },
            	{ min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
    		],
    		password:[
    			{ required: true, message: '请输入密码', trigger: 'blur' },
            	{ min: 4, max: 12, message: '长度在 4 到 10 个字符', trigger: 'blur' }
    		]
    	}
    }
  },
  methods:{
  	// 重置按钮
  	resetForm(){
  		this.$refs.loginFormRef.resetFields();
  	},
  	login(){
  		this.$refs.loginFormRef.validate(async valid=>{
  			if (!valid) {
            	return;
          	} else {
            	const { data:res } = await this.$http.post('login',this.loginForm);
            	if (res.meta.status===200) {
            		this.$message.success('登录成功^_^');
            		// 1.1 项目除了登录之外的其他API,必须在登录之后才能访问;
            		// 1.2 token 只应在当前网站打开期间生效，所以将token保存在sessionStorage中!
            		window.sessionStorage.setItem('token',res.data.token);
            		// 2.0 通过导航跳转到后台主页,路由地址是 /home
            		this.$router.push('/home');
            	} else {
            		this.$message.error('登录失败>_<');
            			
            	}      
          	}
  		});
  	}
  }
};
</script>

<style lang="css" scoped>
.login-container{
	background-color: #2b4b6b;
	height: 100%;
}
.login-box{
	width: 450px;
	height: 300px;
	background-color: #fff;
	border-radius: 10px;
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%,-50%);
}
.top-img-box{
	height: 130px;
	width: 130px;
	border: 1px solid #ccc;
	border-radius: 50%;
	padding: 10px;
	box-shadow: 0 0 10px #ddd;
	position: absolute;
	left:50%;
	transform: translate(-50%,-50%);
}
.top-img-box img{
	width: 100%;
	height: 100%;
	border-radius: 50%;
	background-color: #eee;

}
.login-form{
	position: absolute;
	bottom: 0;
	padding: 0 20px;
	width: 100%;
	box-sizing: border-box;
}
.btns{
	display: flex;
	justify-content: flex-end;
	margin-right: 10px;
}
</style>