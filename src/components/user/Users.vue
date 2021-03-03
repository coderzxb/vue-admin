<template>
	<div>
		<!-- 面包屑导航区域 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
		  <el-breadcrumb-item>用户管理</el-breadcrumb-item>
		  <el-breadcrumb-item>用户列表</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 卡片视图区域 -->
		<el-card class="box-card">
  			<!-- 搜索与添加区域 -->
  			<el-row :gutter="20">
			  <el-col :span="10">
				<el-input placeholder="请输入内容" 
				v-model="queryInfo.query" clearable @clear="getUserList">
	    			<el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
	  			</el-input>
			  </el-col>
			  <el-col :span="4">
				<el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
			  </el-col>
			</el-row>
			<!-- 用户列表区域 -->
			<el-table :data="usersList" border>
			  <el-table-column type="index"></el-table-column>
		      <el-table-column prop="username" label="姓名"></el-table-column>
		      <el-table-column prop="email" label="邮箱"></el-table-column>
		      <el-table-column prop="mobile" label="电话"></el-table-column>
		      <el-table-column prop="role_name" label="角色"></el-table-column>
		      <el-table-column label="状态">
		      	<template v-slot="scope">
		      		<el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)">
		      		</el-switch>
		      	</template>
		      </el-table-column>
		      <el-table-column  label="操作" width="180">
		      	<template v-slot="scope">	
			      	<el-button type="primary" icon="el-icon-edit" size="mini" 
			      	@click="changeDialog(scope.row.id)">
			      	</el-button>
    					<el-button type="danger" icon="el-icon-delete" size="mini"
    					@click="removeUserById(scope.row.id)"></el-button>
					<el-tooltip content="分配角色" placement="top" enterable="false">
						<el-button type="warning" icon="el-icon-s-tools" size="mini" @click="setRoles(scope.row)"/>
					</el-tooltip>
		      	</template>
		      </el-table-column>
    		</el-table>
    		<!-- 页码 -->
    		<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
    		:current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
    		</el-pagination>
		</el-card>
		<!-- 添加用户的对话框 -->
		<el-dialog title="添加用户：" :visible.sync="dialogVisible" width="50%" @close="dialogClosed">
		  <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
  			<el-form-item label="用户名" prop="username">
    			<el-input v-model="addForm.username"></el-input>
  			</el-form-item>
  			<el-form-item label="密码" prop="password">
    			<el-input v-model="addForm.password"></el-input>
  			</el-form-item>
  			<el-form-item label="邮箱" prop="email">
    			<el-input v-model="addForm.email"></el-input>
  			</el-form-item>
  			<el-form-item label="手机" prop="mobile">
    			<el-input v-model="addForm.mobile"></el-input>
  			</el-form-item>
  		</el-form>
		  <span slot="footer" class="dialog-footer">
		    <el-button @click="dialogVisible = false">取 消</el-button>
		    <el-button type="primary" @click="addUser">确 定</el-button>
		  </span>
		</el-dialog>
		<!-- 修改用户的对话框 -->
		<el-dialog title="修改用户" :visible.sync="changeDialogVisible" width="50%">
			<el-form ref="changeFormRef" :model="changeForm" label-width="70px" 
			:rules="changeFormRules" @close="offChangeForm">
			  <el-form-item label="用户名">
			    <el-input v-model="changeForm.username" disabled></el-input>
			  </el-form-item>
			  <el-form-item label="邮箱">
			    <el-input v-model="changeForm.email" prop="email"></el-input>
			  </el-form-item>
			  <el-form-item label="手机">
			    <el-input v-model="changeForm.mobile" prop="mobile"></el-input>
			  </el-form-item>
			</el-form>
		  <span slot="footer" class="dialog-footer">
		    <el-button @click="changeDialogVisible = false">取 消</el-button>
		    <el-button type="primary" @click="changeUserInfo">确 定</el-button>
		  </span>
		</el-dialog>
    <!-- 分配角色的对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRolesDialogVisible" width="50%" @close="offSetRoles">
      <div>
        <p>当前的用户:{{userInfo.username}}</p>
        <p>当前的用户:{{userInfo.role_name}}</p>
        <p>分配新角色:
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option v-for="item in rolesList" :key="item.id" 
            :label="item.roleName" :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRolesInfo">确 定</el-button>
      </span>
    </el-dialog>
	</div>
</template>

