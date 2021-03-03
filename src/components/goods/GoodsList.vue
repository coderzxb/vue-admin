<template>
	<div>
		<!-- 面包屑导航区域 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
		  <el-breadcrumb-item>商品管理</el-breadcrumb-item>
		  <el-breadcrumb-item>商品列表</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 卡片视图区域 -->
		<el-card>
			<el-row :gutter="20">
			  <el-col :span="10">
				<el-input placeholder="请输入内容" clearable v-model="queryInfo.query" @clear="getGoodsList">
	    			<el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
	  			</el-input>
			  </el-col>
			  <el-col :span="4">
				<el-button type="primary" @click="goAddPage">添加商品 ></el-button>
			  </el-col>
			</el-row>
      <!-- 商品table表格区域 -->
      <el-table :data="goods" border stripe>           
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="goods_name" label="商品名称" width="480px"></el-table-column>
            <el-table-column prop="goods_price" label="商品价格(元)" width="100px"></el-table-column>
            <el-table-column prop="goods_weight" label="商品重量" width="75px"></el-table-column>
            <el-table-column prop="add_time" label="创建时间" width="165px">
              <template v-slot="scope">
                {{scope.row.add_time | dateFormat}}
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
              <el-button type="primary" size="mini" icon="el-icon-edit" width="80px"></el-button>
              <el-button type="danger" size="mini" icon="el-icon-delete" 
              @click="reduceGoods(scope.row.goods_id)"></el-button>
              </template>
            </el-table-column>
      </el-table>
      <!-- 底部頁碼 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" 
        :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15, 30]" :page-size="queryInfo.pagesize" 
        layout="total, sizes, prev, pager, next, jumper" :total="total" background>
      </el-pagination>
		</el-card>
	</div>
</template>

<script>
export default {

  name: 'GoodsList',

  data () {
    return {
    	// 查询参数对象
    	queryInfo:{
    		query:'',
    		pagenum:1,
    		pagesize:10
    	},
      goods:[],
      // 总数据条数
      total:0,
    }
  },
  created(){
  	this.getGoodsList();
  },
  methods:{
  	async getGoodsList() {
  		const {data:res} = await this.$http.get('goods',{ params:this.queryInfo });
  		if (res.meta.status!==200) {
  			return this.$message.error('获取用户列表失败');
  		} else {
  			this.goods = res.data.goods;
        this.total =  res.data.total;
        this.$message.success('获取商品列表成功!');
  		}
  	},
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getGoodsList();
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
       this.getGoodsList();
    },
    async reduceGoods(id) {
      const confirmRes = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(() => this.$message.info('已取消删除！'));
        if (confirmRes === 'confirm') {
          const {data:res} = await this.$http.delete(`goods/${id}`);
          if (res.meta.status!==200) {
          this.$message.error('删除商品失败!');
        } else {
          this.$message.success('删除商品成功!');
          this.getGoodsList();
        }
      }
    },
    goAddPage() {
      this.$router.push('/goods/add');
      
    }
  }
};
</script>

<style lang="css" scoped>
</style>