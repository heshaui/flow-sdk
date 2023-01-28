<template>
  <div id="app">
    <el-form :model="form">
        <el-row :gutter="20">
            <el-col :span="6" :xs="12">
                <el-form-item>
                    <el-input v-model="form.name" placeholder="模版名称" />
                </el-form-item>
            </el-col>
            <el-col :span="6" :xs="12" align="left">
                <el-button type="primary" plain @click="onSearch">搜 索</el-button>
                <el-button type="danger" plain @click="onReset">重 置</el-button>
            </el-col>
            <el-col :span="12" :xs="24" align="right">
                <el-button type="primary" plain round size="small" @click="toDetail(null, '')">新建模版</el-button>
            </el-col>
        </el-row>
    </el-form>
    <div class="noticeCard">
        <el-row :gutter="20">
            <el-col v-for="(item, key) in temList.records" :key="key" :span="8" :xs="24">
                <div class="voiceCard">
                    <div class="cardHead">
                        <div class="cardTop">
                            <div class="card-title">
                                {{ item.name }}
                            </div>
                            <!--模板 状态 -->
                            <div v-for="v in statusList" :key="v.value" class="position-right">
                                <el-tag v-if="item.status === v.value" :type="v.type" size="small" close-transition>
                                    {{ v.label }}
                                </el-tag>
                            </div>
                        </div>
                        <p>模 版 SN: {{ item.id }}</p>
                        <p>创建时间: {{ item.ctime ? item.ctime : '' }}</p>
                        <p>更新时间: {{ item.utime ? item.utime : '' }}</p>
                    </div>
                    <div class="cardContent">
                        <el-alert v-if="item.status !== 4" type="info" :description="item.descr" :closable="false" style="overflow: auto;" />
                        <el-alert v-else type="info" :description="'['+'不通过原因'+']： ' + (item.descr && item.descr !== null ? item.descr : '')" :closable="false" style="overflow: auto;" />
                    </div>
                    <!-- v-for="v in toolList" :key="v.value" -->
                    <div class="cardFooter">
                        <!-- <div v-if="item.status === v.value" class="toolBox">
                            <el-button v-if="v.createTask" size="small" type="primary" plain round @click="creatTask(item, 'one')">
                                逐条发起
                            </el-button>
                            <el-button v-if="v.createTasks" size="small" type="primary" plain round @click="creatTask(item, 'batch')">
                                批量发起
                            </el-button>
                            <el-button v-if="v.taskDetail" size="small" type="primary" plain round>
                                任务明细
                            </el-button>
                            <el-button v-if="v.editTemplate" size="small" type="primary" plain round :disabled="item.isedit" @click="toDetail(item, 'edit')">
                                编辑
                            </el-button>
                            <el-button v-if="v.viewTemplate" size="small" type="primary" plain round @click="toDetail(item, 'detail')">
                                查看
                            </el-button>
                        </div> -->
                        <div class="toolBox">
                            <el-button size="small" type="primary" plain round @click="creatTask(item, 'one')">
                                逐条发起
                            </el-button>
                            <el-button size="small" type="primary" plain round @click="creatTask(item, 'more')">
                                批量发起
                            </el-button>
                            <el-button size="small" type="primary" plain round @click="toTaskList(item.id, item.name)">
                                任务明细
                            </el-button>
                            <el-button size="small" type="primary" plain round :disabled="item.isedit" @click="toDetail(item, 'edit')">
                                编辑流程
                            </el-button>
                            <el-button size="small" type="primary" plain round :disabled="item.isedit" @click="toDetailTemplate(item)">
                                编辑模版
                            </el-button>
                            <el-button size="small" type="primary" plain round @click="toDetail(item, 'detail')">
                                查看
                            </el-button>
                            <el-button size="small" type="danger" plain round @click="delIvr(item.id)">
                                删除模版
                            </el-button>
                        </div>
                    </div>
                </div>
            </el-col>
        </el-row>
    </div>
    <!-- 分页 -->
    <div v-if="temList.total > 9" class="pagination">
        <el-pagination
            background
            :current-page="currentPage"
            :page-sizes="[9, 18, 36]"
            :page-size="pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="temList.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
    </div>
    <!-- 显示详情 -->
    <el-dialog v-if="detailDialog" id="ivrDesign" :visible.sync="detailDialog" :close-on-click-modal="false" width="100%">
        <div id="flowsdk" />
    </el-dialog>
  </div>
</template>

