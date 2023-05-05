<template>
    <div>
        <div style="text-align: right; margin-bottom: 10px;">
            <el-button size="mini" type="success" icon="el-icon-plus" plain @click="toDetail(null, 'add')">{{ btnTit }}</el-button>
        </div>
        <w-table
            :data="ruleList"
            :columns="columns"
            :is-pagination="false"
            :t-height="null"
            :max-height="288"
            style="box-shadow: none; margin-bottom: 10px;"
        >
            <template #operation>
                <el-table-column label="操作" width="70px" align="center" fixed="right">
                    <template #default="scope">
                        <i class="el-icon-edit" @click="toDetail(scope.row, 'edit', scope.$index)" style="font-size: 16px; color: #409eff; margin-right: 10px;"></i>
                        <i class="el-icon-delete" @click="delRule(scope.$index)" style="font-size: 16px; color: #f56c6c;"></i>
                    </template>
                </el-table-column>
            </template>
        </w-table>
        <!-- 显示详情 -->
        <el-dialog v-if="detailDialog" :visible.sync="detailDialog" title="规则详情" append-to-body :close-on-click-modal="false" width="620px" class="hBg">
            <RuleDetail
                :form-data="formData"
                :state="state"
                :type="type"
                :params="params"
                :gatewayGroup="gatewayGroup"
                :flowList="flowList"
                :groups="groups"
                :extensionGroups="extensionGroups"
                :noticeList="noticeList"
                :lain-list="lainList"
                :ivrList="ivrList"
                :ruleList="ruleList"
                :rowIndex="rowIndex"
                :receiveCodes="receiveCodes"
                :baseUrl="baseUrl"
                @onClose="detailDialog = false"
                @onSave="onSave"
            />
        </el-dialog>
    </div>
</template>

<script>
import WTable from './WTable/index.vue'
import RuleDetail from './RuleDetail.vue'
export default {
    components: { WTable, RuleDetail},
    props: {
        type: String,
        params: Array,
        list: {
            type: Array,
            default: () => []
        },
        gatewayGroup: {
            type: Array,
            default: () => []
        },
        flowList: {
            type: Array,
            default: () => []
        },
        groups: {
            type: Array,
            default: () => []
        },
        extensionGroups: {
            type: Array,
            default: () => []
        },
        noticeList: {
            type: Array,
            default: () => []
        },
        lainList: {
            type: Array,
            default: () => []
        },
        ivrList: {
            type: Array,
            default: () => []
        },
        receiveCodes: {
            type: Array,
            default: () => []
        },
        baseUrl: String
    },
    watch: {
        ruleList() {
            this.$emit('getRuleList', this.ruleList)
        },
        list: {
            handler() {
                this.ruleList = this.list
            },
            immediate: true
        },
        type() {
            this.initTit()
        }
    },
    data() {
        return {
            ruleList: [],
            detailDialog: false,
            formData: null,
            state: '',
            btnTit: '新 增',
            rowIndex: ''
        }
    },
    computed: {
        columns() {
            return [
                { prop: 'name', label: '字段名称', minWidth: '102px', align: 'center', tooltip: true, isHide: this.type !=='crmRule' && this.type !=='ivrParamsRule' },
                { prop: 'variable', label: '参数名称', minWidth: '102px', align: 'center', tooltip: true, isHide: this.type !=='ivrParamsRule' },
                { prop: 'value', label: this.type==='ascriptionPlaceRule' ? '归属地' : this.type==='urlRule' ? '参数值' : '字段值', minWidth: '102px', align: 'center', tooltip: true },
                {
                    prop: 'bridgeType', label: '转接类型', minWidth: '90px', align: 'center', tooltip: true,
                    formatter(row) {
                        return {
                            'robot': '机器人',
                            'notice': '语音通知',
                            'group': '技能组',
                            'gw': '网关组',
                            'ivr': 'IVR',
                            'subordinateNode': '下级节点',
                            'playAndHangUp': '放音并挂机',
                            'extension': '分机组'
                        }[row.bridgeType]
                    }
                },
                {
                    prop: 'bridgeName', label: '转接目标', minWidth: '130px', align: 'center', tooltip: true,
                    formatter(row) {
                        return row.bridgeName + '-' + row.targetName;
                    }
                },
                { slot: 'operation' }
            ]
        }
    },
    mounted() {
        this.initTit()
    },
    methods: {
        toDetail(data, state, index) {
            this.detailDialog = true
            this.state = state
            this.formData = data
            if (index) this.rowIndex = index
        },
        initTit() {
            if (this.type === 'ascriptionPlaceRule') {
                this.btnTit = '新增归属地'
            } else {
                this.btnTit = '新 增'
            }
        },
        delRule(index) {
            this.$confirm('确定删除当前规则吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.ruleList.splice(index, 1)
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消'
                })
            })
        },
        onSave(data) {
            this.detailDialog = false
            if (this.state == 'add') {
                this.ruleList.push(data)
            } else {
                this.ruleList.splice(this.rowIndex, 1, data)
            }
        }
    }
}
</script>
