<template>
	<div>
		<!-- 面包屑导航区域 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
		  <el-breadcrumb-item>订单管理</el-breadcrumb-item>
		  <el-breadcrumb-item>订单列表</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 卡片视图区域 -->
		<el-card>
			<el-row>
			  <el-col :span="10">
				<el-input placeholder="请输入内容" clearable v-model="queryInfo.query">
	    			<el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
	  			</el-input>
			  </el-col>
			</el-row>
			<!-- table订单列表数据 -->
			<el-table :data="orderList" border stripe>
				<el-table-column type="index"></el-table-column>
				<el-table-column label="订单编号" prop="order_number"></el-table-column>
				<el-table-column label="订单价格" prop="order_price" width="100px"></el-table-column>
				<el-table-column label="是否付款" prop="pay_status" width="120px">
					<template v-slot="scope">
						<el-tag v-if="scope.row.pay_status==='1'" type="success">已付款</el-tag>
						<el-tag v-else>未付款</el-tag>
					</template>
				</el-table-column>
				<el-table-column label="是否发货" prop="is_send" width="85px"></el-table-column>
				<el-table-column label="下单时间" prop="create_time">
					<template v-slot="scope">{{scope.row.create_time | dateFormat}}</template>
				</el-table-column>
				<template>
					<el-table-column label="操作">
						<el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox">
						</el-button>
						<el-button type="success" icon="el-icon-location-information" size="mini"
						@click="showProgress"></el-button>
					</el-table-column>
				</template>
			</el-table>
			<!-- 底部頁碼 -->
		    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" 
		    :current-page="queryInfo.pagenum" :page-sizes="[10, 15, 20, 25]" :page-size="queryInfo.pagesize" 
		       layout="total, sizes, prev, pager, next, jumper" :total="total" background>
		    </el-pagination>
		</el-card>
		<!-- 展示修改地址的对话框 -->
		<el-dialog title="修改地址" :visible.sync="addressVisible" width="50%" @close="addressClose">
			<el-form :model="addressForm" :rules="addressRules" ref="addressRef" label-width="100px">
				<el-form-item label="省市区/县" prop="address1">
					<el-cascader :options="cityData" v-model="addressForm.address1"
					:props="{ expandTrigger: 'hover' }"></el-cascader>
				</el-form-item>
				<el-form-item label="详细地址" prop="address2">
					<el-input v-model="addressForm.address2"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="addressVisible = false">取 消</el-button>
				<el-button type="primary" @click="addressVisible = false">确 定</el-button>
			</span>
	</el-dialog>
	<!-- 物流进度对话框 -->
	<el-dialog title="物流进度" :visible.sync="progressDV" width="50%">
		<el-timeline>
			<el-timeline-item color="#1893f2" icon="el-icon-location"
			v-for="(activity, index) in progressInfo"
			:key="index"
			:timestamp="activity.time">
				{{activity.context}}
			</el-timeline-item>
		</el-timeline>	
	</el-dialog>
	</div>
</template>
<script>
import cityData from './citydata.js';
import progressInfo from './progressInfo.js';

export default {
  name: 'Order',
  data () {
    return {
    	queryInfo: {
    		query: '',
    		pagenum: 1,
    		pagesize: 10
    	},
    	orderList: [],
    	total: 0,
    	addressVisible: false,
    	addressForm: {
    		address1: [],
    		address2: ''
    	},
    	addressRules: {
    		address1: [
    				{ required: true, message: '请选择省市区县', trigger: 'blur' }
    		],
    		address2: [
    				{ required: true, message: '请输入详细地址', trigger: 'blur' }
    		]
    	},
    	cityData,
    	progressDV:false,
    	// 物流进度信息
    	progressInfo
    }
  },
  created() {
  	this.getOrderList();
  },
  methods:{
  	// 获取订单列表的网络请求
  	async getOrderList() {
  		const { data:res } = await this.$http.get('orders',{ params:this.queryInfo });
  		if (res.meta.status !== 200) {
  			return this.$message.error('获取订单数据失败！')
  		} else {
  			this.orderList = res.data.goods;
  			this.total = res.data.total;
  		}
  	},
  	handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrderList();
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
       this.getOrderList();
    },
    // 展示修改地址的对话框
    showBox() {
    	this.addressVisible = true;

    },
    addressClose() {
    	this.$refs.addressRef.resetFields();
    },
    // 物流进度
    async showProgress(){
    // 	const { data:res } = await this.$http.get('/kuaidi/1106975712662');
    // 	if (res.meta.status !== 200) {
  		// 	return this.$message.error('获取物流进度失败！')
  		// } else {
  		// 	this.progressInfo = res.data;
  		// }
  		this.$message.success('获取物流进度成功！')
    	this.progressDV = true;
    }
  }
};
</script>

<style lang="css" scoped>
.el-cascader{
	width: 100%;
}
</style>