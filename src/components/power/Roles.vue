<template>
	<div>
		<!-- 面包屑导航区域 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
		  <el-breadcrumb-item>权限管理</el-breadcrumb-item>
		  <el-breadcrumb-item>角色列表</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 卡片视图 -->
		<el-card>
			<!-- 添加角色按钮区 -->
			<el-row>
  				<el-col :span="24">
					<el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
  				</el-col>
			</el-row>
			<el-table :data="rolesList" border style="width:100%" stripe>
          <!-- 展开列 -->  
         <el-table-column type="expand">
         <template v-slot="scope">
            <el-row v-for="(item1,in1) in scope.row.children" :key="item1.id" 
            :class="['bdbottom',in1===0 ? 'bdtop':'']">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag>{{item1.authName}}</el-tag>
                <i class="el-icon-d-arrow-right"></i>
              </el-col>
              <!-- 渲染二级权限 -->
              <el-col :span="19">
                <el-row v-for="(item2,in2) in item1.children" :key="item2.id" 
                :class="[in2===0 ?'':'bdtop']">
                  <el-col :span="6">
                    <el-tag type="success">{{item2.authName}}</el-tag>
                    <i class="el-icon-d-arrow-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag v-for="(item3,in3) in item2.children" :class="[in3===0 ?'':'bdtop']"
                    :key="item3.id" type="warning" closable @close="handleClose(scope.row,item3.id)">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
         </template>
         </el-table-column>  
          <!-- 索引列 -->
			   <el-table-column type="index"/>
			   <el-table-column prop="roleName" label="角色名称"></el-table-column>
			   <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
				 <el-table-column label="操作" width="300">
           <template v-slot="scope">
             <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
             <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
             <el-button type="warning" icon="el-icon-s-tools" size="mini" 
             @click="setRightsDialog(scope.row)">分配权限</el-button>          
           </template>
         </el-table-column>
      </el-table>
		</el-card>
    <!-- 分配权限的对话框 -->
    <el-dialog title="分配权限" :visible.sync="setDialogVisible" width="50%" @close="closeTreeDialog">
      <!-- 树形控件 -->
      <el-tree :data="rightsTree" :props="treeProps" show-checkbox node-key="id"
      :default-checked-keys="delKeys" ref="treeRef" default-expand-all/>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRolesByid">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加角色的对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="closeAddDialog">
      <el-form :model="addForm" ref="addFormRef" label-width="70px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName" placeholder="请输入角色名称"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc" placeholder="请输入角色描述"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>
  </div>  
</template>

<script>
export default {
  name: 'Roles',
  data () {
    return {
      rolesList:[],
      setDialogVisible:false,
      // 所有权限数据树
      rightsTree:[],
      // 树形控件的属性绑定对象
      treeProps:{
        label:'authName',
        children:'children'
      },
      // 默认选中的节点ID值数组
      delKeys:[],
      //当前即将分配角色的ID
      roleId:'',
      // 添加角色的对话框显示隐藏
      addDialogVisible:false,
      addForm:{
        roleName:'',
        roleDesc:''
      }
    }
  },
  methods:{
  	// 网络请求函数获取权限列表
  	async getRolesList(){
  		const {data:res} = await this.$http.get('roles');
  		if (res.meta.status!==200) {
  			return this.$message.error('获取角色列表失败!');
  		} else {
  			this.rolesList = res.data;
  		}
  	},
    async handleClose(roleId,rightsId){
        const confirmRes = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(() => this.$message.info('已取消删除！'));
        if (confirmRes==='confirm') {
          const {data:res} = await this.$http.delete(`roles/${roleId.id}/rights/${rightsId}`);
          if (res.meta.status!==200) {
          this.$message.error('删除权限失败!');
        } else {
          this.$message.success('删除权限成功!');
          this.getUserList();
        }
      }
    },
    // 分配权限的对话框
    async setRightsDialog(role){
      this.roleId = role.id;
      // 获取所有权限列表
      const {data:res} = await this.$http.get('rights/tree');
      if (res.meta.status!==200) {
          this.$message.error('获取权限数据失败!');
        } else {
          this.rightsTree = res.data;           
          this.getLeafKeys(role,this.delKeys);
          this.$message.success('获取权限数据成功!');
        }    
      this.setDialogVisible = true;
    },
    //递归形式,获取角色下所有三级权限的ID,并保存到 delKeys 数组中
    getLeafKeys(node,arr){
      if (!node.children) {
        return arr.push(node.id);
      }else{
        node.children.forEach(item =>{
        this.getLeafKeys(item,arr);
        }); 
      }
    },
    //关闭 树状对话框重复事件
    closeTreeDialog(){
      this.delKeys = [];
    },
    async setRolesByid(){
      // 全选中和半选中
      const keys = [...this.$refs.treeRef.getCheckedKeys(),
                    ...this.$refs.treeRef.getHalfCheckedKeys()];
      const idStr = keys.join(',');
      const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{ rids:idStr });
      if (res.meta.status!==200) {
          this.$message.error('分配权限失败!');
        } else {
          this.$message.success('分配权限成功!');
          this.getRolesList();
          this.setDialogVisible = false;
        }    
    },
    // 关闭添加角色对话框重置
    closeAddDialog(){
      this.$refs.addFormRef.resetFields();
    },
    addRoles(){
      this.$refs.addFormRef.validate(async valid=>{
        if (!valid) return;
        const {data:res} = await this.$http.post('roles',this.addForm);
        if (res.meta.status!==201) {
          this.$message.error('添加角色失败!');
        } else {
          this.$message.success('添加角色成功!');
          // 对话框 隐藏
          this.addDialogVisible = false;
          this.getRolesList();
        }
      })
    }
  },
  created(){
  	this.getRolesList();
  }
};
</script>

<style lang="css" scoped>

</style>