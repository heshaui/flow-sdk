<template>
    <div v-if="easyFlowVisible" style="height: calc(100vh);">
        <div v-show="rmenu" class="rMenu" :style="{left: rmenuLeft + 'px', top: rmenuTop + 'px'}" @click.left.stop>
            <el-button type="danger" icon="el-icon-delete"  size="small" @click="deleteElement">删除</el-button>
        </div>
        <el-row style="position: relative; z-index: 2;">
            <!--顶部工具菜单-->
            <el-col :span="24">
                <div class="ef-tooltar">
                    <span>{{ flowTit }}</span>
                    <el-divider direction="vertical"></el-divider>
                    <el-button type="text" icon="el-icon-delete" size="large" @click="deleteElement" :disabled="!this.activeElement.type"></el-button>
                    <el-divider direction="vertical"></el-divider>
                    <el-button type="text" icon="el-icon-refresh-left" size="large" @click="resetFlow"></el-button>
                    <!-- <el-divider direction="vertical"></el-divider>
                    <el-button type="text" icon="el-icon-download" size="large" @click="downloadData"></el-button> -->
                    <!-- <el-divider direction="vertical"></el-divider>
                    <el-button type="text" icon="el-icon-plus" size="large" @click="zoomAdd"></el-button>
                    <el-divider direction="vertical"></el-divider>
                    <el-button type="text" icon="el-icon-minus" size="large" @click="zoomSub"></el-button> -->
                    <div class="ivrTabs">
                        <span class="tabItem" :class="activeName==='flow' ? 'active' : ''" @click="activeName='flow'">流程设置</span>
                        <span class="tabItem" :class="activeName==='err' ? 'active' : ''" @click="activeName='err'">异常处理</span>
                        <span class="tabItem" :class="activeName==='currency' ? 'active' : ''" @click="activeName='currency'">通用设置</span>
                        <span class="tabItem" :class="activeName==='params' ? 'active' : ''" @click="activeName='params'">变量配置</span>
                    </div>
                    <div style="float: right; margin-right: 5px;">
                        <el-button type="info" plain round icon="el-icon-document" @click="dataInfo" size="mini">流程信息</el-button>
                        <el-button type="info" plain round icon="el-icon-document" @click="openHelp" size="mini">帮助</el-button>
                        <el-button v-if="state !== 'detail'" type="success" plain round icon="el-icon-save" @click="saveFlow" size="mini">保存</el-button>
                        <el-button v-if="closeBtn" type="danger" plain round @click="closeDetailDialog" size="mini">返回</el-button>
                    </div>
                </div>
            </el-col>
        </el-row>
        <!-- 流程设置 -->
        <div v-show="activeName === 'flow'" style="display: flex; height: calc(100% - 47px); position: relative; z-index: 1;">
            <div style="width: 230px; border-right: 1px solid #dce3e8;">
                <node-menu @addNode="addNode" ref="nodeMenu"></node-menu>
            </div>
            <div id="efContainer"  class="container" ref="efContainer" v-flowDrag @contextmenu.prevent>
                <template v-for="node in data.nodeList">
                    <flow-node
                        :id="node.id"
                        :key="node.id"
                        :node="node"
                        :activeElement="activeElement"
                        @changeNodeSite="changeNodeSite"
                        @nodeRightMenu="nodeRightMenu"
                        @clickNode="clickNode"
                        @rightClick="rightClick"
                    >
                    </flow-node>
                </template>
                <div style="width: 2000px; height: 2000px;"></div>
            </div>
            <!-- 右侧表单 -->
            <div :class="rightOpen ? 'rightForm' : 'noWidth'" style="border-left: 1px solid #dce3e8; background-color: #fbfbfb; overflow: auto; transition: width 0.5s;">
                <flow-node-form
                    ref="nodeForm"
                    :nodeData="data"
                    :params="flowForm.params"
                    :outParams="flowForm.outputParams"
                    :gatewayGroup="gatewayGroup"
                    :flowList="flowList"
                    :groups="groups"
                    :noticeList="noticeList"
                    @setLineLabel="setLineLabel"
                    @repaintEverything="repaintEverything"
                />
                <el-tooltip effect="light" placement="left" :content="rightOpen ? '收起' : '展开' ">
                    <div class="el-node-form-tag" @click="handleForm"><i :class="rightOpen ? 'el-icon-d-arrow-right' : 'el-icon-d-arrow-left' "></i></div>
                </el-tooltip>
            </div>
        </div>
        <!-- 异常处理 -->
        <div v-show="activeName === 'err'" style="height: calc(100% - 47px); padding: 20px; overflow-y: auto;">
            <el-form ref="flowForm" :model="flowForm">
                <h3>按键错误</h3>
                <el-row>
                    <el-col :span="8">
                        <el-form-item label="连续触发次数">
                            <el-input-number v-model="flowForm.keyErrorNumber" :min="1"/>
                        </el-form-item>
                        <script-content
                            :form="{
                                src: flowForm.keyErrorPath,
                                text: flowForm.keyErrorText
                            }"
                            :params="flowForm.params"
                            :base-url="baseUrl"
                            @success="src => flowForm.keyErrorPath = src"
                            @delAudio="flowForm.keyErrorPath = ''"
                            @changeText="text => flowForm.keyErrorText = text"
                        />
                        <el-form-item label="超出次数，执行">
                            <el-select v-model="flowForm.keyErrorEvent">
                                <el-option label="挂机" value="HANG_UP"/>
                                <el-option label="返回上一级" value="RETURN_TO_SUPERIOR"/>
                                <el-option label="放音并挂机" value="PLAY_AND_HANG_UP"/>
                            </el-select>
                        </el-form-item>
                        <script-content
                            v-if="flowForm.keyErrorEvent == 'PLAY_AND_HANG_UP'"
                            label="放音内容"
                            :form="{
                                src: flowForm.eventAudioFile,
                                text: flowForm.eventAudioText
                            }"
                            :params="flowForm.params"
                            :base-url="baseUrl"
                            @success="src => flowForm.eventAudioFile = src"
                            @delAudio="flowForm.eventAudioFile = ''"
                            @changeText="text => flowForm.eventAudioText = text"
                        />
                    </el-col>
                </el-row>
            </el-form>
        </div>
        <!-- 通用设置 -->
        <div v-show="activeName === 'currency'" style="height: calc(100% - 47px); padding: 20px; overflow-y: auto;">
            <el-form ref="flowForm" :model="flowForm" :rules="rules" label-width="180px" label-position="left" class="flowForm">
                <h3>播放参数</h3>
                <el-row>
                    <el-col :span="16">
                        <el-row :gutter="50">
                            <el-col :span="12">
                                <el-form-item label="最小打断时常(毫秒)">
                                    <el-input-number v-model="flowForm.minBreakDuration" :min="500" :step="100" style="width: 100%;"/>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="无输入判断时常(毫秒)">
                                    <el-input-number v-model="flowForm.noInputJudgeDuration" :min="500" :step="100" style="width: 100%;"/>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="音色">
                                    <el-select v-model="flowForm.speaker" style="width: 100%;">
                                        <el-option v-for="(v, k) in timbres" :key="k" :label="v.name" :value="v.code" />
                                    </el-select>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="语速" prop="speed">
                                    <el-input-number v-model="flowForm.speed" :max="ttsSource === 'ali' ? 500 : 100" :min="ttsSource === 'ali' ? -500 : 0" :placeholder="ttsSource === 'ali' ? '-500～500' : '0～100'" :step="2" style="width: 100%;"/>
                                </el-form-item>
                            </el-col>
                            <el-col v-if="ttsSource === 'ali'" :span="12">
                                <el-form-item label="语调">
                                    <el-input-number v-model="flowForm.intonation" :max="500" :min="-500" :step="2" placeholder="-500~500" style="width: 100%;"/>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="音量" prop="volume">
                                    <el-input-number v-model="flowForm.volume" :min="0" :max="100" :step="2" placeholder="0~100" style="width: 100%;"/>
                                </el-form-item>
                            </el-col>
                            <el-col :span="24">
                                <el-form-item label="试听内容">
                                    <el-input v-model="flowForm.auditionContent" type="textarea"  placeholder="最多可输入300个字" :maxlength="300" :rows="3" />
                                    <AuditionTimbre :params="flowForm" type="ivr" :tts="ttsSource" :base-url="baseUrl" />
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-col>
                </el-row>
            </el-form>
        </div>
        <!-- 变量配置 -->
        <div v-show="activeName === 'params'" style="height: calc(100% - 47px); padding: 20px; overflow-y: auto; width: 50%;">
            <el-row>
                <el-col :span="12">
                    <h3>变量参数</h3>
                </el-col>
            </el-row>
            <el-row>
                <el-col class="flex-box">
                    <el-radio-group v-model="variableType" size="small">
                        <el-radio-button label="enter">入参设置</el-radio-button>
                        <el-radio-button label="out">出参设置</el-radio-button>
                    </el-radio-group>
                    <el-button size="small" type="primary" @click="addParams(variableType)">添加参数</el-button>
                </el-col>
            </el-row>
            <!-- 参数表格 -->
            <el-table
                v-if="(flowForm.params && flowForm.params.length > 0 && variableType == 'enter') || (flowForm.outputParams && flowForm.outputParams.length > 0 && variableType == 'out')"
                :data="variableType == 'enter' ? flowForm.params : flowForm.outputParams"
                stripe
            >
                <el-table-column prop="index" label="序号" type="index" width="50px" align="center" />
                <el-table-column prop="name" label="参数名称" min-width="50%" align="center" />
                <el-table-column prop="variable" label="英文名称" min-width="50%" align="center" />
                <el-table-column prop="" label="操作" width="170px" align="center">
                    <template slot-scope="scope">
                        <el-button size="mini" @click="editParam(scope.row, scope.$index, variableType)">
                            编辑
                        </el-button>
                        <el-button size="mini" type="danger" @click="delParam(scope.$index, scope.row.variable)">
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <!-- 流程数据详情 -->
        <flow-info v-if="flowInfoVisible" ref="flowInfo" :data="data" @saveCode="editDataInfo"></flow-info>
        <flow-help v-if="flowHelpVisible" ref="flowHelp"></flow-help>
        <!-- 流程图名称 -->
        <el-dialog title="基本信息" :visible.sync="titDialog" append-to-body width="400px" class="hBg index3000">
            <el-form ref="flowForm" :model="flowForm" :rules="rules">
                <el-form-item label="模版名称" prop="name">
                    <el-input v-model="flowForm.name" />
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="flowForm.descr" type="textarea" :rows="3"/>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer" style="text-align: center;">
                <el-button :loading="loading" type="primary" @click="titSubmit()">保 存</el-button>
                <el-button @click="titDialog = false">取 消</el-button>
            </div>
        </el-dialog>
        <!-- 添加参数弹出框 -->
        <el-dialog v-if="paramDialog" :title="dialogTit" :visible.sync="paramDialog" append-to-body width="800px" class="hBg index3000">
            <el-form ref="paramForm" :model="paramForm" :rules="paramRules" label-width="80px" style="padding: 10px 20px;">
                <el-row v-if="paramType !== 'mapVal'" :gutter="20">
                    <el-col :span="12" :xs="24">
                        <el-form-item label="名称" prop="name">
                            <el-input v-model="paramForm.name" autocomplete="off" placeholder="最多可输入15个字" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" :xs="24">
                        <el-form-item label="英文名称" prop="variable">
                            <el-input v-model="paramForm.variable" autocomplete="off" placeholder="最多可输入15个字" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" :xs="24">
                        <el-form-item label="字段类型" prop="type">
                            <el-select v-model="paramForm.dataType" filterable placeholder="请选择" style="width: 100%;">
                                <el-option v-for="(v, k) in typeList" :key="k" :label="v.fieldName" :value="v.fieldType" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" :xs="24">
                        <el-form-item label="是否必填" prop="isEmpty">
                            <el-select v-model="paramForm.required" placeholder="请选择" style="width: 100%;">
                                <el-option label="否" :value="false" />
                                <el-option label="是" :value="true" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <div>
                    <h4 style="margin: 0 0 20px 25px; color: #589ef8;">映射值</h4>
                    <el-row v-for="(item, index) of paramForm.mapVal" :key="index" class="callTime" :gutter="25">
                        <el-col :span="12">
                            <el-form-item>
                                <el-input v-model="item.original" autocomplete="off" placeholder="原始参数" :disabled="paramType =='mapVal'" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item>
                                <el-input v-model="item.system" autocomplete="off" placeholder="对应的系统参数" :disabled="paramType =='mapVal'" />
                            </el-form-item>
                        </el-col>
                        <div v-if="paramType !=='mapVal'" style="line-height: 40px;" class="timeIcon">
                            <i v-if="index > 0" class="el-icon-delete" style="color: #e47470; font-size: 20px;" title="删除" @click="delMapVal(index)" />
                            <i v-if="index === 0 " class="el-icon-plus" style="color: #77b0f9; font-size: 20px;" title="添加" @click="addMapVal" />
                        </div>
                    </el-row>
                </div>
            </el-form>
            <div slot="footer" class="dialog-footer" style="text-align: center;">
                <el-button type="primary" size="small" @click="paramSubmit('paramForm')">保 存</el-button>
                <el-button type="danger" size="small" @click="paramDialog = false">取 消</el-button>
            </div>
        </el-dialog>
    </div>