<script>
export default {
  name: 'Users',
  data () {
  		// 验证邮箱的规则
  		var checkEmail = (rule, value, callback) => {
  			const regEmail = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;	
			if(regEmail.test(value)){
				return callback();
			}else{
				callback(new Error('请输入合法邮箱'));
			}
	  	}
	  	var checkMobile = (rule, value, callback) => {
	  		const regMobile = /^1[3|4|5|8][0-9]\d{4,8}$/;
	  		if(regMobile.test(value)){
				return callback();
			}else{
				callback(new Error('请输入正确手机号'));
			}
	  	}	
    return {
    	// 获取用户列表的参数
    	queryInfo:{
    		query:'',
    		pagenum:1,
    		pagesize:2
    	},
    	usersList:[],
    	total:0,
    	// 控制添加用户对话框的显示与隐藏
    	dialogVisible: false,
    	// 添加用户的表单数据
    	addForm:{
    		username:'',
    		password:'',
    		email:'',
    		mobile:''
    	},
    	addFormRules:{
    		username:[ 
    				   { required: true, message: '请输入用户名', trigger: 'blur' },
            		   { min: 3, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur'}
            ],
            password:[
            		   { required: true, message: '请输入密码', trigger: 'blur' },
            		   { min: 5, max: 12, message: '长度在 5 到 12 个字符', trigger: 'blur'}
            ],
            email:[
            		   { required: true, message: '请输入邮箱', trigger: 'blur' },
            		   { max: 20, message: '长度在 5 到 20 个字符', trigger: 'blur'},
            		   {validator: checkEmail,trigger: 'blur'}
            ],
            mobile:[
            		   { required: true, message: '请输入手机号', trigger: 'blur' },
            		   { max:11, message: '长度在 11 个字符', trigger: 'blur'},
            		   {validator: checkMobile,trigger: 'blur'}
            ]
    	},
    	// 控制修改用户对话框的显示和隐藏
    	changeDialogVisible:false,
    	// 查询到用户信息对象
    	changeForm:{},
    	changeFormRules:{
    			email:[
            		   { required: true, message: '请输入邮箱', trigger: 'blur' },
            		   { max: 20, message: '长度在 5 到 20 个字符', trigger: 'blur'},
            		   {validator: checkEmail,trigger: 'blur'}
            		],
            	mobile:[
            		   { required: true, message: '请输入手机号', trigger: 'blur' },
            		   { max:11, message: '长度在 11 个字符', trigger: 'blur'},
            		   {validator: checkMobile,trigger: 'blur'}
            	]
    	},
      // 分配角色的对话框显示隐藏
      setRolesDialogVisible:false,
      // 需要被分配的当前角色信息
      userInfo:{},
      // 所有角色的数据列表
      rolesList:[],
      // 已选中的id值
      selectedRoleId:''
    }
  },
  created(){
  	this.getUserList();
  },
  methods:{
  	async getUserList(){
  		const {data:res} = await this.$http.get('users',{ params:this.queryInfo });
  		if (res.meta.status!==200) {
  			return this.$message.error('获取用户列表失败');
  		} else {
  			this.usersList = res.data.users;
  			this.total = res.data.total;
  		}
  	},
  	handleSizeChange(newSize){
  		this.queryInfo.pagesize = newSize;
  		this.getUserList();
  	},
  	handleCurrentChange(newPage){
  		this.queryInfo.pagenum = newPage;
  		this.getUserList();
  	},
  	async userStateChange(userInfo){
  		const {data:res} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`);
  		if (res.meta.status!==200) {
  			userInfo.mg_stase =!userInfo.mg_stase;
  			return this.$message.error('更新用户失败!');
  		} else {
  			this.$message.success('更新用户成功!');		
  		}
  	},
  	dialogClosed(){
  		this.$refs.addFormRef.resetFields();
  	},
  	// 点击 添加新用户
  	addUser(){
  		this.$refs.addFormRef.validate(async valid=>{
	  		if (!valid) return;
	  		const {data:res} = await this.$http.post('users',this.addForm);
	  		if (res.meta.status!==201) {
	  			this.$message.error('添加用户失败!');
	  		} else {
	  			this.$message.success('添加用户成功!');
	  			// 对话框 隐藏
	  			this.dialogVisible = false;
	  			this.getUserList();
	  		}
	  	})
  	},
  	async changeDialog(id){
  		this.changeDialogVisible = true;
  		const {data:res} = await this.$http.get(`users/${id}`);
  		if (res.meta.status!==200) {
	  			this.$message.error('修改用户失败!');
	  		} else {
	  			this.changeForm = res.data;
	  			// 对话框 显示
	  			this.changeDialogVisible = true;
	  		}
  	},
  	offChangeForm(){
  		this.$refs.changeFormRef.resetFields();
  	},
  	// 修改用户信息 并提交
  	changeUserInfo(){
  		this.$refs.changeFormRef.validate(async valid =>{
  			if (!valid) return;
  				const {data:res} = await this.$http.put(`users/${this.changeForm.id}`,
  				{email:this.changeForm.email,mobile:this.changeForm.mobile});
  			if (res.meta.status!==200) {
	  			this.$message.error('更新用户信息失败!');
	  		} else {
	  			// 对话框 隐藏
	  			this.changeDialogVisible = false;
	  			// 刷新
	  			this.getUserList();
	  			this.$message.success('更新用户信息成功!');
	  		}
  		})
  	},
  	// 根据Id删除对应的用户信息
  	async removeUserById(id){
  		const confirmRes = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(() => this.$message.info('已取消删除！'));
        if (confirmRes==='confirm') {
        	const {data:res} = await this.$http.delete(`users/${id}`);
        	if (res.meta.status!==200) {
	  			this.$message.error('删除用户失败!');
	  		} else {
	  			this.$message.success('删除用户成功!');
	  			this.getUserList();
	  		}
      }
  	},
    // 分配角色按钮事件
    async setRoles(userInfo){
      this.userInfo = userInfo;
      // 角色列表请求
      const {data:res} = await this.$http.get('roles');
      if (res.meta.status!==200) {
          this.$message.error('获取角色列表失败!');
        } else {
          this.rolesList = res.data;
        }
      this.setRolesDialogVisible = true;
    },
    // 点击确定按钮 =>分配角色
    async saveRolesInfo(){
      if (!this.selectedRoleId) {
          this.$message.error('请选择分配的角色!');
        } else {
          const {data:res} = await this.$http.
          put(`users/${this.userInfo.id}/role`,{ rid:this.selectedRoleId });
          if(res.meta.status!==200){
            return this.$message.error('分配用户角色失败!');
          } 
            this.$message.success('分配用户角色成功!');
            this.getUserList();
            this.setRolesDialogVisible = false;
        } 
    },
    // 关闭分配对话框的重置
    offSetRoles(){
      this.selectedRoleId = '';
      this.userInfo = {};
    }
  }
};
</script>

<style lang="css" scoped>

</style>