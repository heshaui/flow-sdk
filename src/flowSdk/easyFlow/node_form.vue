<template>
    <div>
        <div class="ef-node-form">
            <div class="ef-node-form-header">
                编辑
            </div>
            <div class="ef-node-form-body">
                <el-form :model="node" ref="dataForm" :rules="nodeRules" v-show="type === 'node'">
                    <el-tabs v-model="activeName">
                        <el-tab-pane label="节点信息设置" name="first">
                            <el-form-item label="节点名称" prop="name" label-width="80px">
                                <el-input v-model="node.name" style="width: 193px;" placeholder="请输入节点名称" maxlength="20"></el-input>
                            </el-form-item>
                            <script-content
                                v-if="showContent()"
                                ref="textChild"
                                :form="{
                                    src: node.nodeAudioSrc,
                                    text: node.nodeAudioText,
                                    id: node.nodeAudioId
                                }"
                                :isRequired="node.nodeAudioSrc ? false : true"
                                :params="params"
                                :lain-list="lainList"
                                :baseUrl="baseUrl"
                                @success="src => node.nodeAudioSrc = src"
                                @delAudio="node.nodeAudioSrc = ''; node.nodeAudioId=''"
                                @changeText="text => node.nodeAudioText = text"
                                @getAudio="data => {node.nodeAudioSrc=data.src; node.nodeAudioId=data.id}"
                                @getLainId="id => node.nodeAudioId=id"
                            />
                            <!-- 转接 -->
                            <div v-if="node.type==='transfer'">
                                <el-form-item label="转接规则" label-width="96px">
                                    <el-select v-model="node.ruleType" style="width: 100%;" @change="ruleTypeChange">
                                        <el-option label="全部" value="" />
                                        <el-option label="按CRM信息" value="crmRule" />
                                        <el-option label="按归属地" value="ascriptionPlaceRule" />
                                        <el-option label="按URL请求" value="urlRule" />
                                        <el-option label="按收号信息" value="ivrParamsRule" />
                                    </el-select>
                                </el-form-item>
                                <el-row :gutter="20" style="margin-bottom: 15px;">
                                    <el-col :span="12">
                                        <el-form-item label="默认转接类型" label-width="96px">
                                            <el-select v-model="node.bridgeType" style="width: 100%;" @change="node.bridgeId=''">
                                                <!-- <el-option label="机器人" value="robot" /> -->
                                                <el-option label="语音通知" value="notice" />
                                                <el-option label="技能组" value="group" />
                                                <el-option label="网关组" value="gw" />
                                                <el-option label="ivr" value="ivr" />
                                                <el-option label="下一级节点" value="subordinateNode" />
                                                <el-option label="分机组" value="extension" />
                                            </el-select>
                                        </el-form-item>
                                    </el-col>
                                    <el-col v-if="node.bridgeType !== 'subordinateNode'" :span="12">
                                        <el-form-item label="默认转接目标" prop="bridgeId" label-width="110px">
                                            <el-select v-show="node.bridgeType === 'gw'" v-model="node.bridgeId" filterable placeholder="请选择" style="width: 100%;">
                                                <el-option v-for="(v, key) in gatewayGroup" :key="key" :label="v.name" :value="v.id" />
                                            </el-select>
                                            <el-select v-show="node.bridgeType === 'robot'" v-model="node.bridgeId" filterable placeholder="请选择" style="width: 100%;">
                                                <el-option v-for="(v, key) in flowList" :key="key" :label="v.name" :value="v.id" />
                                            </el-select>
                                            <el-select v-show="node.bridgeType === 'group'" v-model="node.bridgeId" filterable placeholder="请选择" style="width: 100%;">
                                                <el-option v-for="(v, key) in groups" :key="key" :label="v.name" :value="v.id" />
                                            </el-select>
                                            <el-select v-show="node.bridgeType === 'extension'" v-model="node.bridgeId" filterable placeholder="请选择" style="width: 100%;">
                                                <el-option v-for="(v, key) in extensionGroups" :key="key" :label="v.name" :value="v.id" />
                                            </el-select>
                                            <el-select v-show="node.bridgeType === 'notice'" v-model="node.bridgeId" filterable placeholder="请选择" style="width: 100%;">
                                                <el-option v-for="(v, key) in noticeList" :key="key" :label="v.name" :value="v.templateSn" />
                                            </el-select>
                                            <el-select v-show="node.bridgeType === 'ivr'" v-model="node.bridgeId" filterable placeholder="请选择" style="width: 100%;">
                                                <el-option style="width: 200px;" v-for="(v, key) in ivrList" :key="key" :label="v.name" :value="v.id" />
                                            </el-select>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                                <p v-show="node.ruleType === 'crmRule'" class="pTip">系统根据CRM字段信息中的值设定的转接类型进行转接，未涉及字段和值则会选用默认转接类型。</p>
                                <p v-show="node.ruleType === 'ascriptionPlaceRule'" class="pTip">系统会根据设定归属地对应的转接类型进行转接，未涉及归属地则会选用默认转接类型。</p>
                                <p v-show="node.ruleType === 'urlRule'" class="pTip">系统会根据接口返回值，转接对应的转接类型，返回失败则会选用默认转接目标。</p>
                                <p v-show="node.ruleType === 'ivrParamsRule'" class="pTip">系统根据变量信息中的值设定的转接类型进行转接，未涉及字段和值则会选用默认转接类型。</p>
                                <el-row v-if="node.bridgeType === 'gw'" :gutter="10">
                                    <el-col :span="12">
                                        <el-form-item label="主叫号码" label-width="96px">
                                            <el-select
                                                v-model="node.callerType"
                                                filterable
                                                placeholder="选择主叫"
                                                style="width: 100%;"
                                                @change="onTypeChange($event, 'caller')"
                                            >
                                                <el-option label="客户号码" value="custom" />
                                                <el-option label="自定义" value="auto" />
                                                <el-option
                                                    v-for="(v, key) in callerList"
                                                    :key="key"
                                                    :label="v.caller"
                                                    :value="v.caller"
                                                />
                                            </el-select>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="12">
                                        <el-form-item prop="caller">
                                            <el-input v-model="node.caller" placeholder="请输入主叫" :disabled="node.callerType !== 'auto'" />
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="12">
                                        <el-form-item label="被叫号码" label-width="96px">
                                            <el-select
                                                v-model="node.calledType"
                                                filterable
                                                placeholder="选择被叫"
                                                style="width: 100%;"
                                                @change="onTypeChange($event, 'called')"
                                            >
                                                <el-option label="客户号码" value="custom" />
                                                <el-option label="自定义" value="auto" />
                                                <el-option
                                                    v-for="(v, key) in callerList"
                                                    :key="key"
                                                    :label="v.caller"
                                                    :value="v.caller"
                                                />
                                            </el-select>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="12">
                                        <el-form-item prop="called">
                                            <el-input v-model="node.called" placeholder="请输入被叫" :disabled="node.calledType !== 'auto'" />
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                            </div>
                            <!-- 留言 -->
                            <div v-if="node.type === 'leaveMsg'">
                                <el-form-item label="录音时长(秒)" prop="recordingDuration" label-width="96px">
                                    <el-input-number placeholder="请输入录音时长(秒)" v-model.number="node.recordingDuration" :controls="false" style="width: 150px; margin-right: 10px;" />
                                    <span style="color: #409eff;">录音时长默认15秒</span>
                                </el-form-item>
                            </div>
                            <!-- 收号节点 -->
                            <!-- <div v-if="node.type==='infoCollection'">
                                <el-form-item label="输入信息" prop="regularExpression" :style="!node.nodeAudioSrc ? 'margin: -20px 0 0px;' : 'margin: 0;'">
                                    <el-input v-model="node.regularExpression" type="textarea" maxlength="200" rows="3"></el-input>
                                </el-form-item>
                                <p style="line-height: 25px;">提示：支持正则表达式，例如：固定号码：^1000$，批量号码：^(10[0-9][0-9])$，所有号码：^(.*)$，7位以上号码：^(.{7,})$等等</p>
                            </div> -->
                            <div v-if="node.type==='collectionNumber'">
                                <script-content
                                    ref="errTextChild"
                                    label="按键错误/超时提示"
                                    placeholder="请输入按键错误/超时提示"
                                    :form="{
                                        src: node.errAudioSrc,
                                        text: node.errAudioText,
                                        id: node.errAudioId
                                    }"
                                    :isRequired="node.errAudioSrc ? false : true"
                                    :params="params"
                                    :lain-list="lainList"
                                    :baseUrl="baseUrl"
                                    @success="src => node.errAudioSrc = src"
                                    @delAudio="node.errAudioSrc = '';node.errAudioId=''"
                                    @changeText="text => node.errAudioText = text"
                                    @getAudio="data => {node.errAudioSrc=data.src; node.errAudioId=data.id}"
                                    @getLainId="id => node.errAudioId=id"
                                />
                                <el-form-item label="最大收号失败次数" label-width="136px" prop="errTriggerNum">
                                    <el-input-number v-model="node.errTriggerNum" :precision="0" :controls="false" :min="1"/>
                                </el-form-item>
                                <el-form-item label="输入超时时长" label-width="136px" prop="noInputJudgeDuration">
                                    <el-input-number v-model="node.noInputJudgeDuration" :precision="0" :controls="false" :min="1"/> 秒
                                </el-form-item>
                                <el-form-item label="接收数值长度" label-width="136px" required>
                                    <el-select v-model="node.keyReceivingType" style="width: 180px; margin-right: 10px;">
                                        <el-option label="固定长度" :value="0" />
                                        <el-option label="最大长度" :value="1" />
                                        <el-option label="正则表达式" :value="2" />
                                    </el-select>
                                    <el-form-item v-if="node.keyReceivingType == 2" :rules="[{ required: true, message: '正则表达式不能为空'}]" prop="keyReceivingLength" style="display: inline-block;">
                                        <el-input v-model="node.keyReceivingLength" />
                                    </el-form-item>
                                    <el-form-item v-else prop="keyReceivingLength" style="display: inline-block;">
                                        <el-input-number v-model="node.keyReceivingLength" :precision="0" :controls="false" :min="1" :max="128"/> 位
                                    </el-form-item>
                                </el-form-item>
                                <p v-show="node.keyReceivingType === 0" class="pTip">固定长度适合接收固定位数的数值，数值输入达到固定位数后，自动进入下一环节</p>
                                <p v-show="node.keyReceivingType === 1" class="pTip">最大长度适合接收不超过设定的数值位数，数值输入完以#号键结束（提示音可提示输入#号按）</p>
                                <el-form-item label="存储到变量" label-width="136px">
                                    <el-input v-model="node.urn" placeholder="请输入字段名称(中文名称)" maxlength="20" style="width: 180px; margin-right: 10px;" />
                                    <el-input v-model="node.urk" placeholder="请输入参数名称(英文名称)" maxlength="20" style="width: 180px;" />
                                </el-form-item>
                            </div>
                            <!-- 信息收集与转接 -->
                            <div v-if="node.type==='infoCollection' || node.type==='transfer'">
                                <el-form-item v-if="node.type==='infoCollection' || node.ruleType === 'urlRule'" label="接口请求地址" label-width="110px" prop="apiUrl">
                                    <el-input v-model="node.apiUrl" placeholder="请输入接口请求地址" />
                                </el-form-item>
                                <el-row v-show="node.ruleType === 'urlRule'" :gutter="20">
                                    <el-col :span=12>
                                        <el-form-item label="字段名称" label-width="70px">
                                            <el-input v-model="node.urn" placeholder="请输入字段名称" maxlength="20"></el-input>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span=12>
                                        <el-form-item label="参数名称" label-width="70px">
                                            <el-input v-model="node.urk" placeholder="请输入参数名称" maxlength="20"></el-input>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                                <RuleList
                                    v-if="node.type==='transfer' && node.ruleType !== ''"
                                    :list="node.ruleList"
                                    :params="params"
                                    :gatewayGroup="gatewayGroup"
                                    :flowList="flowList"
                                    :groups="groups"
                                    :extensionGroups="extensionGroups"
                                    :noticeList="noticeList"
                                    :lain-list="lainList"
                                    :baseUrl="baseUrl"
                                    :ivrList="ivrList"
                                    :type="node.ruleType"
                                    :callerList="callerList"
                                    :receiveCodes="receiveCodes"
                                    @getRuleList="list => node.ruleList = list"
                                />
                                <div v-show="node.type==='infoCollection' || node.ruleType === 'urlRule'">
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
                                                        <el-dropdown-item command="3">收号信息</el-dropdown-item>
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
                                                <el-select v-if="scope.row.ctype == 1" v-model="scope.row.name" size="small" placeholder="请选择" @change="nameChange($event, scope.row, infoParams)">
                                                    <el-option v-for="(item, key) of infoParams" :key="`info_${key}`" :label="item.name" :value="item.name" :disabled="item.disabled" />
                                                </el-select>
                                                <el-select v-if="scope.row.ctype == 3" v-model="scope.row.name" size="small" placeholder="请选择" @change="nameChange($event, scope.row, receiveCodes)">
                                                    <el-option v-for="(item, key) of receiveCodes" :key="`info_${key}`" :label="item.name" :value="item.name" :disabled="item.disabled" />
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
                                </div>
                                <div v-show="node.type==='infoCollection' || node.ruleType !== ''">
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
                                                <el-select v-else v-model="scope.row.name" size="small" placeholder="请选择"  @change="nameChange($event, scope.row, comOutParams)">
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
                            <!-- 韵达判断 -->
                            <div v-if="node.type === 'yunDa'">
                                <el-form-item label="接口请求地址" label-width="100px">
                                    <el-input v-model="node.apiUrl" placeholder="请输入接口请求地址" />
                                </el-form-item>
                                <script-content
                                    ref="textChild"
                                    :form="{
                                        src: node.nodeAudioSrc,
                                        text: node.nodeAudioText,
                                        id: node.nodeAudioId
                                    }"
                                    :isRequired="node.nodeAudioSrc ? false : true"
                                    :params="params"
                                    :lain-list="lainList"
                                    :baseUrl="baseUrl"
                                    placeholder="请输入接口请求失败后的话术内容"
                                    @success="src => node.nodeAudioSrc = src"
                                    @delAudio="node.nodeAudioSrc = ''; node.nodeAudioId=''"
                                    @changeText="text => node.nodeAudioText = text"
                                    @getAudio="data => {node.nodeAudioSrc=data.src; node.nodeAudioId=data.id}"
                                    @getLainId="id => node.nodeAudioId=id"
                                />
                                <el-form-item label="网关组" label-width="56px">
                                    <el-select v-model="node.bridgeId" filterable placeholder="请选择">
                                        <el-option v-for="(v, key) in gatewayGroup" :key="key" :label="v.name" :value="v.id" />
                                    </el-select>
                                </el-form-item>
                            </div>
                            <div v-if="showComParams()" >
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
                        <el-tab-pane v-if="false" label="异常处理" name="second">
                            <h3>按键错误</h3>
                            <el-form-item label="连续触发次数">
                                <el-input-number v-model="node.errTriggerNum" :min="1"/>
                            </el-form-item>
                            <script-content
                                :form="{
                                    src: node.errAudioSrc,
                                    text: node.errAudioText,
                                    id: node.errAudioId
                                }"
                                :params="params"
                                :lain-list="lainList"
                                :baseUrl="baseUrl"
                                @success="src => node.errAudioSrc = src"
                                @delAudio="node.errAudioSrc = '';node.errAudioId=''"
                                @changeText="text => node.errAudioText = text"
                                @getAudio="data => {node.errAudioSrc=data.src; node.errAudioId=data.id}"
                                @getLainId="id => node.errAudioId=id"
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
                    <el-form-item align="center" label-width="0" style="margin-top: 20px;">
                        <el-button v-if="node.id" type="primary" icon="el-icon-check"  @click="save(false)">保存</el-button>
                    </el-form-item>
                </el-form>
                <el-form :model="line">
                    <el-form-item v-show="type === 'line'" label="按键值">
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
                    <el-form-item v-show="type === 'transferLine'" label="按键值">
                        <el-select v-model="line.label" style="width: 100%;" @change="saveLine">
                            <el-option label="直接跳转" value="直接跳转" />
                        </el-select>
                    </el-form-item>
                    <el-form-item v-show="type === 'judgeLine'" label="判断分支">
                        <el-select v-model="line.label" style="width: 100%;" @change="saveLine">
                            <el-option label="是" value="是" />
                            <el-option label="否" value="否" />
                        </el-select>
                    </el-form-item>
                    <el-form-item v-show="type === 'shLine'" label="收号节点">
                        <el-select v-model="line.label" style="width: 100%;" @change="saveLine">
                            <el-option label="成功" value="成功" />
                            <el-option label="失败" value="失败" />
                        </el-select>
                    </el-form-item>
                    <el-form-item v-show="type === 'mtLine'" label="多轮对话">
                        <el-select v-model="line.label" style="width: 100%;" @change="saveLine">
                            <el-option label="完成订单" value="完成订单" />
                            <el-option label="订单无法完成" value="订单无法完成" />
                            <el-option label="转人工" value="转人工" />
                            <el-option label="系统错误" value="系统错误" />
                        </el-select>
                    </el-form-item>
                </el-form>
            </div>
        </div>
    </div>