</template>

<script>
    import draggable from 'vuedraggable'
    // import { jsPlumb } from 'jsplumb'
    // 使用修改后的jsplumb
    import './jsplumb'
    import { easyFlowMixin } from './mixins'
    import flowNode from './node'
    import nodeMenu from './node_menu'
    import FlowInfo from './info'
    import FlowHelp from './help'
    import FlowNodeForm from './node_form'
    import ScriptContent from './script_content'
    import { ForceDirected } from './force-directed'
    import { creatIvr, editIvr, getIvrData } from '@/api/ivrManage'
    import { cloneDeep, findLastIndex, assign, merge } from 'lodash'
    import { getGatewayGroupId, getSkills, getParamType, getTimbre, getTemList } from '@/api/common'
    import AuditionTimbre from './AuditionTimbre'
    export default {
        props: {
            id: {
                type: [Number, String]
            },
            // 页面状态 'edit':编辑、'detail':查看
            state: {
                type: String,
                default: ''
            },
            ivrData: {
                type: Object,
                default: null
            },
            closeBtn: {
                type: Boolean,
                default: true
            },
            baseUrl: String
        },
        data() {
            return {
                isZh: localStorage.language === 'zh',
                rmenu: false,
                rmenuLeft: 0,
                rmenuTop: 0,
                loading: false,
                flowTit: '新增流程',
                // jsPlumb 实例
                jsPlumb: null,
                // 控制画布销毁
                easyFlowVisible: true,
                // 控制流程数据显示与隐藏
                flowInfoVisible: false,
                // 是否加载完毕标志位
                loadEasyFlowFinish: false,
                flowHelpVisible: false,
                mapNum: 0,
                // 数据
                data: {},
                /**
                 * 出入参类型
                 */
                variableType: 'enter',
                // 激活的元素、可能是节点、可能是连线
                activeElement: {
                    // 可选值 node 、line
                    type: undefined,
                    // 节点ID
                    nodeId: undefined,
                    // 连线ID
                    sourceId: undefined,
                    targetId: undefined
                },
                zoom: 1,
                ttsSource: 'ali',
                initNode: {
                    id: '',   // 节点id
                    name: '', // 节点名称
                    type: '',  // 节点类型
                    left: '100px',
                    top: '100px',
                    ico: '',
                    state: 'success',
                    // 节点话术
                    nodeAudioText: '',
                    nodeAudioSrc: '',
                    // 按键错误
                    errAudioText: '',
                    errAudioSrc: '',
                    errTriggerNum: 1,
                    keyErrorEvent: 'HANG_UP',
                    // 开启出参
                    outputParamInfo: []
                },
                infoNode: {
                    // 信息收集
                    regularExpression: '',
                    apiUrl: '',
                    inputParamInfo: []
                },
                msgNode: {
                    // 留言节点
                    closeRecord: '',
                    recordingDuration: '15',
                },
                // 转接
                transferNode: {
                    bridgeType: 'robot',
                    bridgeId: '',
                },
                // 判断节点
                judgeNode: {
                    judgmentInfo: {
                        rule: 'all',
                        type: "[\"callTime\",\"workingDay\"]",
                        content: [
                            {
                                type: 'callTime',
                                preconditions: '',
                                rule: 'anyCondition',
                                conditions: "[{\"index\":1,\"condition\":\"4\",\"target\":\"08-00\"},{\"index\":1,\"condition\":\"5\",\"target\":\"20-00\"}]"
                            },
                            {
                                type: 'workingDay',
                                preconditions: '[2, 3, 4, 5, 6]',
                                rule: 'anyCondition',
                                conditions: "[{\"index\":1,\"condition\":\"4\",\"target\":\"08-00\"},{\"index\":1,\"condition\":\"5\",\"target\":\"20-00\"}]"
                            }
                        ]
                    },
                },
                // 标题表单
                flowForm: {
                    name: '',
                    descr: '',
                    speaker: 'aixia',
                    volume: 50,
                    speed: 0,
                    intonation: 0,
                    minBreakDuration: 500,
                    noInputJudgeDuration: 500,
                    keyErrorText: '',
                    keyErrorPath: '',
                    keyErrorEvent: 'HANG_UP',
                    keyErrorNumber: 1,
                    eventAudioFile: '',
                    eventAudioText: '',
                    params: [],
                    auditionContent: '您好，这里是音色试听，您好，这里是音色试听'
                },
                titDialog: false,
                // 展开收起右侧表单
                rightOpen: false,
                // tab切换
                activeName: 'flow',
                // 参数弹框开关
                paramDialog: false,
                // 参数弹框标题
                dialogTit: '添加输入参数',
                // 参数表单
                paramForm: {
                    name: '',
                    variable: ''
                },
                // 参数表单校验
                paramRules: {
                    name: [
                        { required: true, message: '请输入名称', trigger: 'blur' },
                        { min: 1, max: 15, message: '最多可输入15个字', trigger: 'blur' }
                    ],
                    variable: [
                        { required: true, message: '请输入英文名称', trigger: 'blur' },
                        { pattern: /^[a-zA-Z]{1,}\w*$/, message: '请输入正确的英文名称，以字母开头可包含数字下划线，不允许输入特殊字符', trigger: 'blur' }
                    ]
                },
                // 网关组数据
                gatewayGroup: [],
                // 机器人
                flowList: [],
                // 技能组
                groups: [],
                // 语音通知
                noticeList: [],
                // 参数类型
                typeList: [],
                nodeName: '',
                timbres: []
            }
        },
        // 一些基础配置移动该文件中
        mixins: [easyFlowMixin],
        components: {
            draggable, flowNode, nodeMenu, FlowInfo, FlowNodeForm, FlowHelp, ScriptContent, AuditionTimbre
        },
        directives: {
            'flowDrag': {
                bind(el, binding, vnode, oldNode) {
                    if (!binding) {
                        return
                    }
                    el.onmousedown = (e) => {
                        if (e.button == 2) {
                            // 右键不管
                            return
                        }
                        //  鼠标按下，计算当前原始距离可视区的高度
                        let disX = e.clientX
                        let disY = e.clientY
                        el.style.cursor = 'move'

                        document.onmousemove = function (e) {
                            // 移动时禁止默认事件
                            e.preventDefault()
                            const left = e.clientX - disX
                            disX = e.clientX
                            el.scrollLeft += -left

                            const top = e.clientY - disY
                            disY = e.clientY
                            el.scrollTop += -top
                        }

                        document.onmouseup = function (e) {
                            el.style.cursor = 'auto'
                            document.onmousemove = null
                            document.onmouseup = null
                        }
                    }
                }
            }
        },
        computed: {
            rules() {
                const validateNum = (rule, value, callback, text) => {
                    if (value < 0 || value > 100) {
                        callback(new Error('音量范围0～100'))
                    } else {
                        callback()
                    }
                }
                const validatePitch = (rule, value, callback) => {
                    if (value < -500 || value > 500) {
                        callback(new Error('语调范围-500～500'))
                    } else {
                        callback()
                    }
                }
                const validateSpeed = (rule, value, callback) => {
                    if (value < -500 || value > 500) {
                        callback(new Error('语速范围-500～500'))
                    } else {
                        callback()
                    }
                }
                const validateSpeedMt = (rule, value, callback) => {
                    if (value < 0 || value > 100) {
                        callback(new Error('语速范围0~100'))
                    } else {
                        callback()
                    }
                }
                return {
                    name: [
                        { required: true, message: '请输入表单名称', trigger: 'blur' }
                    ],
                    volume: [
                        { validator: validateNum, trigger: 'blur'}
                    ],
                    intonation: [
                        { validator: validatePitch, trigger: 'blur'}
                    ],
                    speed: [this.ttsSource === 'ali'
                        ? { validator: validateSpeed, trigger: 'blur'}
                        : { validator: validateSpeedMt, trigger: 'blur'}
                    ]
                }
            }
        },
        mounted() {
            document.addEventListener('click', this.closeRmenu)
            if (localStorage?.userInfo) {
                const userInfo = JSON.parse(localStorage.userInfo)
                if (userInfo.ttsSource) this.ttsSource = userInfo.ttsSource
                if (this.ttsSource === 'mt') this.flowForm.speed = 50
            }
            !this.state && this.initSpeaker()
            this.jsPlumb = jsPlumb.getInstance()
            this.getGatewayGroup()
            this.getGroup(true)
            this.getGroup(false)
            this.getNotice()
            this.getParamType()
            if (this.id) {
                this.renderIvr()
            } else {
                this.dataReload(this.data)
            }
        },
        methods: {
            closeRmenu() {
                this.rmenu = false
            },
            initSpeaker() {
                getTimbre(this.baseUrl).then(res => {
                    this.timbres = res.data
                    this.flowForm.speaker = res.data[0].code
                })
            },
            // 获取网关组id
            getGatewayGroup() {
                getGatewayGroupId(this.baseUrl).then(res => {
                    this.gatewayGroup = res.data
                })
            },
            // 获取技能组
            getGroup(type) {
                getSkills(this.baseUrl, {
                    companyId: localStorage.companyId,
                    isRobotFlag: type ? 1 : 0
                }).then(res => {
                    if (type) {
                        this.flowList = res.data
                    } else {
                        this.groups = res.data
                    }
                })
            },
            // 获取模版列表
            getNotice() {
                getTemList(this.baseUrl, {
                    companyId: localStorage.companyId
                }).then(res => {
                    if (res.data) this.noticeList = res.data
                })
            },
            formatTooltip(val) {
                return val * 3;
            },
            // 获取数据
            // 返回唯一标识
            getUUID() {
                return Math.random().toString(36).substr(3, 10)
            },
            jsPlumbInit() {
                this.jsPlumb.ready(() => {
                    // 导入默认配置
                    this.jsPlumb.importDefaults(this.jsplumbSetting)
                    // 会使整个jsPlumb立即重绘。
                    this.jsPlumb.setSuspendDrawing(false, true);
                    // 初始化节点
                    this.loadEasyFlow()
                    // 单点击了连接线, https://www.cnblogs.com/ysx215/p/7615677.html
                    this.jsPlumb.bind('click', (conn, originalEvent) => {
                        const mark = this.$refs.nodeForm.lineInit({
                            from: conn.sourceId,
                            to: conn.targetId,
                            label: conn.getLabel()
                        }, this.data)
                        this.rightOpen = true
                        if (!mark) return false
                        this.activeElement.type = 'line'
                        this.activeElement.sourceId = conn.sourceId
                        this.activeElement.targetId = conn.targetId
                        console.log('click line')
                        // this.$refs.nodeForm.lineInit({
                        //     from: conn.sourceId,
                        //     to: conn.targetId,
                        //     label: conn.getLabel()
                        // }, this.data)

                    })
                    // 连线
                    this.jsPlumb.bind("connection", (evt) => {
                        let from = evt.source.id
                        let to = evt.target.id
                        if (this.loadEasyFlowFinish) {
                            this.data.lineList.push({from: from, to: to})
                        }
                    })

                    // 删除连线回调
                    this.jsPlumb.bind("connectionDetached", (evt) => {
                        this.deleteLine(evt.sourceId, evt.targetId)
                    })

                    // 改变线的连接节点
                    this.jsPlumb.bind("connectionMoved", (evt) => {
                        this.changeLine(evt.originalSourceId, evt.originalTargetId)
                    })

                    // 连线右击
                    this.jsPlumb.bind("contextmenu", (conn, event) => {
                        console.log('contextmenu', conn)
                        console.log(event)
                        this.activeElement.type = 'line'
                        this.activeElement.sourceId = conn.sourceId
                        this.activeElement.targetId = conn.targetId
                        this.rmenu = true
                        this.rmenuLeft = event.pageX + 15
                        this.rmenuTop = event.pageY - 15
                    })

                    // 连线
                    this.jsPlumb.bind("beforeDrop", (evt) => {
                        let from = evt.sourceId
                        let to = evt.targetId
                        // if (from === to) {
                        //     this.$message.error('节点不支持连接自己')
                        //     return false
                        // }
                        if (this.hasLine(from, to)) {
                            this.$message.error('该关系已存在,不允许重复创建')
                            return false
                        }
                        // if (this.hashOppositeLine(from, to)) {
                        //     this.$message.error('不支持两个节点之间连线回环');
                        //     return false
                        // }
                        this.$message.success('连接成功')
                        return true
                    })

                    // beforeDetach
                    this.jsPlumb.bind("beforeDetach", (evt) => {
                        console.log('beforeDetach', evt)
                    })
                    this.jsPlumb.setContainer(this.$refs.efContainer)
                })
            },
            // 加载流程图
            loadEasyFlow() {
                // 初始化节点
                for (var i = 0; i < this.data.nodeList.length; i++) {
                    let node = this.data.nodeList[i]
                    // 设置源点，可以拖出线连接其他节点
                    this.jsPlumb.makeSource(node.id, merge(this.jsplumbSourceOptions, {}))
                    // // 设置目标点，其他源点拖出的线可以连接该节点
                    this.jsPlumb.makeTarget(node.id, this.jsplumbTargetOptions)
                    if (!node.viewOnly) {
                        this.jsPlumb.draggable(node.id, {
                            containment: 'parent',
                            stop: function (el) {
                                // 拖拽节点结束后的对调
                                console.log('拖拽结束: ', el)
                            }
                        })
                    }
                }
                // 初始化连线
                for (var i = 0; i < this.data.lineList.length; i++) {
                    let line = this.data.lineList[i]
                    var connParam = {
                        source: line.from,
                        target: line.to,
                        label: line.label ? line.label : '',
                        connector: line.connector ? line.connector : '',
                        anchors: line.anchors ? line.anchors : undefined,
                        paintStyle: line.paintStyle ? line.paintStyle : undefined,
                    }
                    this.jsPlumb.connect(connParam, this.jsplumbConnectOptions)
                }
                this.$nextTick(function () {
                    this.loadEasyFlowFinish = true
                })
            },
            // 设置连线条件
            setLineLabel(from, to, label) {
                var conn = this.jsPlumb.getConnections({
                    source: from,
                    target: to
                })[0]
                if (!conn) return this.$message.warning('请先选中一条线')
                if (!label || label === '') {
                    conn.removeClass('flowLabel')
                    conn.addClass('emptyFlowLabel')
                } else {
                    conn.addClass('flowLabel')
                }
                conn.setLabel({
                    label: label,
                })
                this.data.lineList.forEach(function (line) {
                    if (line.from == from && line.to == to) {
                        line.label = label
                    }
                })
                this.$message.success('保存成功')
            },
            // 删除激活的元素
            deleteElement() {
                if (this.activeElement.type === 'node') {
                    this.deleteNode(this.activeElement.nodeId, this.activeElement.nodeName)
                } else if (this.activeElement.type === 'line') {
                    this.$confirm('确定删除所点击的线吗?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        var conn = this.jsPlumb.getConnections({
                            source: this.activeElement.sourceId,
                            target: this.activeElement.targetId
                        })[0]
                        this.jsPlumb.deleteConnection(conn)
                        this.rightOpen = false
                        this.$refs.nodeForm.clearForm()
                    }).catch(() => {
                    })
                }
                this.activeElement.type = null
            },
            // 删除线
            deleteLine(from, to) {
                this.data.lineList = this.data.lineList.filter(function (line) {
                    if (line.from == from && line.to == to) {
                        return false
                    }
                    return true
                })
            },
            // 改变连线
            changeLine(oldFrom, oldTo) {
                this.deleteLine(oldFrom, oldTo)
            },
            // 改变节点的位置
            changeNodeSite(data) {
                for (var i = 0; i < this.data.nodeList.length; i++) {
                    let node = this.data.nodeList[i]
                    if (node.id === data.nodeId) {
                        node.left = data.left
                        node.top = data.top
                    }
                }
            },
            // 判断是否已有开始节点
            hasStart() {
                const mark = this.data.nodeList.some(node => node.type === 'start')
                return mark
            },
            nodeField(node, nodeMenu) {
                let nodeObj = null
                switch (nodeMenu.type) {
                    case 'infoCollection': nodeObj = {...node, ...this.infoNode}; break
                    case 'leaveMsg': nodeObj = {...node, ...this.msgNode}; break
                    case 'transfer': nodeObj = {...node, ...this.transferNode, ...this.infoNode}; break
                    case 'judge': nodeObj = {...node, ...this.judgeNode}; break
                }
                return nodeObj
            },
            /**
             * 拖拽结束后添加新的节点
             * @param evt
             * @param nodeMenu 被添加的节点对象
             * @param mousePosition 鼠标拖拽结束的坐标
             */
            addNode(evt, nodeMenu, mousePosition) {
                if (nodeMenu.type === 'start') {
                    let mark = this.hasStart()
                    if (mark) {
                        this.$message.warning('只能有一个开始节点')
                        return
                    }
                }
                var screenX = evt.originalEvent.clientX, screenY = evt.originalEvent.clientY
                let efContainer = this.$refs.efContainer
                var containerRect = efContainer.getBoundingClientRect()
                var left = screenX, top = screenY
                // 计算是否拖入到容器中
                if (left < containerRect.x || left > containerRect.width + containerRect.x || top < containerRect.y || containerRect.y > containerRect.y + containerRect.height) {
                    this.$message.error("请把节点拖入到画布中")
                    return
                }
                left = left - containerRect.x + efContainer.scrollLeft
                top = top - containerRect.y + efContainer.scrollTop
                // 居中
                left -= 85
                top -= 16
                var nodeId = nodeMenu.type==='start' ? '0' : this.getUUID()
                // 动态生成名字
                var origName = nodeMenu.name
                var nodeName = origName
                var index = 1
                while (index < 10000) {
                    var repeat = false
                    for (var i = 0; i < this.data.nodeList.length; i++) {
                        let node = this.data.nodeList[i]
                        if (node.name === nodeName) {
                            nodeName = origName + index
                            repeat = true
                        }
                    }
                    if (repeat) {
                        index++
                        continue
                    }
                    break
                }
                var node = {
                    id: nodeId,   // 节点id
                    name: nodeName, // 节点名称
                    type: nodeMenu.type,  // 节点类型
                    left: left + 'px',
                    top: top + 'px',
                    ico: nodeMenu.ico,
                    state: 'success',
                    // 节点话术
                    nodeAudioText: '',
                    nodeAudioSrc: '',
                    // 按键错误
                    errAudioText: '',
                    errAudioSrc: '',
                    errTriggerNum: 1,
                    keyErrorEvent: 'HANG_UP',
                    // 开启出参
                    outputParamInfo: []
                }
                if (nodeMenu.type !== 'start' && nodeMenu.type !== 'end' && nodeMenu.type !== 'keyInteraction') {
                    node = this.nodeField(node, nodeMenu)
                }
                /**
                 * 这里可以进行业务判断、是否能够添加该节点
                 */
                this.data.nodeList.push(node)
                this.$nextTick(function () {
                    this.jsPlumb.makeSource(nodeId, this.jsplumbSourceOptions)
                    this.jsPlumb.makeTarget(nodeId, this.jsplumbTargetOptions)
                    this.jsPlumb.draggable(nodeId, {
                        containment: 'parent',
                        stop: function (el) {
                            // 拖拽节点结束后的对调
                            console.log('拖拽结束: ', el)
                        }
                    })
                })
            },
            /**
             * 删除节点
             * @param nodeId 被删除节点的ID
             */
            deleteNode(nodeId, nodeName) {
                this.$confirm(`确定要删除【${nodeName}】节点？`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    closeOnClickModal: false
                }).then(() => {
                    /**
                     * 这里需要进行业务判断，是否可以删除
                     */
                    this.data.nodeList = this.data.nodeList.filter(function (node) {
                        if (node.id === nodeId) {
                            // 伪删除，将节点隐藏，否则会导致位置错位
                            // node.show = false
                            return false
                        }
                        return true
                    })
                    this.$nextTick(function () {
                        this.jsPlumb.removeAllEndpoints(nodeId);
                    })
                    this.rightOpen = false
                    this.$refs.nodeForm.clearForm()
                }).catch(() => {
                })
                return true
            },
            clickNode(nodeId) {
                const mark = this.$refs.nodeForm.nodeInit(this.data, nodeId)
                this.rightOpen = true
                if (!mark) return false
                this.activeElement.type = 'node'
                this.activeElement.nodeId = nodeId
            },
            rightClick(event, nodeId) {
                this.activeElement.type = 'node'
                this.activeElement.nodeId = nodeId
                this.activeElement.nodeName = event.target.innerText
                this.rmenu = true
                this.rmenuLeft = event.pageX + 30
                this.rmenuTop = event.pageY - 20
            },
            // 是否具有该线
            hasLine(from, to) {
                for (var i = 0; i < this.data.lineList.length; i++) {
                    var line = this.data.lineList[i]
                    if (line.from === from && line.to === to) {
                        return true
                    }
                }
                return false
            },
            // 是否含有相反的线
            hashOppositeLine(from, to) {
                return this.hasLine(to, from)
            },
            nodeRightMenu(nodeId, evt) {
                this.menu.show = true
                this.menu.curNodeId = nodeId
                this.menu.left = evt.x + 'px'
                this.menu.top = evt.y + 'px'
            },
            repaintEverything() {
                this.jsPlumb.repaint()
            },
            // 流程数据信息
            dataInfo() {
                this.flowInfoVisible = true
                this.$nextTick(function () {
                    this.$refs.flowInfo.init()
                })
            },
            // 编辑流程数据信息
            editDataInfo(newData) {
                this.flowInfoVisible = false
                this.dataReload(newData)
                this.$message.success('修改成功')
            },
            // 加载流程图
            dataReload(data) {
                this.easyFlowVisible = false
                this.data.nodeList = []
                this.data.lineList = []
                this.$nextTick(() => {
                    data = cloneDeep(data)
                    this.easyFlowVisible = true
                    this.data = data
                    this.$nextTick(() => {
                        this.jsPlumb = jsPlumb.getInstance()
                        this.$nextTick(() => {
                            this.jsPlumbInit()
                        })
                    })
                })
            },
            zoomAdd() {
                if (this.zoom >= 1.5) {
                    return
                }
                this.zoom = this.zoom + 0.1
                // this.$refs.efContainer.style.transform = `scale(${this.zoom})`
                this.jsPlumb.setZoom(this.zoom)
            },
            zoomSub() {
                if (this.zoom <= 0.5) {
                    return
                }
                this.zoom = this.zoom - 0.1
                // this.$refs.efContainer.style.transform = `scale(${this.zoom})`
                this.jsPlumb.setZoom(this.zoom)
            },
            // 下载数据
            downloadData() {
                this.$confirm('确定要下载该流程数据吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    closeOnClickModal: false
                }).then(() => {
                    var datastr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.data, null, '\t'));
                    var downloadAnchorNode = document.createElement('a')
                    downloadAnchorNode.setAttribute("href", datastr);
                    downloadAnchorNode.setAttribute("download", 'data.json')
                    downloadAnchorNode.click();
                    downloadAnchorNode.remove();
                    this.$message.success("正在下载中,请稍后...")
                }).catch(() => {
                })
            },
            openHelp() {
                this.flowHelpVisible = true
                this.$nextTick(function () {
                    this.$refs.flowHelp.init()
                })
            },
            // 清空
            resetFlow() {
                this.$confirm('确定清空吗?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.activeElement.type = null
                    this.dataReload(this.data)
                }).catch(() => {
                    this.$message.info('已取消')
                })
            },
            // 关闭
            closeDetailDialog() {
                this.$emit('onClose')
            },
            // 校验流程图是否正确
            validateFlow() {
                // 存放连线对象里的to，然后比对nodeList，判断是否有连线
                const lineIds = []
                // 存放end节点的id，用于对比连线是否指向结束节点
                const endIds = []
                // 存放判断节点id 判断节点必须两根线连向后两个节点
                const judgeIdMap = {}
                // 校验标志
                let vMark = false
                for (let item of this.data.nodeList) {
                    if (item.type === 'end') endIds.push(item.id)
                    if (item.type === 'judge') judgeIdMap[item.id] = 0
                }
                for (let line of this.data.lineList) {
                    if (!line.label) {
                        let mark = endIds.includes(line.to)
                        if (!mark) {
                            vMark = true
                            this.$message.error('除结束节点外，其他连线必需要设置按键')
                            return false
                        }
                    }
                    if (typeof judgeIdMap[line.from] == 'number') judgeIdMap[line.from] ++
                    lineIds.push(line.to)
                }
                for (let item of this.data.nodeList) {
                    if (!item.nodeAudioText && !item.nodeAudioSrc && item.type != 'judge') {
                        vMark = true
                        this.$message.error('所有节点的话术内容与录音内容至少有一项不能为空')
                        return false
                    }
                    let mark = lineIds.includes(item.id)
                    if (!mark && item.type !== 'start') {
                        vMark = true
                        this.$message.error(item.name + '节点没有连线')
                        return false
                    }
                    if (item.type == 'judge' && judgeIdMap[item.id] != 2) {
                        vMark = true
                        this.$message.error(`判断节点: ${item.name}, 必须连接两个节点`)
                        return false
                    }
                }
                if (!vMark) this.titDialog = true
            },
            // 保存流程
            saveFlow() {
                if (this.data.nodeList.length > 0 && this.data.lineList.length > 0) {
                    this.validateFlow()
                } else {
                    this.$message.error('请配置流程图后保存')
                }
            },
            // 将开始节点的id设为0
            initStartId() {
                let startId = ''
                this.data.nodeList.forEach(item => {
                    if (item.type === 'start') {
                        startId = item.id
                        item.id = '0'
                    }
                })
                this.data.lineList.forEach(item => {
                    if (item.from === startId) item.from = '0'
                })
            },
            titSubmit() {
                this.$refs.flowForm.validate(valid => {
                    if (valid) {
                        this.loading = true
                        const params = Object.assign({}, this.flowForm)
                        this.initStartId()
                        for (let i = 0; i < this.data.lineList.length; i++) {
                            let line = this.data.lineList[i]
                            line.label = {
                                '是': 'Y',
                                '否': 'N',
                                '任意键': '-1',
                                '直接跳转': '-2'
                            }[line.label] || line.label
                        }
                        params.content = JSON.stringify(this.data)
                        params.inputParams = this.flowForm.params ? JSON.stringify(this.flowForm.params) : '[]'
                        params.outputParams = this.flowForm.outputParams ? JSON.stringify(this.flowForm.outputParams) : '[]'

                        if (params.keyErrorPath && params.keyErrorText) {
                            params.keyErrorText = ''
                        }
                        delete params.param
                        if (this.state === 'edit') {
                            if (this.id) {
                                editIvr(this.baseUrl, this.id, params).then(() => {
                                    this.$message.success('编辑成功')
                                    this.titDialog = false
                                    this.$emit('onSave', res.data)
                                    this.loading = false
                                }).catch(() => {
                                    this.loading = false
                                })
                            } else {
                                this.$message.error('未获取到ID')
                            }
                        } else {
                            creatIvr(this.baseUrl, params).then(res => {
                                this.$message.success('保存成功')
                                this.titDialog = false
                                this.$emit('onSave', res.data)
                                this.loading = false
                            }).catch(() => {
                                this.loading = false
                            })
                        }
                        this.$refs.flowForm.clearValidate()
                    }
                })
                return false
            },
            // 获取入参类型
            getParamType() {
                getParamType(this.baseUrl).then(res => {
                    this.typeList = res.data
                    // this.paramForm.dataType = res.data[0].fieldType
                })
            },
            // 展开收起右侧表单
            handleForm() {
                this.rightOpen = !this.rightOpen
            },
            // 删除映射
            delMapVal(index) {
                this.mapNum--
                this.paramForm.mapVal.splice(index, 1)
            },
            // 添加映射
            addMapVal() {
                this.mapNum++
                this.$set(this.paramForm.mapVal, this.mapNum, {original: '', system: ''})
            },
            // 添加参数事件
            addParams(type) {
                this.paramType = type
                this.dialogTit = type !== 'out' ? '添加输入参数' : '添加输出参数'
                this.paramDialog = true
                this.paramStatus = 'add'
                this.mapNum = 0
                this.paramForm = {
                    name: '',
                    variable: '',
                    dataType: this.typeList && this.typeList[0]?.fieldType  ? this.typeList[0]?.fieldType : '',
                    required: false,
                    mapVal: [
                        {original: '', system: ''}
                    ]
                }
            },
            // 编辑参数
            editParam(row, index, type) {
                if (index !== null) {
                    this.paramType = type
                    this.paramDialog = true
                    this.paramStatus = 'edit'
                    this.dialogTit = type !== 'out' ? '编辑输入参数' : '编辑输出参数'
                    this.paramForm = assign({}, row)
                    if (!this.paramForm.mapVal) {
                        this.$set(this.paramForm, 'mapVal', [{original: '', system: ''}])
                        this.mapNum = 0
                    } else {
                        const len = this.paramForm.mapVal.length
                        this.mapNum = len - 1
                    }
                    this.paramForm.index = index
                    if (type === 'mapVal') this.dialogTit = '查看映射'
                }
            },
            // 删除参数
            delParam(index, variable) {
                if (index !== null) {
                    this.$confirm('确定删除吗？', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        // if (this.flowForm.nodeAudioText) {
                        //     this.flowForm.nodeAudioText = this.flowForm.nodeAudioText.replace(new RegExp(`{(${variable})}`, 'g'), '')
                        // }
                        // this.flowForm.outputParams
                        (this.variableType == 'enter' ? this.flowForm.params : this.flowForm.outputParams).splice(index, 1)
                        this.$message.success('已删除')
                    }).catch(() => {
                        this.$message({
                            type: 'info',
                            message: '已取消删除'
                        })
                    })
                }
            },
            /**
             * 新添、编辑参数公共部分
             * params：查重数组
             * text：’添加‘或者’编辑‘
             * isAdd：true/添加 false/编辑
             */
            onlyParam(params, text, isAdd) {
                console.log(isAdd)
                // 判断名称是否存在
                const name = this.paramForm.name
                const nameMark = findLastIndex(params, i => {
                    return i.name === name
                })
                if (nameMark === -1) { // 如果不存在
                    // 判断英文名称是否存在
                    const variable = this.paramForm.variable
                    const variableMark = findLastIndex(params, i => {
                        return i.variable === variable
                    })
                    if (variableMark === -1) { // 如果不存在，将数据存入
                        if (isAdd) { // 添加
                            (this.variableType == 'enter' ? this.flowForm.params : this.flowForm.outputParams).push(this.paramForm)
                            console.log(this.flowForm.outputParams)
                        } else { // 编辑
                            const index = this.paramForm.index
                            // 编辑时替换内容里的参数
                            // if (this.flowForm.nodeAudioText) {
                            //     this.flowForm.nodeAudioText = this.flowForm.nodeAudioText.replace(new RegExp(this.flowForm.params[index].variable, 'g'), variable)
                            // }
                            this.$set((this.variableType == 'enter' ? this.flowForm.params : this.flowForm.outputParams), index, this.paramForm)

                        }
                        this.paramDialog = false
                        this.$message.success(`${text}成功`)
                    } else { // 如果英文名称已存在
                        this.$message.error('英文名称不能重复')
                        return false
                    }
                } else { // 如果名称已存在
                    this.$message.error('名称不能重复')
                    return false
                }
            },
            // 新增参数提交事件
            paramSubmit(formName) {
                this.$refs[formName].validate(valid => {
                    if (valid) {
                        if (this.dialogTit.indexOf('添加') > -1) { // 添加输入参数
                            let currentParams = this.variableType == 'enter' ? this.flowForm.params : this.flowForm.outputParams
                            this.onlyParam(currentParams, '添加', true)
                        } else { // 编辑输入参数
                            const index = this.paramForm.index
                            let _params = [].concat(this.variableType == 'enter' ? this.flowForm.params : this.flowForm.outputParams)
                            _params.splice(index, 1)
                            this.onlyParam(_params, '编辑', false)
                        }
                        this.$refs[formName].clearValidate()
                    }
                })
                return false
            },
            // 处理默认字段
            handleNode(flowData) {
                const list = []
                for (let item of flowData.nodeList) {
                    item = Object.assign({}, this.initNode, item)
                    list.push(item)
                }
                flowData.nodeList = list
                return flowData
            },
            handleSpeaker() {
                getTimbre(this.baseUrl).then(res => {
                    this.timbres = res.data
                    const timbres = res.data
                    const mark = timbres.findIndex(item => item.code === this.flowForm.speaker)
                    if (mark < 0) this.flowForm.speaker = timbres[0]?.code
                })
            },
            // 渲染流程
            renderIvr() {
                getIvrData(this.baseUrl, this.id).then(res => {
                    const data = Object.assign({}, res.data)
                    const flowData = JSON.parse(data.content)
                    for (let i = 0; i < flowData.lineList.length; i++) {
                        let line = flowData.lineList[i]
                        line.label = {
                            'Y': '是',
                            'N': '否',
                            '-1': '任意键',
                            '-2': '直接跳转'
                        }[line.label] || line.label
                    }
                    this.flowTit = data.name
                    this.dataReload(this.handleNode(flowData))
                    this.flowForm = Object.assign({}, this.flowForm, data)
                    this.flowForm.speaker = this.flowForm.speaker || 'aixia'
                    // 参数
                    this.flowForm.params = data.inputParams && data.inputParams !== '[{}]' ? JSON.parse(data.inputParams) : []
                    this.flowForm.outputParams = data.outputParams && data.outputParams !== '[{}]' ? JSON.parse(data.outputParams) : []
                    delete this.flowForm.inputParams
                    this.handleSpeaker()
                })
            }
        }
    }
