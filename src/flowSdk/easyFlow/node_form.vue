<template>
    <div>
        <div class="ef-node-form">
            <div class="ef-node-form-header">
                编辑
            </div>
            <div class="ef-node-form-body">
                <el-form :model="node" ref="dataForm" :rules="dataRules" v-show="type === 'node'">
                    <el-tabs v-model="activeName">
                        <el-tab-pane label="入参设置" name="first">
                            <el-form-item label="节点名称">
                                <el-input v-model="node.name" maxlength="20"></el-input>
                            </el-form-item>
                            <script-content
                                v-if="node.type != 'judge'"
                                :form="{
                                    src: node.nodeAudioSrc,
                                    text: node.nodeAudioText
                                }"
                                :params="params"
                                @success="src => node.nodeAudioSrc = src"
                                @delAudio="node.nodeAudioSrc = ''"
                                @changeText="text => node.nodeAudioText = text"
                            />
                            <!-- 转接 -->
                            <div v-show="node.type==='transfer'">
                                <el-form-item label="转接类型">
                                    <el-select v-model="node.bridgeType" style="width: 100%;" @change="node.bridgeId=''">
                                        <el-option label="机器人" value="robot" />
                                        <el-option label="语音通知" value="notice" />
                                        <el-option label="技能组" value="group" />
                                        <el-option label="网关组" value="gw" />
                                        <el-option label="指定技能组" value="customGroup" />
                                    </el-select>
                                </el-form-item>
                                <el-form-item v-if="node.bridgeType === 'gw'" label="网关组" prop="bridgeId">
                                    <el-select v-model="node.bridgeId" filterable placeholder="请选择" style="width: 100%;">
                                        <el-option v-for="(v, key) in gatewayGroup" :key="key" :label="v.name" :value="v.id" />
                                    </el-select>
                                </el-form-item>
                                <el-form-item v-if="node.bridgeType === 'robot'" label="流程名称" prop="bridgeId">
                                    <el-select v-model="node.bridgeId" filterable placeholder="请选择" style="width: 100%;">
                                        <el-option v-for="(v, key) in flowList" :key="key" :label="v.name" :value="v.id" />
                                    </el-select>
                                </el-form-item>
                                <el-form-item v-if="node.bridgeType === 'group'" label="技能组" prop="bridgeId">
                                    <el-select v-model="node.bridgeId" filterable placeholder="请选择" style="width: 100%;">
                                        <el-option v-for="(v, key) in groups" :key="key" :label="v.name" :value="v.id" />
                                    </el-select>
                                </el-form-item>
                                <el-form-item v-if="node.bridgeType === 'customGroup'" label="默认技能组" prop="bridgeId">
                                    <el-select v-model="node.bridgeId" filterable placeholder="请选择" style="width: 100%;">
                                        <el-option v-for="(v, key) in groups" :key="key" :label="v.name" :value="v.id" />
                                    </el-select>
                                </el-form-item>
                                <!-- <el-form-item v-if="node.bridgeType === 'agent'" label="座席" prop="bridgeId">
                                    <el-select v-model="node.bridgeId" filterable placeholder="请选择" style="width: 100%;">
                                        <el-option v-for="(v, key) in agentList" :key="key" :label="v.agentName ? `${v.agentNumber}(${v.agentName})` : v.agentNumber" :value="v.id" />
                                    </el-select>
                                </el-form-item> -->
                                <el-form-item v-if="node.bridgeType === 'notice'" label="语音通知" prop="bridgeId">
                                    <el-select v-model="node.bridgeId" filterable placeholder="请选择" style="width: 100%;">
                                        <el-option v-for="(v, key) in noticeList" :key="key" :label="v.name" :value="v.templateSn" />
                                    </el-select>
                                </el-form-item>
                                <p v-if="node.bridgeType === 'customGroup'" style="font-size: 12px; color: #888; margin-top: -15px; text-align: justify;">系统会根据接口返回值，转接对应的技能组，返回失败则会选用默认技能组</p>
                            </div>
                            <!-- 留言 -->
                            <div v-if="node.type === 'leaveMsg'">
                                <el-form-item label="录音时长(秒)">
                                    <el-input placeholder="请输入录音时长(秒)" v-model="node.recordingDuration" />
                                </el-form-item>
                                <div style="margin-bottom: 20px; color: #409eff;">录音时长默认15秒</div>
                            </div>
                            <!-- 信息收集 -->
                            <div v-if="node.type==='infoCollection'">
                                <el-form-item label="输入信息" prop="regularExpression" style="margin: 0;">
                                    <el-input v-model="node.regularExpression" type="textarea" maxlength="200" rows="3"></el-input>
                                </el-form-item>
                                <p style="line-height: 25px;">提示：支持正则表达式，例如：固定号码：^1000$，批量号码：^(10[0-9][0-9])$，所有号码：^(.*)$，7位以上号码：^(.{7,})$等等</p>
                            </div>
                            <!-- 信息收集与转接 -->
                            <div v-if="node.type==='infoCollection' || (node.type==='transfer' && node.bridgeType === 'customGroup')">
                                <el-form-item label="接口请求地址" label-width="100px">
                                    <el-input v-model="node.apiUrl" placeholder="请输入接口请求地址" />
                                </el-form-item>
                                <el-form-item label="入参" label-width="40px">
                                    <!-- 添加参数按钮 -->
                                    <el-row>
                                        <el-col :span="24" align="right">
                                            <el-dropdown @command="addInfoP($event, 'input')">
                                                <el-button size="mini" type="primary">
                                                    添加入参<i class="el-icon-arrow-down el-icon--right"></i>
                                                </el-button>
                                                <el-dropdown-menu slot="dropdown">
                                                    <el-dropdown-item command="1">系统参数</el-dropdown-item>
                                                    <el-dropdown-item command="2">自定义</el-dropdown-item>
                                                </el-dropdown-menu>
                                            </el-dropdown>
                                        </el-col>
                                    </el-row>
                                </el-form-item>
                                <el-table
                                    v-if="node.inputParamInfo && node.inputParamInfo.length > 0"
                                    :data="node.inputParamInfo"
                                    stripe
                                    style="margin-bottom: 10px;"
                                >
                                    <el-table-column prop="name" label="参数名称" min-width="80px" align="center">
                                        <template slot-scope="scope">
                                            <el-input v-if="scope.row.ctype == 2" v-model="scope.row.name" size="small" placeholder="请输入参数名称" @change="fieldValid($event, scope.row, 'oldInputParams', 'name', '入参中文')" />
                                            <el-select v-else v-model="scope.row.name" size="small" placeholder="请选择" @change="nameChange($event, scope.row)">
                                                <el-option v-for="(item, key) of infoParams" :key="`info_${key}`" :label="item.label" :value="item.label" :disabled="item.disabled" />
                                            </el-select>
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="variable" label="英文名称" min-width="80px" align="center">
                                        <template slot-scope="scope">
                                            <el-input  v-if="scope.row.ctype == 2" v-model="scope.row.variable" size="small" placeholder="请输入英文名称" @change="fieldValid($event, scope.row, 'oldInputParams', 'variable', '入参英文')" />
                                            <span v-else > {{ scope.row.variable }} </span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="value" label="参数值" min-width="80px" align="center">
                                        <template slot-scope="scope">
                                            <el-input  v-if="scope.row.ctype == 2" v-model="scope.row.value" size="small" placeholder="请输入参数值" />
                                            <span v-else ></span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="" label="操作" width="50px" align="center" fixed="right">
                                        <template slot-scope="scope">
                                            <i class="el-icon-delete" @click="delInfoP(scope.row.id)" style="font-size: 16px; color: #f56c6c;"></i>
                                        </template>
                                    </el-table-column>
                                </el-table>
                                <el-form-item label="出参" label-width="40px">
                                    <!-- 添加参数按钮 -->
                                    <el-row>
                                        <el-col :span="24" align="right">
                                            <el-dropdown @command="addInfoP($event, 'out')">
                                                <el-button size="mini" type="primary">
                                                    添加出参<i class="el-icon-arrow-down el-icon--right"></i>
                                                </el-button>
                                                <el-dropdown-menu slot="dropdown">
                                                    <el-dropdown-item command="1">系统参数</el-dropdown-item>
                                                    <el-dropdown-item command="2">自定义</el-dropdown-item>
                                                </el-dropdown-menu>
                                            </el-dropdown>
                                        </el-col>
                                    </el-row>
                                </el-form-item>
                                <el-table
                                    v-if="node.outputParamInfo && node.outputParamInfo.length > 0"
                                    :data="node.outputParamInfo"
                                    stripe
                                    style="margin-bottom: 15px;"
                                >
                                    <el-table-column prop="name" label="参数名称" min-width="80px" align="center">
                                        <template slot-scope="scope">
                                            <span v-if="!scope.row.ctype" > {{ scope.row.name }} </span>
                                            <el-input v-else-if="scope.row.ctype == 2" v-model="scope.row.name" size="small" placeholder="请输入参数名称" @change="fieldValid($event, scope.row, 'oldOutputParams', 'name', '出参中文')" />
                                            <el-select v-else v-model="scope.row.name" size="small" placeholder="请选择"  @change="outNameChange($event, scope.row)">
                                                <el-option v-for="(item, key) of comOutParams" :key="`info_${key}`" :label="item.name" :value="item.name" :disabled="item.disabled" />
                                            </el-select>
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="variable" label="英文名称" min-width="80px" align="center">
                                        <template slot-scope="scope">
                                            <el-input  v-if="scope.row.ctype == 2" v-model="scope.row.variable" size="small" placeholder="请输入英文名称" @change="fieldValid($event, scope.row, 'oldOutputParams', 'variable', '出参英文')" />
                                            <span v-else > {{ scope.row.variable }} </span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="value" label="参数值" min-width="80px" align="center">
                                        <template slot-scope="scope">
                                            <el-input v-if="scope.row.ctype" v-model="scope.row.value" size="small" placeholder="请输入参数值" />
                                            <span v-else > {{ scope.row.value }} </span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="" label="操作" width="50px" fixed="right" align="center">
                                        <template slot-scope="scope">
                                            <i v-if="scope.row.ctype" class="el-icon-delete" @click="deleteParam(scope.row.id)" style="font-size: 16px; color: #f56c6c;"></i>
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </div>
                            <!-- 判断 -->
                            <div v-if="node.type === 'judge'">
                                <div style="margin-bottom: 20px;">
                                    <span>满足以下</span>
                                    <el-select v-model="node.judgmentInfo.rule" size="small" style="width: 75px; margin: 0 10px;">
                                        <el-option label="全部" value="all" />
                                    </el-select>
                                    <span>条件,</span>
                                    <el-select v-model="node.judgmentInfo.type" multiple size="small" style="width: 160px; margin: 0 10px;" placeholder="请选择判断条件" @change="judgeTypeChange">
                                        <el-option label="呼叫时间" value="callTime" />
                                        <el-option label="工作时间" value="workingDay" />
                                    </el-select>
                                    <div v-for="(judge, jkey) of node.judgmentInfo.content" :key="`judge_${jkey}`">
                                        <h4 v-if="judge.type==='workingDay'">工作时间</h4>
                                        <el-checkbox-group v-if="judge.type==='workingDay'" v-model="judge.preconditions">
                                            <el-checkbox :label="2">周一</el-checkbox>
                                            <el-checkbox :label="3">周二</el-checkbox>
                                            <el-checkbox :label="4">周三</el-checkbox>
                                            <el-checkbox :label="5">周四</el-checkbox>
                                            <el-checkbox :label="6">周五</el-checkbox>
                                            <el-checkbox :label="7">周六</el-checkbox>
                                            <el-checkbox :label="1">周日</el-checkbox>
                                        </el-checkbox-group>
                                        <h4>{{ judge.type==='workingDay' ? '工作时间段' : '呼叫时间段'}}</h4>
                                        <div v-for="(base, index) in judge.conditions" :key="`base_${index}`" class="base-list">
                                            <el-select v-if="index % 2 == 0" v-model="base.condition" size="small" style="margin: 0 10px;" class="flex1">
                                                <el-option label="大于" value="1" />
                                                <el-option label="等于" value="2" />
                                                <el-option label="大于等于" value="4" />
                                            </el-select>
                                            <el-select v-else v-model="base.condition" size="small" style="margin: 0 10px;" class="flex1">
                                                <el-option label="小于" value="3" />
                                                <el-option label="等于" value="2" />
                                                <el-option label="小于等于" value="5" />
                                            </el-select>
                                            <el-time-picker value-format="HH-mm" format="HH:mm" v-model="base.target" size="small" class="flex1"/>
                                            <i v-if="index === 0" class="el-icon-circle-plus-outline toolIcon add" @click="addJudgeBasis(jkey)" />
                                            <i v-if="index % 2 !== 0 && index !== 1" class="el-icon-delete toolIcon" @click="deleteJudgeBasis(jkey, index)"  />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div v-if="node.type !== 'judge' && node.type !=='infoCollection' && node.type!=='transfer'">
                                <el-button type="primary" size="small" @click="addParam" icon="el-icon-plus">添加参数</el-button>
                                <div v-for="param in node.outputParamInfo" :key="param.id" class="flex-box">
                                    <el-form-item label="参数名称">
                                        <el-select v-model="param.name">
                                            <el-option v-for="op in outParams" :value="op.variable" :disabled="node.outputParamInfo.some(no => no.name == op.variable)" :label="op.name" :key="op.name" />
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item label="参数取值" style="margin: 0 10px 22px;" :required="isRequired(param)">
                                        <el-input v-model="param.value"></el-input>
                                    </el-form-item>
                                    <i class="el-icon-delete" @click="deleteParam(param.id)" style="font-size: 20px; cursor: pointer;"></i>
                                </div>
                            </div>
                        </el-tab-pane>
                        <el-tab-pane label="异常处理" name="second">
                            <h3>按键错误</h3>
                            <el-form-item label="连续触发次数">
                                <el-input-number v-model="node.errTriggerNum" :min="1"/>
                            </el-form-item>
                            <script-content
                                :form="{
                                    src: node.errAudioSrc,
                                    text: node.errAudioText
                                }"
                                :params="params"
                                @success="src => node.errAudioSrc = src"
                                @delAudio="node.errAudioSrc = ''"
                                @changeText="text => node.errAudioText = text"
                            />
                            <el-form-item label="超出次数，执行">
                                <el-select v-model="node.keyErrorEvent">
                                    <!-- <el-option label="重听" value="REPLAY"/> -->
                                    <el-option label="挂机" value="HANG_UP"/>
                                    <!-- <el-option label="转人工" value="TRANSFER"/> -->
                                </el-select>
                            </el-form-item>
                            <!-- <h3>无响应</h3>
                            <el-form-item label="连续触发次数">
                                <el-input-number v-model="node.noResTriggerNum" :min="1"/>
                            </el-form-item>
                            <script-content
                                :form="{
                                    src: node.noResSrc,
                                    text: node.noResText
                                }"
                                :params="params"
                                @success="src => node.noResSrc = src"
                                @delAudio="node.noResSrc = ''"
                                @changeText="text => node.noResText = text"
                            />
                            <el-form-item label="超出次数，执行">
                                <el-select v-model="node.noRespEvent">
                                    <el-option label="挂机" :value="0"/>
                                    <el-option label="返回" :value="1"/>
                                    <el-option label="转人工" :value="2"/>
                                </el-select>
                            </el-form-item> -->
                        </el-tab-pane>
                    </el-tabs>
                    <!-- <el-form-item label="ico图标">
                        <el-input v-model="node.ico"></el-input>
                    </el-form-item>
                    <el-form-item label="状态">
                        <el-select v-model="node.state" placeholder="请选择" style="width: 100%;">
                            <el-option
                                    v-for="item in stateList"
                                    :key="item.state"
                                    :label="item.label"
                                    :value="item.state">
                            </el-option>
                        </el-select>
                    </el-form-item> -->
                    <el-form-item align="center">
                        <el-button v-if="node.id" type="primary" icon="el-icon-check"  @click="save(false)">保存</el-button>
                    </el-form-item>
                </el-form>
                <el-form :model="line" ref="dataForm" v-show="type === 'line'">
                    <el-form-item label="按键值">
                        <el-select v-model="line.label" style="width: 100%;" @change="saveLine">
                            <el-option label="1" value="1" />
                            <el-option label="2" value="2" />
                            <el-option label="3" value="3" />
                            <el-option label="4" value="4" />
                            <el-option label="5" value="5" />
                            <el-option label="6" value="6" />
                            <el-option label="7" value="7" />
                            <el-option label="8" value="8" />
                            <el-option label="9" value="9" />
                            <el-option label="0" value="0" />
                            <el-option label="*" value="*" />
                            <el-option label="#" value="#" />
                            <el-option label="任意键" value="任意键" />
                            <el-option label="直接跳转" value="直接跳转" />
                        </el-select>
                    </el-form-item>
                </el-form>
                <el-form :model="line" ref="dataForm" v-show="type === 'judgeLine'">
                    <el-form-item label="判断分支">
                        <el-select v-model="line.label" style="width: 100%;" @change="saveLine">
                            <el-option label="是" value="是" />
                            <el-option label="否" value="否" />
                        </el-select>
                    </el-form-item>
                </el-form>
            </div>
        </div>
    </div>

