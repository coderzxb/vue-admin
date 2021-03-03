<template>
	<div>
		<!-- 面包屑导航区域 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
		  <el-breadcrumb-item>商品管理</el-breadcrumb-item>
		  <el-breadcrumb-item>商品分类</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 卡片视图 -->
		<el-card>
			<!-- 添加分类按钮区 -->
			<el-row>
  				<el-col :span="24">
					<el-button type="primary" @click="showAddDialog">添加分类</el-button>
  				</el-col>
			</el-row>
			<!-- 表格区 -->
			<tree-table :data="cateList" :columns="columns" :selection-type="false" :expand-type="false"
			class="tree_table" show-index border>
				<!-- 是否有效 -->
				<template v-slot:isok="scope">
		          <i class="el-icon-success" style="color: lightgreen" 
		          v-if="scope.row.cat_deleted === false"></i>
		          <i class="el-icon-error" style="color: red" v-else></i>
		      	</template>
		      	<!-- 排序 -->
		      	<template v-slot:order="scope">
		          <el-tag v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
				  <el-tag type="success" v-else-if="scope.row.cat_level === 1" size="mini">二级</el-tag>
				  <el-tag type="warning" v-else size="mini">三级</el-tag>
		      	</template>
		      	<!-- 操作 -->
				    <template v-slot:opt="scope">
		          <el-button type="primary" icon="el-icon-edit" size="mini" 
              @click="changeCateById(scope.row.cat_id)">编辑</el-button>
		          <el-button type="danger" icon="el-icon-delete" size="mini" 
              @click="removeCateById(scope.row.cat_id)">删除</el-button>
		      	</template>
			</tree-table>
			<!-- 分页区 -->
			<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
		      :current-page="queryInfo.pagenum"
		      :page-sizes="[3, 5, 10, 15]"
		      :page-size="queryInfo.pagesize"
		      layout="total, sizes, prev, pager, next, jumper"
		      :total="total">
		    </el-pagination>
		    <!-- 添加分类对话框 -->
		    <el-dialog title="添加分类" :visible.sync="addDialogVisible" width="50%" @close="CateDialogClose">
  			  <el-form :model="addCateForm" ref="addCateFormRef" label-width="75px">
    				<el-form-item label="分类名称:" prop="cat_name">
      				<el-input v-model="addCateForm.cat_name" placeholder="必须输入分类名称"></el-input>
    				</el-form-item>
    				<el-form-item label="父级分类:">
      				<el-cascader v-model="selectedKeys" placeholder="请输入"
      				:options="parentCateList" :props="cascaderProps" @change="parentCateChange">
      				</el-cascader>
    				</el-form-item>
    			</el-form>
  			  <span slot="footer" class="dialog-footer">
  			    <el-button @click="addDialogVisible = false">取 消</el-button>
  			    <el-button type="primary" @click="addCategory">确 定</el-button>
  			  </span>
			</el-dialog>
      <!-- 编辑分类对话框 -->
      <el-dialog title="修改分类" :visible.sync="changeDialogVisible" width="50%" @close="changeDialogClose">
          <el-form :model="changeCateForm" ref="changeCateFormRef" label-width="75px">
            <el-form-item label="分类名称:" prop="cat_name">
              <el-input v-model="changeCateForm.cat_name" placeholder="必须输入分类名称"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="changeDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="sureChangeCate">确 定</el-button>
          </span>
      </el-dialog>
		</el-card>
	</div>
</template>