</template>

<script>
    import { cloneDeep, findIndex } from 'lodash'
    import { arrayGroupBy, getFocus } from './utils'
    import ScriptContent from './script_content.vue'
    import RuleList from './components/RuleList.vue'
    export default {
        components: { ScriptContent, RuleList },
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
            callerList: {
                type: Array,
                default: () => []
            },
            baseUrl: String
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
                    { name: '主叫号码', variable: 'caller', disabled: false },
                    { name: '被叫号码', variable: 'called', disabled: false },
                    { name: '通话开始时间', variable: 'createdTime', disabled: false },
                    { name: '收键信息', variable: 'collectResults', disabled: false }
                ],
                // 存放出入参
                oldInputParams: [],
                oldOutputParams: [],
                comOutParams: [],
                // 存放判断条件
                oldJudgeType: [],
                openTts: 1,
                dataRules: {
                    name: { required: true, message: '请输入节点名称', trigger: 'blur'},
                    regularExpression: { validator: regValid, trigger: 'blur' },
                    bridgeId: { required: true, message: '请选择默认转接目标', trigger: 'change'},
                    recordingDuration: { type: 'number', message: '录音时长必须为数字值', trigger: 'blur'},
                    keyReceivingLength: { required: true, message: '按键收集长度不能为空', trigger: 'blur'},
                    noInputJudgeDuration: { required: true, message: '超时时长不能为空', trigger: 'blur'},
                    errTriggerNum: { required: true, message: '失败次数不能为空', trigger: 'blur'},
                    apiUrl: { required: true, message: '接口地址不能为空', trigger: 'blur'}
                },
                // 存放收号信息变量
                receiveCodes: []
            }
        },
        watch: {
            'outParams': {
                handler() {
                    this.comOutParams = cloneDeep(this.outParams)
                },
                deep: true
            }
        },
        computed: {
            nodeRules() {
                return {
                    ...this.dataRules,
                    caller: this.node.callerType === 'auto' ? { required: true, message: '请输入主叫号码', trigger: 'blur'} : {},
                    called: this.node.calledType === 'auto' ? { required: true, message: '请输入被叫号码', trigger: 'blur'} : {}
                }
            }
        },
        mounted() {
            if (this.nodeData) this.data = this.nodeData
            this.initForm()
        },
        methods: {
            initForm() {
                const userInfo = JSON.parse(localStorage.userInfo)
                this.openTts = userInfo.openTts ?? 1
            },
            isRequired(param) {
                let _param = this.outParams.find(op => op.variable == param.name)
                return (param.name && _param && _param.required)
            },
            // 是否显示对话内容
            showContent() {
                if (this.node.type != 'judge'
                    && this.node.type != 'yunDa'
                    && this.node.type !== 'infoCollection') {
                    return true
                }
                return false
            },
            // 是否需要对话内容
            contentCheck() {
                if (this.node.type != 'judge'
                    && this.node.type !== 'infoCollection') {
                    return true
                }
                return false
            },
            // 是否显示添加参数
            showComParams() {
                if (this.node.type !== 'judge'
                    && this.node.type !=='infoCollection'
                    && this.node.type!=='transfer'
                    && this.node.type!=='moreTalk'
                    && this.node.type!=='yunDa'
                    && this.node.type !== 'collectionNumber') {
                    return true
                }
                return false
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
                this.receiveCodes = []
                data.nodeList.filter((node) => {
                    if (node.id === id) {
                        this.node = cloneDeep(node)
                        this.$set(this.node, 'outputParamInfo', this.node.outputParamInfo?.length ?  this.node.outputParamInfo : this.node.type==='infoCollection' || (this.node.type==='transfer' && this.node.ruleType === 'urlRule') ? [
                            { name: '接口出参',  variable: 'result', value: '', id: new Date().getTime()}
                        ]: [])
                        if(this.node.type === 'judge') {
                            this.node.judgmentInfo = this.initJudge('parse')
                            this.oldJudgeType = this.node.judgmentInfo.type
                        }
                    }
                    if (node.type === 'collectionNumber' && node.urk && node.urn) {
                        const mark = this.receiveCodes.findIndex(item => item.variable === node.urk)
                        mark < 0 && this.receiveCodes.push({name: node.urn, variable: node.urk, disabled: false})
                    }
                })
                return true
            },
            // 规则类型改变事件
            ruleTypeChange(type) {
                this.node.ruleList = []
                if (type === 'urlRule') {
                    this.node.outputParamInfo.unshift({ name: '接口出参',  variable: 'result', value: '', id: new Date().getTime()})
                } else {
                    this.node.outputParamInfo = this.node.outputParamInfo.filter(item =>  item.variable !== 'result' && item.name !== '接口出参')
                }
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
                    } else if (this.line.from == node.id && node.type == 'moreTalk') {
                        this.type = 'mtLine'
                    } else if (this.line.from == node.id && (node.type === 'transfer' || node.type === 'infoCollection')) {
                        this.type = 'transferLine'
                    } else if (this.line.from === node.id && node.type == 'collectionNumber') {
                        this.type = 'shLine'
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
                if (ptype === 'input' && ctype == 3 && !this.receiveCodes.length) {
                    this.$message.info('无收号信息参数，请选择自定义')
                    return
                }
                this.oldInputParams = cloneDeep(this.node.inputParamInfo)
                this.oldOutputParams = cloneDeep(this.node.outputParamInfo)
                ctype == 2 && ptype == 'input' && this.infoPValid(this.infoParams)
                ctype == 3 && ptype == 'input' && this.infoPValid(this.receiveCodes)
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
            infoPValid(targetParams) {
                for (let p of targetParams) {
                    let mark = findIndex(this.node.inputParamInfo, item => item.name === p.name)
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
            nameChange(val, row, targetArr) {
                for(let item of targetArr) {
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
            // 校验数据
            saveCheck() {
                let mark = null
                this.$refs.dataForm.validate(valid => {
                    if (!valid) {
                        mark = false
                        getFocus()
                    } else {
                        this.$refs.dataForm.clearValidate()
                        mark = true
                    }
                })
                return mark
            },
            save(noMsg) {
                this.node.state = 'error'
                this.data.nodeList.filter((node) => {
                    if (node.id === this.node.id) {
                        node.state = this.node.state
                    }
                })
                if (this.contentCheck()) {
                    if (!this.$refs.textChild.validateForm()) {
                        getFocus()
                        return
                    }
                }
                if (this.node.type === 'collectionNumber') {
                    if (!this.$refs.errTextChild.validateForm()) {
                        getFocus()
                        return
                    }
                }
                if (!this.saveCheck()) return
                try {
                    if (this.node.regularExpression && eval(`/${this.node.regularExpression}/`) instanceof RegExp === false ) {
                        this.$message.error('请输入正确的正则')
                        return
                    }
                } catch(err) {
                    this.$message.error('请输入正确的正则')
                    return
                }
                if (this.openTts) {
                    if (!this.node.nodeAudioText && !this.node.nodeAudioSrc && this.contentCheck()) {
                        this.$message.error('话术内容与录音内容至少有一项不能为空')
                        return
                    }
                } else {
                    if (!this.node.nodeAudioSrc && this.contentCheck()) {
                        this.$message.error('录音不能为空')
                        return
                    }
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
                if (this.node.type == 'leaveMsg') {
                    if (!(/^\d+$/.test(this.node.recordingDuration))) {
                        return this.$message.warning('录音时长只能填写数字')
                    }
                }
                this.node.state = 'success'
                this.data.nodeList.filter((node) => {
                    if (node.id === this.node.id) {
                        node.name = this.node.name
                        node.left = this.node.left
                        node.top = this.node.top
                        node.ico = this.node.ico
                        node.state = this.node.state
                        node.nodeAudioText = this.node.nodeAudioText
                        node.nodeAudioSrc = this.node.nodeAudioSrc
                        node.nodeAudioId = this.node.nodeAudioId
                        node.errAudioText = this.node.errAudioText
                        node.errAudioSrc = this.node.errAudioSrc
                        node.errAudioId = this.node.errAudioId
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
                                node.ruleType = this.node.ruleType
                                node.ruleList = cloneDeep(this.node.ruleList)
                                node.urn = this.node.urn
                                node.urk = this.node.urk
                                node.apiUrl =  this.node.apiUrl
                                node.inputParamInfo = cloneDeep(this.node.inputParamInfo)
                                node.caller = this.node.caller
                                node.called = this.node.called
                                node.callerType = this.node.callerType
                                node.calledType = this.node.calledType
                                break
                            case 'judge': node.judgmentInfo = cloneDeep(this.initJudge('stringify')); break
                            case 'yunDa':
                                node.apiUrl = this.node.apiUrl
                                node.bridgeId = this.node.bridgeId
                                break
                            case 'collectionNumber':
                                node.noInputJudgeDuration = this.node.noInputJudgeDuration
                                node.keyReceivingType = this.node.keyReceivingType
                                node.keyReceivingLength = this.node.keyReceivingLength
                                node.urk = this.node.urk
                                node.urn = this.node.urn
                                node.keyErrorEvent = 'COLLECTION_FAILED'
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
            },
            // 主叫/被叫类型change事件
            onTypeChange(val, type) {
                if (val !== 'custom' && val !== 'auto') {
                    this.node[type] = val
                } else if (val === 'custom') {
                    this.node[type] = ''
                }
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
    .pTip {
        font-size: 12px;
        color: #888;
        margin-top: -15px;
        text-align: justify;
    }
</style>