</template>

<script>
    import { cloneDeep, findIndex } from 'lodash'
    import { arrayGroupBy } from './utils'
    import ScriptContent from './script_content.vue'
    export default {
        components: { ScriptContent },
        props: {
            nodeData: Object,
            params: Array,
            outParams: Array,
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
            noticeList: {
                type: Array,
                default: () => []
            }
        },
        data() {
            const regValid = (rule, value, callback) => {
                if (!value || !(value.trim())) callback()
                try {
                    if (eval(`/${value}/`) instanceof RegExp) {
                        callback()
                    } else {
                        callback(new Error('请输入正确的正则'))
                    }
                } catch(err) {
                    callback(new Error('请输入正确的正则'))
                }
            }
            return {
                labelList: [],
                activeName: 'first',
                visible: true,
                // node 或 line
                type: 'node',
                node: {},
                line: {},
                data: {},
                stateList: [{
                    state: 'success',
                    label: '成功'
                }, {
                    state: 'warning',
                    label: '警告'
                }, {
                    state: 'error',
                    label: '错误'
                }, {
                    state: 'running',
                    label: '运行中'
                }],
                infoParams: [
                    { label: '主叫号码', val: 'caller', disabled: false },
                    { label: '被叫号码', val: 'called', disabled: false },
                    { label: '通话开始时间', val: 'createdTime', disabled: false },
                    { label: '收键信息', val: 'collectResults', disabled: false }
                ],
                dataRules: {
                    regularExpression: { validator: regValid, trigger: 'blur' }
                },
                // 存放出入参
                oldInputParams: [],
                oldOutputParams: [],
                comOutParams: [],
                // 存放判断条件
                oldJudgeType: []
            }
        },
        watch: {
            'outParams': {
                handler() {
                    this.comOutParams = cloneDeep(this.outParams)
                },
                immediate: true
            }
        },
        mounted() {
            if (this.nodeData) this.data = this.nodeData
        },
        methods: {
            isRequired(param) {
                let _param = this.outParams.find(op => op.variable == param.name)
                return (param.name && _param && _param.required)
            },
            /**
             * 表单修改，这里可以根据传入的ID进行业务信息获取
             * @param data
             * @param id
             */
            nodeInit(data, id) {
                this.type = 'node'
                if (JSON.stringify(this.node) !== '{}' && this.node.id !== id) {
                    const mark = this.save(true)
                    if (!mark) return false
                }
                this.data = data
                data.nodeList.filter((node) => {
                    if (node.id === id) {
                        this.node = cloneDeep(node)
                        this.$set(this.node, 'outputParamInfo', this.node.outputParamInfo?.length ?  this.node.outputParamInfo : this.node.type==='infoCollection' || this.node.type==='transfer' ? [
                            { name: '接口出参',  variable: 'result', value: '', id: new Date().getTime()}
                        ]: [])
                        if(this.node.type === 'judge') {
                            this.node.judgmentInfo = this.initJudge('parse')
                            this.oldJudgeType = this.node.judgmentInfo.type
                        }
                    }
                })
                return true
            },
            // 初始化判断节点数据
            initJudge(jtype) {
                const judgmentInfo = cloneDeep(this.node.judgmentInfo)
                judgmentInfo.type = JSON[jtype](judgmentInfo.type)
                if (jtype === 'parse' && judgmentInfo.type.indexOf(1) > -1) {
                    judgmentInfo.type = ['callTime', 'workingDay']
                }
                if (judgmentInfo.content.length) {
                    judgmentInfo.content.forEach(item => {
                        item.conditions = JSON[jtype](item.conditions)
                        if (item.preconditions) item.preconditions = JSON[jtype](item.preconditions)
                    })
                }
                return judgmentInfo
            },
            clearForm() {
                this.node = {}
                this.data = {}
                this.line = {}
            },
            lineInit(line, data) {
                if (JSON.stringify(this.node) !== '{}') {
                    const mark = this.save(true)
                    if (!mark) return false
                }
                this.type = 'line'
                this.line = line
                this.data = data
                console.log('this.data.nodeList', this.data.nodeList);
                for (let i = 0 ; i < this.data.nodeList.length; i++) {
                    let node = this.data.nodeList[i]
                    if (this.line.from == node.id && node.type == 'judge') {
                        this.type = 'judgeLine'
                    }
                }
                this.labelList = this.labelGroup()
                return true
            },
            addParam() {
                if (this.outParams.length <= this.node.outputParamInfo.length) return this.$message.warning('添加参数已达到可配参数上限')
                this.node.outputParamInfo.push({
                    name: '', value: '', id: new Date().getTime()
                })
            },
            deleteParam(paramId) {
                let index = this.node.outputParamInfo.findIndex(p => p.id == paramId)
                if (index > -1) {
                    this.node.outputParamInfo.splice(index, 1)
                }
            },
            // 信息收集 添加、删除参数 ctype: 1:系统参数；2:自定义 ptype: input:入参；out:出参
            addInfoP(ctype, ptype) {
                if (ptype === 'out' && ctype == 1 && !this.outParams?.length) {
                    this.$message.info('无全局出参配置，请选择自定义')
                    return
                }
                this.oldInputParams = cloneDeep(this.node.inputParamInfo)
                this.oldOutputParams = cloneDeep(this.node.outputParamInfo)
                ctype == 1 && ptype == 'input' && this.infoPValid()
                ctype == 1 && ptype == 'out' && this.outPValid()
                const info = {
                    id: new Date().getTime(),
                    name: '',
                    variable: '',
                    value: '',
                    ctype: ctype
                }
                ptype === 'input' &&  this.node.inputParamInfo.push(info)
                ptype === 'out' &&  this.node.outputParamInfo.push(info)
            },
            // 入参系统参数查重
            infoPValid() {
                for (let p of this.infoParams) {
                    let mark = findIndex(this.node.inputParamInfo, item => item.name === p.label)
                    if (mark > -1) {
                        p.disabled = true
                    } else {
                        p.disabled = false
                    }
                }
            },
            // 出参公共参数查重禁用
            outPValid() {
                for (let p of this.comOutParams) {
                    let mark = findIndex(this.node.outputParamInfo, item => item.name === p.name)
                    if (mark > -1) {
                        this.$set(p, 'disabled', true)
                    } else {
                        this.$set(p, 'disabled', false)
                    }
                }
            },
            // 参数自定义查重 val: 改变后的默认值 row: 数据行 params: 查重的参数对象  field: 查重字段名称  tip: 错误提示
            fieldValid(val, row, params, field, tip) {
                let mark = findIndex(this[params], item => item[field] === val)
                if (mark > -1) {
                    this.$message.error(tip + '名称不能重复')
                    row[field] = ''
                }
            },
            nameChange(val, row) {
                for(let item of this.infoParams) {
                    if (val === item.label) {
                        row.variable = item.val
                    }
                }
            },
            outNameChange(val, row) {
                for(let item of this.outParams) {
                    if (val === item.name) row.variable = item.variable
                }
            },
            delInfoP(paramId) {
                let index = this.node.inputParamInfo.findIndex(p => p.id == paramId)
                if (index > -1) {
                    this.node.inputParamInfo.splice(index, 1)
                }
            },
            // 将label按from分组，同一级不能有相同的按键
            labelGroup() {
                const labelArr = arrayGroupBy(this.data.lineList, 'from')
                const labelObj = []
                for (let item of labelArr) {
                    const labels = []
                    for (let label of item) {
                        if (this.line.label !== label.label) labels.push(label.label)
                    }
                    labelObj.push({
                        from: item[0].from,
                        labels: labels
                    })
                }
                return labelObj
            },
            // 修改连线
            saveLine() {
                let mark = false
                for (let item of this.labelList) {
                    if (
                        (
                            this.line.label == '直接跳转' && item.labels.some(label => label === '任意键') ||
                            this.line.label == '任意键' && item.labels.some(label => label === '直接跳转')
                        ) && this.line.from == item.from
                    ){
                        return this.$message.warning('同一级按键值不能同时存在“直接跳转”和“任意键”')
                    }
                    if (this.line.from === item.from) {
                        mark = item.labels.some(label => label === this.line.label)
                        break
                    }
                }
                if (mark) {
                    this.$message.error('同一级按键值不能重复')
                    return
                }
                this.$emit('setLineLabel', this.line.from, this.line.to, this.line.label)
            },
            removeTag(val) {
                const index = this.node.judgmentInfo.content.findIndex(item => item.type === val)
                this.node.judgmentInfo.content.splice(index, 1)
            },
            removeKey(oldType, newType) {
                const obj = {}
                let key = ''
                newType.forEach(item => obj[item] = true)
                oldType.forEach(item => {
                    if (!obj[item]) key = item
                })
                return key
            },
            judgeTypeChange(val) {
                if (this.oldJudgeType.length < val.length) {
                    this.node.judgmentInfo.content.push({
                        type: val[val.length-1],
                        preconditions: val[val.length-1] === 'workingDay' ? [2, 3, 4, 5, 6] : '',
                        rule: 'anyCondition',
                        conditions:[
                            { index: 1, condition: '4', target: '08-00' },
                            { index: 1, condition: '5', target: '20-00' }
                        ]
                    })
                    this.oldJudgeType = val
                } else {
                    this.$confirm('确定移除当前判断条件吗？移除后重新选择，将变为初始数据。', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        const key = this.removeKey(this.oldJudgeType, val)
                        this.removeTag(key)
                        this.oldJudgeType = val
                    }).catch(() => {
                        this.$message({
                            type: 'info',
                            message: '已取消'
                        })
                        this.node.judgmentInfo.type = this.oldJudgeType
                    })
                }
            },
            save(noMsg) {
                try {
                    if (this.node.regularExpression && eval(`/${this.node.regularExpression}/`) instanceof RegExp === false ) {
                        this.$message.error('请输入正确的正则')
                        return
                    }
                } catch(err) {
                    this.$message.error('请输入正确的正则')
                    return
                }
                if (!this.node.nodeAudioText && !this.node.nodeAudioSrc && this.node.type !== 'judge') {
                    this.$message.error('话术内容与录音内容至少有一项不能为空')
                    return
                }
                this.node.name = this.node.name.trim()
                if (!this.node.name) return this.$message.warning('请填写有效的节点名称')
                if (this.node.nodeAudioText && this.node.nodeAudioSrc) {
                    this.node.nodeAudioText = ''
                }
                if (this.node.errAudioText && this.node.errAudioSrc) {
                    this.node.errAudioText = ''
                }
                if (this.node.noResText && this.node.noResSrc) {
                    this.node.noResText = ''
                }
                if (this.node.type != 'judge' && this.node.type != 'infoCollection' && this.node?.outputParamInfo?.length) {
                    for (let i = 0; i < this.node.outputParamInfo.length; i++) {
                        let param = this.node.outputParamInfo[i]
                        if (!param.name) return this.$message.warning('请选择参数名称')
                        if (this.outParams.find(op => op.variable == param.name)?.required && !param.value) {
                            return this.$message.warning('有必填参数未填写值')
                        }
                    }
                }
                // if (this.node.type == 'judge') {
                //     for (let j = 0; j < this.node.judgeGroup.length; j++) {
                //         let judge = this.node.judgeGroup[j]

                //         if (judge.basis.length == 0) return this.$message.warning('最少需要有一个判断条件')

                //         for (let i = 0; i < judge.basis.length; i++) {
                //             let basis = judge.basis[i]
                //             if (!basis.field || !basis.condition || !basis.target) {
                //                 return this.$message.warning('请完善判断信息')
                //             }
                //         }
                //     }
                // }
                if (this.node.type == 'leaveMsg') {
                    if (!(/^\d+$/.test(this.node.recordingDuration))) {
                        return this.$message.warning('录音时长只能填写数字')
                    }
                }
                this.data.nodeList.filter((node) => {
                    if (node.id === this.node.id) {
                        node.name = this.node.name
                        node.left = this.node.left
                        node.top = this.node.top
                        node.ico = this.node.ico
                        node.state = this.node.state
                        node.nodeAudioText = this.node.nodeAudioText
                        node.nodeAudioSrc = this.node.nodeAudioSrc
                        node.errAudioText = this.node.errAudioText
                        node.errAudioSrc = this.node.errAudioSrc
                        node.errTriggerNum = this.node.errTriggerNum
                        node.keyErrorEvent = this.node.keyErrorEvent
                        node.outputParamInfo = cloneDeep(this.node.outputParamInfo)
                        switch (node.type) {
                            case 'infoCollection':
                                node.regularExpression = this.node.regularExpression
                                node.apiUrl =  this.node.apiUrl
                                node.inputParamInfo = cloneDeep(this.node.inputParamInfo)
                                break
                            case 'leaveMsg':
                                node.closeRecord = this.node.closeRecord
                                node.recordingDuration = this.node.recordingDuration
                                break
                            case 'transfer':
                                node.bridgeType = this.node.bridgeType
                                node.bridgeId = this.node.bridgeId
                                node.apiUrl =  this.node.apiUrl
                                node.inputParamInfo = cloneDeep(this.node.inputParamInfo)
                                break
                            case 'judge': node.judgmentInfo = cloneDeep(this.initJudge('stringify')); break
                        }
                        this.$emit('repaintEverything')
                        !noMsg && this.$message.success('保存成功')
                    }
                })
                return true
            },
            /**
             * 判断节点添加判断条件
             */
            addJudgeBasis(type) {
                const conditions = this.node.judgmentInfo.content[type].conditions
                let len = conditions.length
                let index = conditions.length / 2
                if (!conditions[len-1].target || !conditions[len-2].target) {
                    this.$message.error('请先完善已添加的时间区间')
                    return
                }
                let content = [
                    { index: index + 1,condition: '4', target: '' },
                    { index: index + 1,condition: '5', target: '' }
                ]
                this.node.judgmentInfo.content[type].conditions = [...conditions, ...content]

            },
            deleteJudgeBasis(type, index) {
                const conditions = this.node.judgmentInfo.content[type].conditions
                conditions.splice(index-1, 2)
            }
        }
    }
</script>

<style>
    .ef-node-form-body {
        padding-left: 10px;
    }
    .audioBox {
        display: flex;
        align-items: center;
        margin: -20px 0 10px 0;
    }
    .flex-box {
        display: flex;
        align-items: center;
    }
    .base-list {
        display: flex;
        align-items: center;
        margin-top: 10px;
    }
    .toolIcon {
        margin-left: 10px;
        cursor: pointer;
        font-size: 20px;
        color: #f56c6c;
    }
    .toolIcon.add {
        color: #4093ff;
    }
    .flex1 {
        flex: 0 1 150px;
    }
</style>