<script>
export default {
  name: 'Category',

  data () {
    return {
    	cateList:[],
    	// 查询参数
    	queryInfo:{
    		type:3,
    		pagenum:1,
    		pagesize:5 
    	},
    	// 总条数
    	total:0,
    	columns:[
    		{
	          label: '分类名称',
	          prop: 'cat_name'
	      	},
	      	{
	          label: '是否有效',
	          // 表示将当前列定义为模板列
	          type: 'template',
	          // 表示当前这一列的模板名称
	          template: 'isok'
	        },
	      	{
	          label: '排序',
	          // 表示将当前列定义为模板列
	          type: 'template',
	          // 表示当前这一列的模板名称
	          template: 'order'
	        },
	      	{
	          label: '操作',
	          // 表示将当前列定义为模板列
	          type: 'template',
	          // 表示当前这一列的模板名称
	          template: 'opt'
	        }	
    	],
    	addDialogVisible:false,
    	// 添加分类的表单数据对象
    	addCateForm:{
    		cat_name:'',
    		// 父分类 Id
    		cat_pid:0,
    		// `0`表示一级分类
    		cat_level:0
    	},
    	parentCateList:[],
    	cascaderProps:{
    		value:'cat_id',
    		label:'cat_name',
    		children:'children',
    		expandTrigger:'hover',
    		checkStrictly:true
    	},
    	// 选中的父级分类的ID数组
    	selectedKeys:[],
      // 编辑对话框显示与隐藏
      changeDialogVisible:false,
      // 查询到分类信息对象
      changeCateForm:{}
    }
  },
  created() {
  	this.getCateList();
  },
  methods: {
  	// 获取商品分类数据网络请求
  	async getCateList(){
  		const {data:res} = await this.$http.get('categories',{ params:this.queryInfo });
  		if (res.meta.status!==200) {
  			return this.$message.error('获取商品分类失败!');
  		} else {
  			this.cateList = res.data.result;
  			this.total = res.data.total;
  		}
  	},
  	// 监听pagesize改变事件
  	handleSizeChange(newSize){
  		this.queryInfo.pagesize = newSize;
  		this.getCateList();
  	},
  	// 页码值改变事件
  	handleCurrentChange(newPage){
  		this.queryInfo.pagenum =  newPage;
  		this.getCateList();
  	},
  	// 添加分类按钮事件
  	showAddDialog(){
  		// 先获取父级分类列表 => 再显示对话框
  		this.getParentCateList();
  		this.addDialogVisible = true;
  	},
  	// 获取父级分类2数据网络请求
  	async getParentCateList(){
  		const {data:res} = await this.$http.get('categories',{ params:{type:2} });
  		if (res.meta.status!==200) {
  			return this.$message.error('获取父级分类失败!');
  		} else {
  			this.parentCateList = res.data;	
  		}
  	},
  	// 选中项发生变化触发
  	parentCateChange(){
  		// 如果 selectedKeys 数组中的 length 大于0,证明选中的父级分类;反之就是没有选中父级
  		if (this.selectedKeys.length > 0) {
  			// 父级分类的ID
  			this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length-1];
  			// 当前分类的等级赋值
  			this.addCateForm.cat_level = this.selectedKeys.length;
  			return;
  		} else {
  			this.addCateForm.cat_pid = 0;
  			this.addCateForm.cat_level = 0;
  		}
  	},
  	// 添加新分类对话框确定事件
  	addCategory(){
  		this.$refs.changeCateFormRef.validate(async valid=>{
  			if (!valid) return;
  			const {data:res} = await this.$http.post('categories',this.addCateForm);
	  			if (res.meta.status!==201) {
	  				return this.$message.error('添加分类失败!');
	  			} else {
	  				this.$message.success('添加分类成功!');
	  				this.getCateList();
	  				this.addDialogVisible = false;
	  			}
  		})
  	},
  	// 对话框关闭重置表单数据
  	CateDialogClose(){
  		this.$refs.addCateFormRef.resetFields();
  		this.selectedKeys = [];
  		this.addCateForm.cat_level = 0;
  		this.addCateForm.cat_pid = 0;
  	},
    // 根据id查询分类对象
    async changeCateById(id){
      this.changeDialogVisible = true;
      const {data:res} = await this.$http.get(`categories/${id}`);
      if (res.meta.status!==200) {
          this.$message.error('修改分类失败!');
        } else {
          this.changeCateForm = res.data;
          // 对话框 显示
          this.changeDialogVisible = true;
        }
    },
     // 确定按钮修改分类对象
    sureChangeCate(){
      this.$refs.changeCateFormRef.validate(async valid =>{
        if (!valid) return;
          const {data:res} = await this.$http.put(`categories/${ this.changeCateForm.cat_id }`,
            { cat_name:this.changeCateForm.cat_name });
            if (res.meta.status!==200) {
              this.$message.error('修改分类失败!');
            } else {
              // 对话框 隐藏
              this.changeDialogVisible = false;
              // 刷新
              this.getCateList();
              this.$message.success('更新分类信息成功!'); 
            }
      })
    },
    changeDialogClose(){
      this.$refs.changeCateFormRef.resetFields();
    },
    // 根据id删除分类
    async removeCateById(id){
      const confirmRes = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(() => this.$message.info('已取消删除！'));
        if (confirmRes === 'confirm') {
          const {data:res} = await this.$http.delete(`categories/${id}`);
          if (res.meta.status!==200) {
          this.$message.error('删除分类失败!');
        } else {
          this.$message.success('删除分类成功!');
          this.getCateList();
        }
      }
    }
  } 
};
</script>

<style lang="css" scoped>
	.tree_table{
		margin-top: 15px;
	}
	.el-cascader{
		width: 100%;
	}
</style>