<script>
import { getIvrList, delIvrTem } from '@/api/ivrManage'
import { login } from '@/api/common'
import flowSdk from './flowSdk/index'
// import flowSdk from 'ivr-flow-sdk'
export default {
  data() {
      return {
          form: {
              name: ''
          },
          temList: {
              records: [],
              total: 0
          },
          statusList: [
              {
                  label: '草稿',
                  value: 1,
                  type: 'success'
              },
              {
                  label: '审批中',
                  value: 2,
                  type: 'success'
              },
              {
                  label: '已审批',
                  value: 3,
                  type: ''
              },
              {
                  label: '审批失败',
                  value: 4,
                  type: 'danger'
              }
          ],
          toolList: [
              {
                  value: 1,
                  editTemplate: {
                      isShow: true
                  },
                  viewTemplate: {
                      isShow: true
                  },
                  schedulingSetup: {
                      isShow: true
                  },
                  reviewTemplate: {
                      isShow: true
                  }
              },
              {
                  value: 2,
                  viewTemplate: {
                      isShow: true
                  },
                  schedulingSetup: {
                      isShow: true
                  },
                  editTemplate: {
                      isShow: true
                  }
              },
              {
                  value: 3,
                  createTask: {
                      isShow: true
                  },
                  createTasks: {
                      isShow: true
                  },
                  viewTemplate: {
                      isShow: true
                  },
                  taskDetail: {
                      isShow: true
                  },
                  schedulingSetup: {
                      isShow: true
                  },
                  editTemplate: {
                      isShow: true
                  }
              },
              {
                  value: 4,
                  editTemplate: {
                      isShow: true
                  },
                  viewTemplate: {
                      isShow: true
                  }
              }
          ],
          currentPage: 1,
          pagesize: 9,
          // 详情
          detailDialog: false,
          createVisible: false,
          ivrId: '',
          state: '',
          ivrData: null,
          currentTemplate: null,
          // 创建任务
          taskDialog: false,
          temId: '',
          temName: '',
          companyId: '',
          uploadType: '',
          listDialog: false,
          ivrParams: ''
      }
  },
  mounted() {
      this.login()
  },
  methods: {
      login() {
        login({
          username: 'weihu',
          password: 'MTIzNDU2'
        }).then(res => {
          localStorage.token = res.data.auth
          localStorage.companyId = res.data.companyId
          localStorage.userInfo = JSON.stringify(res.data.userInfo)
          this.getList()
        })
      },
      formatDate(time) {
          return time
          // return this.$dayjs(time).format('YYYY-MM-DD HH:mm:ss')
      },
      addTem() {
          this.currentTemplate = null
          this.createVisible = true
      },
      // 查询
      onSearch() {
          this.currentPage = 1
          this.getList()
      },
      onCreateTemplateOk() {
          this.createVisible = false
          this.currentPage = 1
          this.getList()
      },
      // 重置
      onReset() {
          this.form = this.$options.data().form
          this.currentPage = 1
          this.getList()
      },
      // 获取列表数据
      getList() {
          const params = {
              pageNo: this.currentPage,
              pageSize: this.pagesize
          }
          if (this.form.name) params.name = this.form.name
          getIvrList(params).then(res => {
              if (res.data) {
                  this.temList = res.data
              }
          })
      },
      // 编辑,查看
      toDetail(row, state) {
          this.detailDialog = true
          this.state = state
          setTimeout(() => {
              flowSdk.init({
                  el: '#flowsdk',
                  login: 'default',
                  id: row?.id ?? '',
                  state: state,
                  onClose: this.closeDetailDialog,
                  onSave: this.saveCloseDialog
              })
          })
      },
      // 删除表单
      delIvr(id) {
          this.$confirm('确定删除当前模版吗？', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
          }).then(() => {
              delIvrTem(id).then(() => {
                  this.$message.success('已删除')
                  this.getList()
              })
          }).catch(() => {
              this.$message({
                  type: 'info',
                  message: '已取消'
              })
          })
      },
      creatTask(data, type) {
          this.temId = data.id
          this.temName = data.name
          this.companyId = localStorage.companyId
          this.uploadType = type
          this.taskDialog = true
          this.ivrParams = data.inputParams
      },
      // 关闭详情
      closeDetailDialog() {
          this.detailDialog = false
      },
      // 保存详情后关闭
      saveCloseDialog(id) {
          console.log(id)
          if (this.state == '') {
              this.currentPage = 1
          }
          this.getList()
          this.detailDialog = false
      },
      // 选择展示条数
      handleSizeChange(size) {
          this.pagesize = size
          this.getList()
      },
      // 选择页数
      handleCurrentChange(currentPage) {
          this.currentPage = currentPage
          this.getList()
      },
      // 关闭详情
      closeTaskDialog() {
          this.taskDialog = false
      },
      // 前往任务列表
      toTaskList(id) {
          // this.$router.push({
          //     path: '/ivrDesign/taskList',
          //     query: {ivrId: id, name: name}
          // })
          this.ivrId = id
          this.listDialog = true
      },
      /**
       * 编辑模版信息
       */
      toDetailTemplate(item) {
          this.currentTemplate = item
          this.createVisible = true
      }
  }
}
</script>

<style lang="scss" scoped>
#app {
  padding: 20px;
  background: #f0f8fa
}
::v-deep #ivrDesign > .el-dialog {
  height: 100% !important;
  max-height: 100% !important;
  min-width: 1200px;
  @media screen and (max-width: 765px) {
      left: 0 !important;
      transform: translateY(-50%) !important;
  }
  & > .el-dialog__header {
      display: none;
  }
  & > .el-dialog__body {
      padding: 0;
  }
}
.pagination {
  text-align: center;
  margin: 10px 0;
}
.noticeCard .el-col {
    margin-bottom: 20px;
}
.voiceCard {
    box-sizing: border-box;
    min-height: 36px;
    padding: 20px;
    border-radius: 4px;
    background-color: #fff;
    box-shadow: 0 4px 5px #eee;
    overflow: hidden;
    .cardHead {
        margin: 0 -20px;
        padding: 0 20px 20px 20px;
        border-bottom: 1px solid #f0f8fa;
        .cardTop {
            height: 24px;
            position: relative;
            .position-right {
                position: absolute;
                display: inline-block;
                right: -10px;
                top: -10px;
            }
            .card-title {
                width: 80%;
                overflow: hidden;
                white-space: nowrap;
                font-size: 14px;
                text-overflow: ellipsis;
                float: left;
                font-weight: 500;
            }
        }
        & > p {
            font-size: 12px;
            color: #909399;
        }
    }
    .cardContent {
        padding: 20px 0;
        border-bottom: 1px solid #f0f8fa;
        & > .el-alert {
            height: 90px;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
        }
    }
    .cardFooter {
        .toolBox {
            height: 77px;
            text-align: center;
            .el-button {
                margin-top: 10px;
            }
        }
    }
}
</style>
