<template>
	<div>
		<!-- 面包屑导航区域 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
		  <el-breadcrumb-item>商品管理</el-breadcrumb-item>
		  <el-breadcrumb-item>参数列表</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 卡片视图 -->
		<el-card>
			<!-- 警告区域 -->
			<el-alert title="注意：只允许为第三级分类设置相关参数！" 
			type="warning" show-icon :closable="false"></el-alert>
			<!-- 选择商品区域 -->
			<el-row>
				<el-col>
					<span>选择商品分类：</span>
					<!-- 级联选择框 -->
					<el-cascader v-model="selectedKeys" :options="cateList" @change="handleChange"
					:props="{ expandTrigger:'hover', label:'cat_name', value:'cat_id', children:'children'}">
					</el-cascader>
				</el-col>
			</el-row>
			<!-- tab 页签区域 -->
			<el-tabs v-model="activeName" @tab-click="tabsClick">
			    <el-tab-pane label="动态参数" name="many">
					<el-button type="primary" :disabled="this.selectedKeys.length !== 3"
					 size="mini" @click="addParamsDV = true">添加参数</el-button>
					<!-- 动态参数表格 -->
					<el-table :data="manyTableData" border>
						<!-- 展开行 -->
						<el-table-column type="expand">
							<template v-slot="scope">
								<!-- 循环渲染tab标签 -->
								<el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable
								@close="tabReduce(i,scope.row)">{{item}}</el-tag>
								<!-- 输入的文本框 -->
								<el-input class="input-new-tag" v-if="scope.row.inputVisible"
									v-model="scope.row.inputValue" ref="saveTagInput" size="small" 
									@keyup.enter.native="handleInputConfirm(scope.row)" 
									@blur="handleInputConfirm(scope.row)">
								</el-input>
								<!-- 确定按钮 -->
								<el-button v-else class="button-new-tag" size="small"
					 			@click="showInput(scope.row)">+ New Tag</el-button>
							</template>
						</el-table-column>
						<!-- 索引列 -->
						<el-table-column type="index"></el-table-column>
						<el-table-column prop="attr_name" label="参数名称"></el-table-column>
						<el-table-column label="操作">
							<template v-slot="scope">
							<el-button type="primary" size="mini" icon="el-icon-edit" 
							@click="changeDialog(scope.row.attr_id)">编辑</el-button>
							<el-button type="danger" size="mini" icon="el-icon-delete"
							@click="removeParamsById(scope.row.attr_id)">删除</el-button>
							</template>
						</el-table-column>
					</el-table>
			    </el-tab-pane>
			    <el-tab-pane label="静态属性" name="only">
					<el-button type="primary" :disabled="this.selectedKeys.length !== 3" 
					@click="addParamsDV = true" size="mini">添加属性</el-button>
					<!-- 静态属性表格 -->
					<el-table :data="onlyTableData" border>
						<!-- 展开行 -->
						<el-table-column type="expand">
							<template v-slot="scope">
								<!-- 循环渲染tab标签 -->
								<el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable
								@close="tabReduce(i,scope.row)">{{item}}</el-tag>
								<!-- 输入的文本框 -->
								<el-input class="input-new-tag" v-if="scope.row.inputVisible"
									v-model="scope.row.inputValue" ref="saveTagInput" size="small" 
									@keyup.enter.native="handleInputConfirm(scope.row)" 
									@blur="handleInputConfirm(scope.row)">
								</el-input>
								<!-- 确定按钮 -->
								<el-button v-else class="button-new-tag" size="small"
					 			@click="showInput(scope.row)">+ New Tag</el-button>
							</template>
						</el-table-column>
						<!-- 索引列 -->
						<el-table-column type="index"></el-table-column>
						<el-table-column prop="attr_name" label="属性名称"></el-table-column>
						<el-table-column label="操作">
							<template v-slot="scope">
							<el-button type="primary" size="mini" icon="el-icon-edit"
							@click="changeDialog(scope.row.attr_id)">编辑</el-button>
							<el-button type="danger" size="mini" icon="el-icon-delete"
							@click="removeParamsById(scope.row.attr_id)">删除</el-button>
							</template>
						</el-table-column>
					</el-table>
			    </el-tab-pane>
			</el-tabs>
		</el-card>
		<!-- 添加参数对话框 -->
		<el-dialog :title="this.activeName === 'many'?'添加动态参数':'添加静态属性'" 
		:visible.sync="addParamsDV" width="50%" @close="paramsDialogClose">
  			<el-form :model="addParamsForm" ref="paramsRef" label-width="80px" :rules="paramsRules">
    			<el-form-item :label="this.activeName==='many'?'动态参数':'静态属性'" prop="attr_name">
      				<el-input v-model="addParamsForm.attr_name"></el-input>
    			</el-form-item>
    		</el-form>
    		<span slot="footer" class="dialog-footer">
  			    <el-button @click="addParamsDV = false">取 消</el-button>
  			    <el-button type="primary" @click="addParams">确 定</el-button>
  			  </span>
    	</el-dialog>
    	<!-- 编辑参数对话框 -->
    	<el-dialog :title="this.activeName === 'many'?'修改动态参数':'修改静态属性'" 
		:visible.sync="changeParamsDV" width="50%" @close="changeDialogClose">
  			<el-form :model="changeParamsForm" ref="changeRef" label-width="80px" :rules="changeRules">
    			<el-form-item :label="this.activeName==='many'?'动态参数':'静态属性'" prop="attr_name">
      				<el-input v-model="changeParamsForm.attr_name"></el-input>
    			</el-form-item>
    		</el-form>
    		<span slot="footer" class="dialog-footer">
  			    <el-button @click="changeParamsDV = false">取 消</el-button>
  			    <el-button type="primary" @click="changeParams">确 定</el-button>
  			</span>
    	</el-dialog>
	</div>