</script>

<style lang="scss" scoped>
.el-node-form-tag {
    position: absolute;
    margin: auto;
    top: 0;
    bottom: 0;
    margin-left: -15px;
    height: 40px;
    line-height: 40px;
    width: 15px;
    background-color: #fbfbfb;
    border: 1px solid rgb(220, 227, 232);
    border-right: none;
    z-index: 0;
    color: #ccc;
    cursor: pointer;
}
.flex-box {
    display: flex;
    justify-content: space-between;
}
.callTime {
    position: relative;
    .timeIcon {
        width: 20px;
        height: 40px;
        position: absolute;
        right: -20px;
        top: 3px;
    }
}
.ivrTabs {
    height: 42px;
    padding-left: 50px;
    display: inline-block;
    .tabItem {
        height: 42px;
        display: inline-block;
        padding: 0 10px;
        line-height: 42px;
        font-size: 14px;
        font-weight: bold;
        margin: 0 20px;
        cursor: default;
        &.active {
            border-bottom: 2px solid #3985f4;
            color: #3985f4;
        }
    }
}
.el-node-form-tag:hover {
    color: #999;
    background-color: #fafafa;
}
.rightForm {
    width: 400px;
}
.noWidth {
    width: 0;
}
.flowForm {
    ::v-deep .el-form-item {
        margin-bottom: 40px !important;
    }
}
.rMenu {
    position: absolute;
    z-index: 3;
    width: 150px;
    padding: 10px;
    box-shadow: 0 0 5px;
    text-align: center;
    background: #fff;
    border-radius: 5px;
    &::before {
        content: '';
        position: absolute;
        top: 15px;
        left: -5px;
        display: block;
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 5px;
        border-color: #fff #fff transparent transparent;
        transform: rotate(225deg);
        box-shadow: 2px -2px 2px #ccc;
    }
}
</style>