</template>

<script>
export default {
  name: 'Params',
  data () {
    return {
    	cateList:[],
    	// 级联选择框保存的分类id数组
    	selectedKeys:[],
    	// 被激活的页签名称
    	activeName:'many',
    	// 动态参数数据
    	manyTableData:[],
    	// 静态属性数据
    	onlyTableData:[],
    	// 添加参数的对话框隐藏和显示
    	addParamsDV:false,
    	// 参数规则
    	paramsRules:{
    		attr_name:[ 
    				  { required: true, message: '请输入参数名称', trigger: 'blur' },
            		]
    	},
    	addParamsForm:{
    		attr_name:''
    	},
    	// 修改参数的对话框隐藏和显示
    	changeParamsDV:false,
    	// 修改的表单数据对象
    	changeParamsForm:{},
    	// 修改表单规则
    	changeRules:{
    		attr_name:[ 
    				  { required: true, message: '请输入参数名称', trigger: 'blur' },
            		]
    	}

    }
  },
  methods:{
  	// 请求分类列表所有数据
  	async getCateList(){
  		const {data:res} = await this.$http.get('categories');
  		if (res.meta.status!==200) {
  			return this.$message.error('获取所有商品分类失败!');
  		} else {
  			this.cateList = res.data;
  		}
  	},
  	// 级联选择框选中变化触发事件
  	handleChange(){
  		this.getParamsData();
  	},
  	// tabs 页签点击事件
  	tabsClick(){
  		this.getParamsData();
  	},
  	// 获取参数的列表数据
  	async getParamsData(){
  		// 证明选中的是三级分类
  		if (this.selectedKeys.length !== 3) {
  			this.selectedKeys = [];
  			this.manyTableData = [];
  			this.onlyTableData = [];
  			return;
  		}else {
  			// 三级分类：根据所选分类的id和所处面板,获取对应参数列表
  			const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,
  				{ params:{sel:this.activeName} });
  			if (res.meta.status!==200) {
  				return this.$message.error('获取参数列表失败!');
  			} else {
  				// 获取展开项 tabs 的attr_vals数据转为数组;再循环遍历
  				res.data.forEach(item => {
  					item.attr_vals = item.attr_vals ? item.attr_vals.split(' '):[];
  					item.inputValue = ''; //文本框显示与隐藏
  					item.inputVisible = false; //文本框输入的值
  				});
  				if (this.activeName === 'many') {
  					this.manyTableData = res.data;
  				} else {
  					this.onlyTableData = res.data;
  				}
  			}
  		}
  	},
  	// 点击确定按钮添加动态参数或者静态属性
  	addParams(){
  		this.$refs.paramsRef.validate(async valid=>{
  			if (!valid) return;
  			const {data:res} = await this.$http.post(`categories/${this.cateId}/attributes`,
  			{ attr_name:this.addParamsForm.attr_name,attr_sel:this.activeName });
	  			if (res.meta.status!==201) {
	  				return this.$message.error('添加参数失败!');
	  			} else {
	  				this.$message.success('添加参数成功!');
	  				this.getParamsData();
	  				this.addParamsDV = false;
	  			}
  		})
  	},
  	// 对话框关闭重置
  	paramsDialogClose(){
  		this.$refs.paramsRef.resetFields();
  	},
  	// 点击编辑 显示 动态参数/静态属性 对话框
  	async changeDialog(attr_id){
  		this.changeParamsDV = true;
  		// 查询当前参数的信息
  		const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`,
  				{ params:{attr_sel:this.activeName} });
  		if (res.meta.status!==200) {
  				return this.$message.error('获取参数信息失败!');
  			} else {
  				this.changeParamsForm = res.data;
  			}
  	},
  	// 编辑对话框关闭重置
  	changeDialogClose(){
  		this.$refs.changeRef.resetFields();
  	},
  	// 点击确定按钮修改参数信息
  	changeParams(){
  		this.$refs.changeRef.validate(async valid=>{
  			if (!valid) return;
  			const {data:res} = await this.$http
  			.put(`categories/${this.cateId}/attributes/${this.changeParamsForm.attr_id}`,
  			{ attr_name:this.changeParamsForm.attr_name , attr_sel:this.activeName });
	  			if (res.meta.status!==200) {
	  				return this.$message.error('修改参数失败!');
	  			} else {
	  				this.$message.success('修改参数成功!');
	  				this.getParamsData();
	  				this.changeParamsDV = false;
	  			}
  		})
  	},
  	 // 根据id删除对应的参数项
  	async removeParamsById(attr_id){
  		const confirmRes = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(() => this.$message.info('已取消删除！'));
        if (confirmRes === 'confirm') {
          const {data:res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`);
          if (res.meta.status!==200) {
          this.$message.error('删除参数失败!');
        } else {
          this.$message.success('删除参数成功!');
          this.getParamsData(); //刷新参数列表
        }
      }
  	},
  	// 点击确定按钮 展示输入文本框
  	showInput(row){
  		row.inputVisible = true;
  		// 让文本框自动获取焦点
  		this.$nextTick(() => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
  	},  	
  	// 文本框失去焦点,或按下 Enter 都会触发
  	async handleInputConfirm(row){
  		if (row.inputValue.trim().length === 0) {
  			row.inputValue = '';
  			row.inputVisible = false;
  			return;
  		}else{
  			row.attr_vals.push(row.inputValue.trim());
  			row.inputValue = '';
  			row.inputVisible = false;
  			// 需要发送网络请求, 保存这次操作
  			const { data:res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{
  				attr_name: row.attr_name,
  				attr_sel: row.attr_sel,
  				attr_vals: row.attr_vals.join(' ')
  			});
  			if (res.meta.status!==200) {
          		this.$message.error('添加参数项失败!');
        	} else {
          		this.$message.success('添加参数项成功!');
        	}
  		}
  	},
  	// tab删除attr_val数组参数项
  	async tabReduce(i,row){
  		row.attr_vals.splice(i,1);
  		// 发送请求保存在数据库
  		const { data:res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{
  				attr_name: row.attr_name,
  				attr_sel: row.attr_sel,
  				attr_vals: row.attr_vals.join(' ')
  			});
  			if (res.meta.status!==200) {
          		this.$message.error('删除参数项失败!');
        	} else {
          		this.$message.success('删除参数项成功!');
        	}
  	}
  },
  created(){
  	this.getCateList();
  },
  computed:{
  	cateId(){
  		if (this.selectedKeys.length === 3) {
  			return this.selectedKeys[2];	
  		}
  		return null; 		
  	}
  }
};
</script>

<style lang="css" scoped>
.input-new-tag{
	width: 150px;
}
</style>